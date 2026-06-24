import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import json
from google import genai
import fitz  

load_dotenv()

app = Flask(__name__)
CORS(app) 

client = None
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in .env file.")
    client = genai.Client(api_key=api_key)
except Exception as e:
    print(f"Error initializing Google Gemini client: {e}")

def extract_text_from_pdf(pdf_file):
    """Reads a PDF file stream and returns its text content."""
    try:
        pdf_document = fitz.open(stream=pdf_file.read(), filetype="pdf")
        text = "".join(page.get_text() for page in pdf_document)
        return text
    except Exception as e:
        print(f"Error reading PDF file: {e}")
        return None

def generate_analysis_prompt_google(resume_text, job_description_text):
    """Creates the detailed prompt for the Google Gemini model."""
    return f"""
    Analyze the provided resume against the job description. Your task is to return ONLY a single, minified JSON object with three keys: "matched_skills", "missing_skills", and "score".
    - "matched_skills": A list of skills present in BOTH the resume and the job description.
    - "missing_skills": A list of skills required by the job description but MISSING from the resume.
    - "score": An integer match score from 0 to 100.
    Do not include any other text, explanations, or markdown formatting like ```json.

    JOB DESCRIPTION:
    {job_description_text}
    ---
    RESUME:
    {resume_text}
    ---
    """


def call_gemini_with_fallback(prompt):
    """
    Tries multiple Google models to bypass 503 High Demand server outages.
    """
    models_to_try = [
        'gemini-3.1-flash-lite',  
        'gemini-2.5-flash',      
        'gemini-3.5-flash'    
    ]
    
    last_exception = None
    
    for attempt, model_name in enumerate(models_to_try):
        try:
            print(f"Attempting API call with model: {model_name}...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            print(f"✅ Success with {model_name}!")
            return response
            
        except Exception as e:
            error_msg = str(e)
            last_exception = e
            print(f"❌ Failed with {model_name}: {error_msg}")
            
            if "503" in error_msg or "UNAVAILABLE" in error_msg or "429" in error_msg:
                time.sleep(2)
                continue
            else:
                raise e
                
    raise Exception("All Gemini models are currently experiencing severe high demand. Google servers are at maximum capacity.")


# Health Check Route to prevent 404 on Render 
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "Success", "message": "Resume Analyzer API is running successfully!"}), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_skills():
    if not client:
        return jsonify({"error": "Google Gemini client not initialized. Check your API key."}), 500

    # Handle Resume Input
    resume_text = None
    if 'resume_pdf' in request.files:
        resume_text = extract_text_from_pdf(request.files['resume_pdf'])
    elif 'resume_text' in request.form:
        resume_text = request.form['resume_text']
    else:
        return jsonify({"error": "Resume is required."}), 400

    # Handle JD Input
    job_description_text = None
    if 'jd_pdf' in request.files:
        job_description_text = extract_text_from_pdf(request.files['jd_pdf'])
    elif 'jd_text' in request.form:
        job_description_text = request.form['jd_text']
    else:
        return jsonify({"error": "Job description is required."}), 400
    
    try:
        prompt = generate_analysis_prompt_google(resume_text, job_description_text)
        response = call_gemini_with_fallback(prompt)
        
        response_text = response.text
        json_start_index = response_text.find('{')
        json_end_index = response_text.rfind('}') + 1
        
        if json_start_index == -1 or json_end_index == 0:
            raise ValueError("No JSON object found in the AI response.")
        
        json_string = response_text[json_start_index:json_end_index]
        result_json = json.loads(json_string)
        
        analysis_result = {
            "matched_skills": result_json.get("matched_skills", []),
            "missing_skills": result_json.get("missing_skills", []),
            "score": result_json.get("score", 0)
        }
        return jsonify(analysis_result)

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": str(e)}), 503


def generate_skill_prompt_google(skill_name):
    """Creates a prompt to get info about a specific skill."""
    return f"""
    Provide a concise, one-sentence description for the technical skill "{skill_name}".
    Then, provide one high-quality, free tutorial link for it.
    Return ONLY a single minified JSON object with this exact structure:
    {{
      "description": "<one-sentence description>",
      "link": "<url>"
    }}
    Do not include any other text or markdown.
    """

@app.route('/api/skill_info', methods=['POST'])
def get_skill_info():
    if not client:
        return jsonify({"error": "Google Gemini client not initialized."}), 500
    
    data = request.json
    skill_name = data.get('skill')

    if not skill_name:
        return jsonify({"error": "Skill name is required."}), 400

    try:
        prompt = generate_skill_prompt_google(skill_name)
        response = call_gemini_with_fallback(prompt)
        
        response_text = response.text
        json_start_index = response_text.find('{')
        json_end_index = response_text.rfind('}') + 1
        json_string = response_text[json_start_index:json_end_index]
        result_json = json.loads(json_string)
        
        return jsonify(result_json)
    
    except Exception as e:
        print(f"An error occurred in get_skill_info: {e}")
        return jsonify({"error": "Failed to get skill information from AI."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)