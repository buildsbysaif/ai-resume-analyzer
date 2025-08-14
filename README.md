# AI Resume Analyzer 📄✨

**Live Demo:** [Your Live Netlify URL Here]

An intelligent tool designed to bridge the gap between a candidate's resume and a potential job, providing instant, actionable feedback to help job seekers land their next role.

![AI Resume Analyzer Demo GIF](your-gif-link-here.gif)

## Inspiration & Purpose

As a final-year student preparing for placements, I found myself spending hours manually comparing my resume to different job descriptions, trying to figure out which key skills were missing. It was a repetitive and time-consuming process. This personal pain point sparked the idea for the AI Resume Analyzer: a practical tool to automate this analysis, saving time and providing clear, data-driven insights. My goal was to build a full-stack application that not only solved a real problem for myself and my peers but also allowed me to deepen my skills in backend development and AI API integration.

## Key Features

* **Flexible Inputs:** Users can either upload a PDF or paste raw text for both their resume and the job description.
* **AI-Powered Analysis:** Leverages the Google Gemini API to perform a deep semantic analysis, calculating a match score.
* **Skill Gap Identification:** Intelligently extracts and displays both matched and missing skills from the job description.
* **Interactive UI:** Features a dynamic score chart built with Chart.js and a professional, responsive user interface.
* **Clickable Learning Resources:** Missing skills are clickable, opening a pop-up with an AI-generated description and a link to a learning resource.
* **PDF Export:** Users can download a formatted PDF report of their analysis for their records.

## Tech Stack

| Category      | Technologies                                       |
| ------------- | -------------------------------------------------- |
| **Frontend**  | HTML5, CSS3, Vanilla JavaScript, Chart.js, jsPDF   |
| **Backend**   | Python, Flask, Gunicorn                            |
| **AI API**    | Google Gemini API                                  |
| **Libraries** | PyMuPDF (for PDF parsing)                          |
| **Deployment**| Frontend on Netlify, Backend on Render             |

## Challenges & Learnings

Building this project was a fantastic learning experience, especially in overcoming real-world development hurdles.

* **Pivoting Between AI Services:** My initial plan was to use a free, open-source model via the Hugging Face Inference API. However, I ran into persistent and difficult-to-diagnose `404 Not Found` errors, even with verified model URLs. This was a significant challenge that taught me the importance of robustly debugging third-party APIs. After confirming my code was correct, I made the pragmatic decision to pivot. I successfully refactored the backend to integrate the Google Gemini API, which proved to be far more stable and reliable for this project's needs. This experience was a powerful lesson in adaptability.

* **Debugging Local Environment Issues:** At one point, my running server in debug mode would receive no requests from the browser, causing the app to hang. After a thorough investigation, I discovered the root cause was not my code, but my local antivirus software silently blocking the connection. This taught me to consider the entire development environment—not just the code—when troubleshooting, a crucial lesson for any developer.

* **Frontend Data Handling:** Implementing the PDF export feature was a great challenge. I learned how to store the API response in a state variable on the frontend, which could then be accessed by a separate function to generate a report with jsPDF and jsPDF-AutoTable, creating structured tables from the skill data.

## Local Setup

To run this project on your own machine, follow these steps:

1.  Clone the repository:
    `git clone https://github.com/your-username/ai-resume-analyzer.git`
2.  Navigate to the backend directory:
    `cd ai-resume-analyzer/backend`
3.  Create and activate a Python virtual environment.
4.  Install the required dependencies:
    `pip install -r requirements.txt`
5.  Create a `.env` file in the `backend` folder and add your Google API Key:
    `GOOGLE_API_KEY="your_api_key_here"`
6.  Run the Flask server:
    `python app.py`
7.  Open the `frontend/index.html` file in your browser to use the application.

## Future Improvements

* Implement user accounts to allow users to save and track their analysis history for different jobs.
* Add a feature to generate a custom cover letter snippet based on the matched skills.