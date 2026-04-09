document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const leadForm = document.getElementById('lead-form');
    const uploadPrompt = document.getElementById('upload-prompt');
    const mainForm = document.getElementById('main-form');
    const scanningOverlay = document.getElementById('scanning-overlay');
    const resultsPanel = document.getElementById('results-panel');
    const scanText = document.getElementById('scan-text');
    
    let uploadedFile = null;

    // Drag and drop handlers
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if (file.type !== "application/pdf" && !file.type.match("image.*")) {
            alert("Please upload a PDF or Image of your quotation.");
            return;
        }
        uploadedFile = file;
        
        // Change dropzone UI
        document.querySelector('.dropzone-icon').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-text"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
        document.querySelector('.dropzone-text').textContent = file.name;
        document.querySelector('.dropzone-subtext').textContent = "File attached successfully.";
        
        // Show lead form
        leadForm.style.display = 'block';
    }

    mainForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!uploadedFile) {
            alert("Please upload a quotation first.");
            return;
        }

        uploadPrompt.style.display = 'none';
        leadForm.style.display = 'none';
        scanningOverlay.style.display = 'block';

        const stages = [
            "Extracting line items...",
            "Checking wet works pricing...",
            "Analyzing carpentry material costs...",
            "Generating fair-market report..."
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < stages.length) {
                scanText.textContent = stages[i];
                i++;
            }
        }, 800);

        // Actual Backend Call
        try {
            const formData = new FormData();
            formData.append('quotation', uploadedFile);
            
            const response = await fetch('http://localhost:3000/api/analyze-quote', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            clearInterval(interval);
            
            if (data.success) {
                renderReport(data.report);
            } else {
                alert("Error analyzing quotation.");
                location.reload();
            }
        } catch (error) {
            clearInterval(interval);
            console.error(error);
            showResults(); // Fallback for prototype testing
        }
    });

    // Extract DOM nodes safely
    const badgeContainer = document.getElementById('res-badge-container');
    const flagBox = document.getElementById('res-flag-box');
    const flagIcon = document.getElementById('res-flag-icon');
    const flagTitle = document.getElementById('res-flag-title');
    const flagDesc = document.getElementById('res-flag-desc');

    function renderReport(report) {
        document.getElementById('res-total').textContent = report.totalEstimated.toLocaleString();
        
        const mainAnomaly = report.anomalies[0];
        
        if (report.pricingState === 'fair') {
            badgeContainer.innerHTML = '<span class="status-badge" style="background: #D1FAE5; color: var(--success);">Fair Market Rate</span>';
            flagBox.style.borderLeftColor = 'var(--success)';
            flagBox.style.backgroundColor = '#F0FDF4';
            flagIcon.style.color = 'var(--success)';
            flagIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
            flagTitle.style.color = 'var(--success)';
        } else if (report.pricingState === 'underpriced') {
            badgeContainer.innerHTML = '<span class="status-badge" style="background: #000000; color: #FFFFFF;">Critical Risk: Below Cost</span>';
            flagBox.style.borderLeftColor = '#000000';
            flagBox.style.backgroundColor = '#F9FAFB';
            flagIcon.style.color = '#000000';
            flagIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
            flagTitle.style.color = '#000000';
        } else {
            // Overpriced
            badgeContainer.innerHTML = '<span class="status-badge warning">High Markup Detected</span>';
            flagBox.style.borderLeftColor = 'var(--danger)';
            flagBox.style.backgroundColor = '#FEF2F2';
            flagIcon.style.color = 'var(--danger)';
            flagIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
            flagTitle.style.color = 'var(--danger)';
        }

        flagTitle.textContent = `${mainAnomaly.flag}: ${mainAnomaly.category}`;
        flagDesc.textContent = mainAnomaly.description;

        scanningOverlay.style.display = 'none';
        resultsPanel.style.display = 'block';
    }
});
