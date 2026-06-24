# 📄 AI Resume Analyzer

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://ai-resume-analyzer-buildsbysaif.netlify.app/)
[![Python](https://img.shields.io/badge/Python-3.x-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-Backend-black.svg)](https://flask.palletsprojects.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

An intelligent, full-stack application designed to bridge the gap between a candidate's resume and a potential job description, providing instant, actionable feedback to help job seekers optimize their applications.

![AI Resume Analyzer Demo GIF](frontend/assets/demo.gif)

---

## 💡 The "Why" Behind the Project

While preparing for technical placements, I spent hours manually cross-referencing my resume against various job descriptions to identify missing keywords. I realized this repetitive process could be automated. I built the AI Resume Analyzer to solve this real-world pain point, providing data-driven insights while simultaneously deepening my expertise in full-stack development, API integration, and application deployment.

---

## ✨ Key Features

* **Flexible Data Parsing:** Seamlessly accepts both PDF uploads and raw text inputs for resumes and job descriptions using PyMuPDF.
* **Semantic AI Analysis:** Leverages the **Google Gemini AI API** to perform deep contextual comparisons rather than simple keyword matching, generating an accurate compatibility score.
* **Actionable Skill Gap Identification:** Intelligently categorizes and extracts both matched skills and critical missing requirements.
* **Interactive Data Visualization:** Features a dynamic, responsive UI with a visual score breakdown powered by Chart.js.
* **Integrated Learning Paths:** Missing skills are clickable, triggering an AI-generated concise definition and fetching a high-quality tutorial link to encourage immediate upskilling.
* **Automated PDF Reporting:** Users can export a cleanly formatted PDF report of their analysis using jsPDF.

---

## 🛠️ Technical Architecture

| Component      | Technologies Used                                |
| -------------- | ------------------------------------------------ |
| **Frontend**   | HTML5, CSS3, Vanilla JavaScript, Chart.js, jsPDF |
| **Backend**    | Python, Flask, Gunicorn, PyMuPDF                 |
| **AI Engine**  | Google Gemini API (`google-genai` SDK)           |
| **Deployment** | Netlify (Frontend UI), Render (Backend API)      |

---

## 📁 Folder Structure

```text
📦 ai-resume-analyzer
├── 📂 backend/
│   ├── 📄 .env
│   ├── 📄 app.py
│   └── 📄 requirements.txt
├── 📂 frontend/
│   ├── 📂 assets/
│   ├── 📄 index.html
│   ├── 📄 script.js
│   └── 📄 style.css
├── 📄 .gitignore
└── 📄 README.md
```

---

## 🚧 Challenges Overcome & Technical Learnings

### API Stability & Fallback Engineering

Initially encountered `503 Service Unavailable` errors during periods of high global demand on Google's free-tier Gemini API. To solve this, I engineered an enterprise-style model fallback chain in Python that automatically catches rate-limit errors and reroutes requests to alternative models, ensuring uninterrupted service for end users.

### SDK Migration

Proactively migrated the backend from the deprecated `google-generativeai` package to the modern `google-genai` SDK to resolve breaking changes and ensure long-term maintainability.

### Environment & Network Debugging

Diagnosed a critical issue where the local Flask server would hang without receiving requests. Traced the root cause to local antivirus software silently blocking the port, reinforcing the importance of debugging the full environment rather than only the codebase.

### State Management in Vanilla JavaScript

Engineered a frontend state-management solution to temporarily store AI-generated JSON responses, enabling asynchronous parsing and structured PDF report generation.

---

## 💻 Local Setup & Installation

To run this application locally, ensure Python is installed, then follow these steps.

### Prerequisites

* Python 3.10+
* Git
* Google Gemini API Key

### 1. Clone the Repository

```bash
git clone https://github.com/buildsbysaif/ai-resume-analyzer.git
cd ai-resume-analyzer/backend
```

### 2. Create and Activate a Virtual Environment

#### Windows

```bash
python -m venv .venv
.\.venv\Scripts\activate
```

#### macOS / Linux

```bash
python -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies & Configure Environment

```bash
pip install -r requirements.txt
```

Create a `.env` file and add:

```env
GOOGLE_API_KEY=your_actual_api_key_here
```

### 4. Start the Backend Server

```bash
python app.py
```

### 5. Launch the Frontend

Open a new terminal window:

```bash
cd ai-resume-analyzer/frontend
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

in your web browser.

---

## 🚀 Future Improvements

* Implement JWT-based user authentication to allow users to save and track their analysis history.
* Integrate an AI-powered cover letter generator tailored to the user's matched skills and target role.
