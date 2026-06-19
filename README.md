# 📄 AI Resume Analyzer 

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://ai-resume-analyzer-buildsbysaif.netlify.app/)
[![Python](https://img.shields.io/badge/Python-3.x-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-Backend-black.svg)](https://flask.palletsprojects.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

An intelligent, full-stack application designed to bridge the gap between a candidate's resume and a potential job description, providing instant, actionable feedback to help job seekers optimize their applications.

![AI Resume Analyzer Demo GIF](frontend/assets/demo.gif)

## 💡 The "Why" Behind the Project

While preparing for technical placements, I spent hours manually cross-referencing my resume against various job descriptions to identify missing keywords. I realized this repetitive process could be automated. I built the AI Resume Analyzer to solve this real-world pain point, providing data-driven insights while simultaneously deepening my expertise in full-stack development, API integration, and application deployment. 

## ✨ Key Features

* **Flexible Data Parsing:** Seamlessly accepts both PDF uploads and raw text inputs for resumes and job descriptions using PyMuPDF.
* **Semantic AI Analysis:** Leverages the **Google Gemini AI API** to perform deep contextual comparisons rather than simple keyword matching, generating an accurate compatibility score.
* **Actionable Skill Gap Identification:** Intelligently categorizes and extracts both matched skills and critical missing requirements.
* **Interactive Data Visualization:** Features a dynamic, responsive UI with a visual score breakdown powered by Chart.js.
* **Integrated Learning Paths:** Missing skills are clickable, triggering an AI-generated concise definition and fetching a high-quality tutorial link to encourage immediate upskilling.
* **Automated PDF Reporting:** Users can export a cleanly formatted PDF report of their analysis (via jsPDF) for future reference.

## 🛠️ Technical Architecture

| Component      | Technologies Used                                      |
| -------------- | ------------------------------------------------------ |
| **Frontend**   | HTML5, CSS3, Vanilla JavaScript, Chart.js, jsPDF       |
| **Backend**    | Python, Flask, Gunicorn, PyMuPDF                       |
| **AI Engine**  | Google Gemini API (`google-genai` SDK)                 |
| **Deployment** | Netlify (Frontend UI), Render (Backend API)            |

## 📁 Folder Structure

```text
📦 ai-resume-analyzer
├── 📂 backend/
│   ├── 📄 .env                 # Environment variables (API Key)
│   ├── 📄 app.py               # Main Flask application & API routes
│   └── 📄 requirements.txt     # Python dependencies
├── 📂 frontend/
│   ├── 📂 assets/              # Demo GIFs and images
│   ├── 📄 index.html           # Main user interface
│   ├── 📄 script.js            # Frontend logic & state management
│   └── 📄 style.css            # UI styling
├── 📄 .gitignore               # Files to ignore in Git
└── 📄 README.md                # Project documentation


## 🚧 Challenges Overcome & Technical Learnings

Building this application provided hands-on experience in debugging complex, real-world systems:

* **API Stability & Migration:** Initially experimented with open-source models via the Hugging Face Inference API but encountered persistent routing errors. I pivoted to the Google Gemini API for superior stability. Recently, I proactively migrated the backend from the deprecated `google-generativeai` package to the modern `google-genai` SDK to resolve breaking changes and ensure long-term application health.
* **Environment & Network Debugging:** Diagnosed a critical issue where the local Flask server would hang without receiving requests. Traced the root cause to local antivirus software silently blocking the port, reinforcing the importance of checking the entire network environment, not just the codebase.
* **State Management in Vanilla JS:** Engineered a solution to temporarily store the backend AI JSON response in the frontend state, allowing a separate asynchronous function to parse the data into structured tables for the PDF export feature.

## 💻 Local Setup & Installation

```bash
# To run this application locally, ensure you have Python installed, then follow these steps:

# 1. Clone the repository:
git clone [https://github.com/buildsbysaif/ai-resume-analyzer.git](https://github.com/buildsbysaif/ai-resume-analyzer.git)

# 2. Navigate to the backend directory:
cd ai-resume-analyzer/backend

# 3. Set up the virtual environment:
python -m venv .venv

# 4. Activate the virtual environment (Windows):
source .venv/Scripts/activate  
# (Or use this command if on Mac/Linux):
# source .venv/bin/activate    

# 5. Install dependencies:
pip install -r requirements.txt

# 6. Configure Environment Variables:
# Create a .env file to hold your Google Gemini API key:
echo 'GOOGLE_API_KEY="your_actual_api_key_here"' > .env

# 7. Start the backend server:
python app.py

# 8. Launch the Frontend:
# Open the frontend/index.html file in your preferred web browser to use the app.

## 🚀 Future Improvements

* Implement JWT-based user authentication to allow users to save and track their analysis history over time.
* Integrate an automated cover letter snippet generator tailored to the specifically matched skills.