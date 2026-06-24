// Global Tab Switching Logic 
let activeResumeInputType = 'pdf';
let activeJdInputType = 'pdf';

function switchTab(section, type) {
    document.getElementById(`${section}-pdf-section`).classList.remove('active');
    document.getElementById(`${section}-text-section`).classList.remove('active');
    
    const buttons = document.querySelectorAll(`[onclick="switchTab('${section}', 'pdf')"], [onclick="switchTab('${section}', 'text')"]`);
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(`${section}-${type}-section`).classList.add('active');
    event.currentTarget.classList.add('active');

    if (section === 'resume') activeResumeInputType = type;
    if (section === 'jd') activeJdInputType = type;
}

// Main Application Logic 
document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsContainer = document.getElementById('results-container');
    
    const resumeFileInput = document.getElementById('resume_pdf');
    const resumeTextarea = document.getElementById('resume_text');
    const jdFileInput = document.getElementById('jd_pdf');
    const jdTextarea = document.getElementById('jd_text');

    let scoreChart = null;
    let currentResults = null;

    analyzeBtn.addEventListener('click', async () => {
        const formData = new FormData();
        let isValid = true;

        if (activeResumeInputType === 'pdf') {
            if (!resumeFileInput.files[0]) { alert('Please upload your resume PDF.'); isValid = false; }
            else { formData.append('resume_pdf', resumeFileInput.files[0]); }
        } else {
            if (!resumeTextarea.value.trim()) { alert('Please paste your resume text.'); isValid = false; }
            else { formData.append('resume_text', resumeTextarea.value); }
        }
        if (!isValid) return;

        if (activeJdInputType === 'pdf') {
            if (!jdFileInput.files[0]) { alert('Please upload the job description PDF.'); isValid = false; }
            else { formData.append('jd_pdf', jdFileInput.files[0]); }
        } else {
            if (!jdTextarea.value.trim()) { alert('Please paste the job description text.'); isValid = false; }
            else { formData.append('jd_text', jdTextarea.value); }
        }
        if (!isValid) return;

        const originalBtnText = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
        analyzeBtn.disabled = true;
        resultsContainer.innerHTML = '<p class="placeholder-text"><i class="fa-solid fa-circle-notch fa-spin"></i> Extracting data and analyzing via Gemini... This may take up to 40 seconds.</p>';

        try {
            const response = await fetch('https://ai-resume-analyzer-backend-53pp.onrender.com/api/analyze', { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) { throw new Error(result.error || `HTTP error! status: ${response.status}`); }
            
            displayResults(result);
        } catch (error) {
            console.error("Error fetching analysis:", error);
            resultsContainer.innerHTML = `<p class="placeholder-text" style="color: #ef4444;">An error occurred: ${error.message}</p>`;
        } finally {
            analyzeBtn.innerHTML = originalBtnText;
            analyzeBtn.disabled = false;
        }
    });

    function displayResults(results) {
        currentResults = results;
        const scoreValue = results.score;

        resultsContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="width: 180px; margin: 0 auto; position: relative;">
                    <canvas id="scoreChart"></canvas>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2rem; font-weight: bold; color: #f8fafc;">
                        ${scoreValue}%
                    </div>
                </div>
                <h3 style="margin-top: 1rem; color: #f8fafc;">Overall Match Score</h3>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <h4 style="color: #10b981; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                    <i class="fa-solid fa-check-circle"></i> Matched Skills
                </h4>
                <ul id="matched-skills" style="list-style-type: none; display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0;"></ul>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <h4 style="color: #ef4444; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; margin-bottom: 1rem;">
                    <i class="fa-solid fa-circle-xmark"></i> Missing Skills (Click to learn)
                </h4>
                <ul id="missing-skills" style="list-style-type: none; display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0;"></ul>
            </div>

            <button id="export-btn" class="primary-btn" style="background-color: #10b981;">
                <i class="fa-solid fa-file-pdf"></i> Download PDF Report
            </button>
        `;

        // Render Doughnut Chart
        if (scoreChart) { scoreChart.destroy(); }
        scoreChart = new Chart(document.getElementById('scoreChart'), {
            type: 'doughnut', 
            data: { 
                datasets: [{ 
                    data: [scoreValue, 100 - scoreValue], 
                    backgroundColor: ['#3b82f6', '#334155'], 
                    borderWidth: 0,
                    cutout: '80%'
                }] 
            },
            options: { responsive: true, plugins: { tooltip: { enabled: false } } }
        });

        // Render Skill Pills
        const matchedList = document.getElementById('matched-skills');
        results.matched_skills.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = skill;
            li.style.cssText = "background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.9rem;";
            matchedList.appendChild(li);
        });

        const missingList = document.getElementById('missing-skills');
        results.missing_skills.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = skill;
            li.style.cssText = "background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.9rem; cursor: pointer; transition: 0.2s;";
            li.onmouseover = () => li.style.background = "rgba(239, 68, 68, 0.2)";
            li.onmouseout = () => li.style.background = "rgba(239, 68, 68, 0.1)";
            li.addEventListener('click', () => handleSkillClick(skill));
            missingList.appendChild(li);
        });

        // Activate PDF Export
        document.getElementById('export-btn').addEventListener('click', exportPDF);
    }

    // Dynamic Skill Info Modal 
    function ensureModalExists() {
        if (!document.getElementById('skill-modal')) {
            const modalHtml = `
                <div id="skill-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
                    <div style="background: #1e293b; padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%; position: relative; border: 1px solid #334155;">
                        <button id="modal-close-btn" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        <h3 id="modal-title" style="margin-bottom: 1rem; color: #f8fafc;"></h3>
                        <p id="modal-description" style="color: #94a3b8; margin-bottom: 1.5rem; line-height: 1.6;"></p>
                        <a id="modal-link" href="#" target="_blank" style="display: inline-block; background: #3b82f6; color: white; padding: 0.6rem 1.2rem; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 0.9rem;">Watch Tutorial</a>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            document.getElementById('modal-close-btn').addEventListener('click', () => {
                document.getElementById('skill-modal').style.display = 'none';
            });
        }
    }

    async function handleSkillClick(skillName) {
        ensureModalExists();
        const modal = document.getElementById('skill-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalDesc = document.getElementById('modal-description');
        const modalLink = document.getElementById('modal-link');

        modal.style.display = 'flex';
        modalTitle.textContent = `Analyzing ${skillName}...`;
        modalDesc.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Fetching tailored resources from Gemini...';
        modalLink.style.display = 'none';

        try {
            const response = await fetch('https://ai-resume-analyzer-backend-53pp.onrender.com/api/skill_info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill: skillName })
            });
            const skillInfo = await response.json();
            if (!response.ok) { throw new Error(skillInfo.error || 'Failed to fetch skill info.'); }
            
            modalTitle.textContent = skillName;
            modalDesc.textContent = skillInfo.description;
            modalLink.href = skillInfo.link;
            modalLink.style.display = 'inline-block';
        } catch (error) {
            modalDesc.textContent = `Could not fetch learning resources. ${error.message}`;
        }
    }

    // PDF Export Generator
    function exportPDF() {
        if (!currentResults) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('AI Resume Analysis Report', 105, 20, { align: 'center' });
        doc.setFontSize(16);
        doc.text(`Overall Match Score: ${currentResults.score}%`, 105, 35, { align: 'center' });
        
        doc.autoTable({
            startY: 50, head: [['Matched Skills']], body: currentResults.matched_skills.map(s => [s]),
            theme: 'grid', headStyles: { fillColor: [16, 185, 129] }
        });
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15, head: [['Missing Skills']], body: currentResults.missing_skills.map(s => [s]),
            theme: 'grid', headStyles: { fillColor: [239, 68, 68] }
        });
        
        doc.save('AI_Resume_Analysis_Report.pdf');
    }
});