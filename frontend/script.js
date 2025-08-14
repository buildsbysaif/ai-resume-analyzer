

document.addEventListener('DOMContentLoaded', () => {
    //  Element Selectors
    const analyzeBtn = document.getElementById('analyze-btn');
    const exportBtn = document.getElementById('export-btn');

    // all other selectors are here 
    const buttonText = document.getElementById('button-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultsContainer = document.getElementById('results-container');
    const resultsPlaceholder = document.getElementById('results-placeholder');
    const resumeFileInput = document.getElementById('resume-file-input');
    const resumeTextarea = document.getElementById('resume-textarea');
    const resumeFileName = document.getElementById('resume-file-name');
    const jdFileInput = document.getElementById('jd-file-input');
    const jdTextarea = document.getElementById('jd-textarea');
    const jdFileName = document.getElementById('jd-file-name');
    const skillModal = document.getElementById('skill-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalLink = document.getElementById('modal-link');
    
    // Selectors for the clear buttons
    const resumeClearBtn = document.getElementById('resume-clear-btn');
    const jdClearBtn = document.getElementById('jd-clear-btn');

    let scoreChart = null;
    let currentResults = null;
    let activeResumeInputType = 'pdf';
    let activeJdInputType = 'pdf';

    //  Helper function to manage file input UI 
    function setupFileInput(fileInput, nameSpan, clearBtn) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                nameSpan.textContent = fileInput.files[0].name;
                nameSpan.style.fontStyle = 'normal';
                clearBtn.classList.remove('hidden');
            } else {
                nameSpan.textContent = 'No file selected';
                nameSpan.style.fontStyle = 'italic';
                clearBtn.classList.add('hidden');
            }
        });

        clearBtn.addEventListener('click', () => {
            fileInput.value = ''; 
            
            fileInput.dispatchEvent(new Event('change'));
        });
    }

    setupFileInput(resumeFileInput, resumeFileName, resumeClearBtn);
    setupFileInput(jdFileInput, jdFileName, jdClearBtn);
    
    // --- Tab Logic ---
    function setupTabs(containerId, stateUpdater) {
        const tabContainer = document.getElementById(containerId);
        const prefix = containerId.split('-')[0];
        tabContainer.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                tabContainer.querySelector('.active').classList.remove('active');
                button.classList.add('active');
                const inputType = button.dataset.for.split('-')[1];
                stateUpdater(inputType);
                document.getElementById(`${prefix}-input-pdf`).classList.toggle('hidden', inputType !== 'pdf');
                document.getElementById(`${prefix}-input-text`).classList.toggle('hidden', inputType !== 'text');
            });
        });
    }
    setupTabs('resume-tabs', type => activeResumeInputType = type);
    setupTabs('jd-tabs', type => activeJdInputType = type);
    
    // --- Modal Logic ---
    function openModal() { skillModal.classList.remove('hidden'); }
    function closeModal() { skillModal.classList.add('hidden'); }
    modalCloseBtn.addEventListener('click', closeModal);
    skillModal.addEventListener('click', (e) => { if (e.target === skillModal) { closeModal(); } });

    // --- Main Analyze Logic ---
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
        buttonText.textContent = 'Analyzing...';
        loadingSpinner.classList.remove('hidden');
        analyzeBtn.disabled = true;
        resultsContainer.classList.add('hidden');
        exportBtn.classList.add('hidden');
        resultsPlaceholder.classList.remove('hidden');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/analyze', { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) { throw new Error(result.error || `HTTP error! status: ${response.status}`); }
            displayResults(result);
        } catch (error) {
            console.error("Error fetching analysis:", error);
            alert(`An error occurred: ${error.message}`);
        } finally {
            buttonText.textContent = 'Analyze';
            loadingSpinner.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    });

    // --- Display Results function ---
    function displayResults(results) {
        currentResults = results;
        const scoreValue = results.score;
        document.getElementById('score').textContent = `${scoreValue}%`;
        if (scoreChart) { scoreChart.destroy(); }
        scoreChart = new Chart(document.getElementById('scoreChart'), {
            type: 'doughnut', data: { datasets: [{ data: [scoreValue, 100 - scoreValue], backgroundColor: ['#3b82f6', '#374151'], borderColor: '#1f2937', borderWidth: 4, borderRadius: 5 }] },
            options: { responsive: true, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
        });
        const matchedList = document.getElementById('matched-skills');
        const missingList = document.getElementById('missing-skills');
        matchedList.innerHTML = '';
        missingList.innerHTML = '';
        results.matched_skills.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = skill;
            matchedList.appendChild(li);
        });
        results.missing_skills.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = skill;
            li.classList.add('clickable-skill');
            li.addEventListener('click', () => handleSkillClick(skill));
            missingList.appendChild(li);
        });
        resultsPlaceholder.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        exportBtn.classList.remove('hidden');
    }
    
    // --- Skill Click Modal Logic ---
    async function handleSkillClick(skillName) {
        modalTitle.textContent = `Loading info for ${skillName}...`;
        modalDescription.textContent = '';
        modalLink.classList.add('hidden');
        openModal();
        try {
            const response = await fetch('http://127.0.0.1:5000/api/skill_info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill: skillName })
            });
            const skillInfo = await response.json();
            if (!response.ok) { throw new Error(skillInfo.error || 'Failed to fetch skill info.'); }
            modalTitle.textContent = skillName;
            modalDescription.textContent = skillInfo.description;
            modalLink.href = skillInfo.link;
            modalLink.classList.remove('hidden');
        } catch (error) {
            modalDescription.textContent = `Could not fetch learning resources. ${error.message}`;
        }
    }
    
    // --- PDF Export Logic ---
    exportBtn.addEventListener('click', () => {
        if (!currentResults) { alert('Please run an analysis first.'); return; }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('AI Resume Analysis Report', 105, 20, { align: 'center' });
        doc.setFontSize(16);
        doc.text(`Overall Match Score: ${currentResults.score}%`, 105, 35, { align: 'center' });
        doc.autoTable({
            startY: 50, head: [['Matched Skills']], body: currentResults.matched_skills.map(skill => [skill]),
            theme: 'grid', headStyles: { fillColor: [16, 185, 129] }
        });
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15, head: [['Missing Skills']], body: currentResults.missing_skills.map(skill => [skill]),
            theme: 'grid', headStyles: { fillColor: [239, 68, 68] }
        });
        doc.save('AI_Resume_Analysis_Report.pdf');
    });
});