document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded - checking for dashboard elements...");

  // --- ACCESSIBILITY FUNCTIONALITY ---
  initializeAccessibility();

  // --- REGISTER BUTTON LOGIC ---
  const registerBtn = document.getElementById('registerBtn');
  const registerBox = document.getElementById('registerBox');
  const cancelRegister = document.getElementById('cancelRegister');
  const viewBtn = document.getElementById('viewBtn');
  const patientForm = document.getElementById('patientForm');

  if (registerBtn && registerBox && cancelRegister) {
    registerBtn.addEventListener('click', () => {
      registerBox.style.display = 'block';
    });
    cancelRegister.addEventListener('click', () => {
      registerBox.style.display = 'none';
      patientForm.reset();
      resetNoneCheckboxes();
    });
  }

  // --- FORM SUBMISSION HANDLING ---
  if (patientForm) {
    patientForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Collect form data
      const formData = new FormData(patientForm);
      
      // Generate triage level based on symptoms/vitals (simplified logic)
      const symptoms = formData.get('symptoms') || '';
      const redFlag = formData.get('redFlag') || 'No';
      const bp = formData.get('bp') || '';
      const hr = formData.get('hr') || '';
      const spo2 = formData.get('spo2') || '';
      
      // Simple triage calculation (in real app, use proper algorithm)
      let triageLevel = 5; // Default to green (least urgent)
      
      if (redFlag === 'Yes' || symptoms.toLowerCase().includes('chest pain') || 
          symptoms.toLowerCase().includes('difficulty breathing')) {
        triageLevel = 1; // Red - most urgent
      } else if (symptoms.toLowerCase().includes('severe') || 
                 (bp && (parseInt(bp.split('/')[0]) < 90 || parseInt(bp.split('/')[0]) > 180))) {
        triageLevel = 2; // Orange
      } else if (symptoms.toLowerCase().includes('moderate') || 
                 (hr && (parseInt(hr) > 120 || parseInt(hr) < 50))) {
        triageLevel = 3; // Yellow
      } else if (symptoms.toLowerCase().includes('mild') || 
                 (spo2 && parseInt(spo2) < 95)) {
        triageLevel = 4; // Light Green
      } else {
        triageLevel = 5; // Dark Green - least urgent
      }
      
      const patientData = {
        id: formData.get('patientId') || generatePatientId(),
        name: formData.get('patientName'),
        nationalId: formData.get('nationalId'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        symptoms: formData.get('symptoms'),
        currentMeds: formData.get('currentMeds'),
        medicalHistory: formData.get('medicalHistory'),
        redFlag: redFlag,
        triageReason: formData.get('triageReason'),
        triageLevel: triageLevel, // Added triage level
        status: formData.get('status') || 'WAITING',
        waitTime: formData.get('waitTime') || '0 min',
        treatmentStart: formData.get('treatmentStart'),
        vitals: {
          bp: formData.get('bp'),
          hr: formData.get('hr'),
          rr: formData.get('rr'),
          spo2: formData.get('spo2'),
          temp: formData.get('temp')
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Log the data (in real app, send to server)
      console.log('Patient Registration Data:', patientData);
      
      // Show success message
      alert(`Patient registered successfully! Triage Level: ${triageLevel}`);
      
      // Reset form and close modal
      patientForm.reset();
      resetNoneCheckboxes();
      registerBox.style.display = 'none';
    });
  }

  function generatePatientId() {
    return 'PAT' + Date.now().toString().slice(-6);
  }

  // --- NONE CHECKBOX FUNCTIONALITY FOR ALL FIELDS ---
  function initializeNoneCheckboxes() {
    const noneCheckboxes = document.querySelectorAll('.none-option input[type="checkbox"]');
    
    noneCheckboxes.forEach(checkbox => {
      updateFieldState(checkbox);
      checkbox.addEventListener('change', function() {
        updateFieldState(this);
      });
    });
  }

  function updateFieldState(checkbox) {
    const formRow = checkbox.closest('.form-row');
    const inputField = formRow.querySelector('input, textarea, select');
    
    if (checkbox.checked) {
      inputField.disabled = true;
      inputField.value = '';
      inputField.placeholder = 'Not recorded';
      inputField.removeAttribute('required');
    } else {
      inputField.disabled = false;
      resetFieldPlaceholder(inputField);
      if (inputField.hasAttribute('data-originally-required')) {
        inputField.setAttribute('required', 'true');
      }
    }
  }

  function resetFieldPlaceholder(inputField) {
    const placeholders = {
      'patientName': 'Patient Name',
      'nationalId': 'National ID',
      'age': 'Age',
      'symptoms': 'Symptoms',
      'currentMeds': 'Current Medications',
      'medicalHistory': 'Past Medical History',
      'triageReason': 'Triage Reason',
      'waitTime': 'Wait Time (e.g., 15 min)',
      'bp': 'e.g., 120/80',
      'hr': 'e.g., 75',
      'rr': 'e.g., 16',
      'spo2': 'e.g., 98',
      'temp': 'e.g., 36.8'
    };
    
    inputField.placeholder = placeholders[inputField.name] || 'Enter value';
  }

  function resetNoneCheckboxes() {
    const noneCheckboxes = document.querySelectorAll('.none-option input[type="checkbox"]');
    const allInputs = document.querySelectorAll('.form-row input, .form-row textarea, .form-row select');
    
    noneCheckboxes.forEach(checkbox => checkbox.checked = false);
    allInputs.forEach(input => {
      input.disabled = false;
      resetFieldPlaceholder(input);
      if (input.hasAttribute('data-originally-required')) {
        input.setAttribute('required', 'true');
      }
    });
  }

  // Initialize none checkbox functionality
  initializeNoneCheckboxes();

  // Mark required fields on page load
  const requiredFields = document.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    field.setAttribute('data-originally-required', 'true');
  });

  // --- INPUT VALIDATION ---
  function initializeInputValidation() {
    const ageInput = document.querySelector('input[name="age"]');
    const hrInput = document.querySelector('input[name="hr"]');
    const rrInput = document.querySelector('input[name="rr"]');
    const spo2Input = document.querySelector('input[name="spo2"]');
    const tempInput = document.querySelector('input[name="temp"]');

    if (ageInput) {
      ageInput.addEventListener('input', () => {
        if (ageInput.value < 0) ageInput.value = 0;
        if (ageInput.value > 200) ageInput.value = 200;
      });
    }

    if (hrInput) {
      hrInput.addEventListener('input', () => {
        if (hrInput.value < 30) hrInput.value = 30;
        if (hrInput.value > 200) hrInput.value = 200;
      });
    }

    if (rrInput) {
      rrInput.addEventListener('input', () => {
        if (rrInput.value < 6) rrInput.value = 6;
        if (rrInput.value > 60) rrInput.value = 60;
      });
    }

    if (spo2Input) {
      spo2Input.addEventListener('input', () => {
        if (spo2Input.value < 70) spo2Input.value = 70;
        if (spo2Input.value > 100) spo2Input.value = 100;
      });
    }

    if (tempInput) {
      tempInput.addEventListener('input', () => {
        if (tempInput.value < 34) tempInput.value = 34;
        if (tempInput.value > 42) tempInput.value = 42;
      });
    }
  }

  // Initialize input validation
  initializeInputValidation();

  // --- VIEW PATIENT BUTTON LOGIC ---
  if (viewBtn) {
    viewBtn.addEventListener('click', () => {
      window.location.href = "patientDashboard.html";
    });
  }

  // --- LOGIN FUNCTIONALITY ---
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const message = document.getElementById("loginMessage");

      if (username === "admin" && password === "1234") {
        message.textContent = "Login successful!";
        message.style.color = "lightgreen";
        setTimeout(() => {
          window.location.href = "dashboard.html"; 
        }, 1000);
      } else {
        message.textContent = "Invalid credentials.";
        message.style.color = "red";
      }
    });
  }

  // ========================
  // PATIENT DASHBOARD LOGIC
  // ========================
  
  if (document.getElementById('btnPatientInfo')) {
    console.log("Patient dashboard detected - initializing...");
    initializePatientDashboard();
  }
});

// ACCESSIBILITY FUNCTIONALITY
function initializeAccessibility() {
  console.log("Initializing accessibility features...");
  
  const toggleBtn = document.getElementById('accessibilityToggle');
  const panel = document.getElementById('accessibilityPanel');
  const brightnessSlider = document.getElementById('brightnessSlider');
  const brightnessValue = document.getElementById('brightnessValue');
  
  if (!toggleBtn || !panel) {
    console.log("Accessibility elements not found");
    return;
  }

  toggleBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    panel.classList.toggle('accessibility-hidden');
    console.log("Accessibility panel toggled");
  });

  if (brightnessSlider && brightnessValue) {
    brightnessSlider.addEventListener('input', function() {
      const brightness = this.value;
      brightnessValue.textContent = brightness + '%';
      document.documentElement.style.filter = `brightness(${brightness}%)`;
      console.log("Brightness set to:", brightness + '%');
    });
  }

  const highContrastCheckbox = document.getElementById('highContrast');
  if (highContrastCheckbox) {
    highContrastCheckbox.addEventListener('change', function(e) {
      if (e.target.checked) {
        document.body.classList.add('high-contrast');
        console.log("High contrast mode enabled");
      } else {
        document.body.classList.remove('high-contrast');
        console.log("High contrast mode disabled");
      }
    });
  }

  const largeTextCheckbox = document.getElementById('largeText');
  if (largeTextCheckbox) {
    largeTextCheckbox.addEventListener('change', function(e) {
      if (e.target.checked) {
        document.body.classList.add('large-text');
        console.log("Large text mode enabled");
      } else {
        document.body.classList.remove('large-text');
        console.log("Large text mode disabled");
      }
    });
  }

  const reduceMotionCheckbox = document.getElementById('reduceMotion');
  if (reduceMotionCheckbox) {
    reduceMotionCheckbox.addEventListener('change', function(e) {
      if (e.target.checked) {
        document.body.classList.add('reduced-motion');
        console.log("Reduced motion enabled");
      } else {
        document.body.classList.remove('reduced-motion');
        console.log("Reduced motion disabled");
      }
    });
  }

  const reduceBrightnessCheckbox = document.getElementById('reduceBrightness');
  if (reduceBrightnessCheckbox && brightnessSlider) {
    reduceBrightnessCheckbox.addEventListener('change', function(e) {
      if (e.target.checked) {
        brightnessSlider.value = 70;
        if (brightnessValue) brightnessValue.textContent = '70%';
        document.documentElement.style.filter = 'brightness(70%)';
        console.log("Brightness reduced to 70%");
      } else {
        brightnessSlider.value = 100;
        if (brightnessValue) brightnessValue.textContent = '100%';
        document.documentElement.style.filter = 'brightness(100%)';
        console.log("Brightness reset to 100%");
      }
    });
  }

  document.addEventListener('click', function(e) {
    if (panel && !panel.contains(e.target) && !toggleBtn.contains(e.target) && !panel.classList.contains('accessibility-hidden')) {
      panel.classList.add('accessibility-hidden');
      console.log("Accessibility panel closed (click outside)");
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && panel && !panel.classList.contains('accessibility-hidden')) {
      panel.classList.add('accessibility-hidden');
      console.log("Accessibility panel closed (Escape key)");
    }
  });

  console.log("Accessibility features initialized");
}

function resetAccessibility() {
  console.log("Resetting all accessibility settings");
  
  document.documentElement.style.filter = 'brightness(100%)';
  document.body.classList.remove('high-contrast', 'large-text', 'reduced-motion');
  
  const reduceBrightnessCheckbox = document.getElementById('reduceBrightness');
  const highContrastCheckbox = document.getElementById('highContrast');
  const largeTextCheckbox = document.getElementById('largeText');
  const reduceMotionCheckbox = document.getElementById('reduceMotion');
  
  if (reduceBrightnessCheckbox) reduceBrightnessCheckbox.checked = false;
  if (highContrastCheckbox) highContrastCheckbox.checked = false;
  if (largeTextCheckbox) largeTextCheckbox.checked = false;
  if (reduceMotionCheckbox) reduceMotionCheckbox.checked = false;
  
  const brightnessSlider = document.getElementById('brightnessSlider');
  const brightnessValue = document.getElementById('brightnessValue');
  
  if (brightnessSlider) brightnessSlider.value = 100;
  if (brightnessValue) brightnessValue.textContent = '100%';
  
  const panel = document.getElementById('accessibilityPanel');
  if (panel) panel.classList.add('accessibility-hidden');
}

// PATIENT DASHBOARD FUNCTION
function initializePatientDashboard() {
  console.log("Initializing patient dashboard...");

  const btnPatientInfo = document.getElementById('btnPatientInfo');
  const btnQueue = document.getElementById('btnQueue');
  const btnInTreatment = document.getElementById('btnInTreatment');

  const patientInfoSection = document.getElementById('patientInfoSection');
  const queueSection = document.getElementById('queueSection');
  const inTreatmentSection = document.getElementById('inTreatmentSection');

  const patientModal = document.getElementById('patientModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  const modalTabBtns = document.querySelectorAll('.tab-btn');
  const modalTabPanes = document.querySelectorAll('.tab-pane');

  const patientTableBody = document.querySelector("#patientTable tbody");
  const queueTableBody = document.querySelector("#queueTable tbody");
  const inTreatmentTableBody = document.querySelector("#inTreatmentTable tbody");

  // Initialize with empty data
  const patients = [];

  // --- Navigation Function ---
  function showSection(section) {
    console.log("Showing section:", section);
    
    if (patientInfoSection) patientInfoSection.classList.add('hidden');
    if (queueSection) queueSection.classList.add('hidden');
    if (inTreatmentSection) inTreatmentSection.classList.add('hidden');

    if (btnPatientInfo) btnPatientInfo.classList.remove('active');
    if (btnQueue) btnQueue.classList.remove('active');
    if (btnInTreatment) btnInTreatment.classList.remove('active');

    switch(section) {
      case 'patientInfo':
        if (patientInfoSection) patientInfoSection.classList.remove('hidden');
        if (btnPatientInfo) btnPatientInfo.classList.add('active');
        break;
      case 'queue':
        if (queueSection) queueSection.classList.remove('hidden');
        if (btnQueue) btnQueue.classList.add('active');
        break;
      case 'inTreatment':
        if (inTreatmentSection) inTreatmentSection.classList.remove('hidden');
        if (btnInTreatment) btnInTreatment.classList.add('active');
        break;
    }
  }

  // --- Attach Navigation Events ---
  if (btnPatientInfo) {
    btnPatientInfo.addEventListener('click', () => showSection('patientInfo'));
    console.log("Patient Info button event attached");
  }
  if (btnQueue) {
    btnQueue.addEventListener('click', () => showSection('queue'));
    console.log("Queue button event attached");
  }
  if (btnInTreatment) {
    btnInTreatment.addEventListener('click', () => showSection('inTreatment'));
    console.log("In-Treatment button event attached");
  }

  // --- Function to Populate Patient Tables ---
  function loadPatients(patients) {
    console.log("Loading patients:", patients.length);
    
    // Clear tables - leave them completely empty
    if (patientTableBody) patientTableBody.innerHTML = '';
    if (queueTableBody) queueTableBody.innerHTML = '';
    if (inTreatmentTableBody) inTreatmentTableBody.innerHTML = '';

    // If no patients, tables will remain empty (no message)
    if (patients.length === 0) {
      console.log("No patients to display - tables are empty");
      return;
    }

    patients.forEach(patient => {
      const waitTime = patient.status === 'WAITING' ? 
        (patient.waitTime || '0 min') : '-';

      // Patient Info Table
      if (patientTableBody) {
        const rowPatient = document.createElement('tr');
        rowPatient.innerHTML = `
          <td>${patient.id}</td>
          <td>${patient.name}</td>
          <td><span class="triage-level level-${patient.triageLevel || 5}">Level ${patient.triageLevel || 5}</span></td>
          <td>${patient.symptoms || '-'}</td>
          <td class="text-right">
            <button class="info-btn" data-patient-id="${patient.id}">View Info</button>
          </td>
        `;
        patientTableBody.appendChild(rowPatient);
      }

      // Queue Table (Level 1-5, waiting)
      if (queueTableBody && patient.status === "WAITING") {
        const rowQueue = document.createElement('tr');
        rowQueue.innerHTML = `
          <td>${patient.id}</td>
          <td>${patient.name}</td>
          <td><span class="triage-level level-${patient.triageLevel || 5}">Level ${patient.triageLevel || 5}</span></td>
          <td>${patient.symptoms || '-'}</td>
          <td>${waitTime}</td>
          <td class="text-right">
            <button class="action-btn admit-btn" data-patient-id="${patient.id}">Admit to Treatment</button>
          </td>
        `;
        queueTableBody.appendChild(rowQueue);
      }

      // In-Treatment Table (Level 1-5, in treatment)
      if (inTreatmentTableBody && patient.status === "IN_TREATMENT") {
        const rowTreatment = document.createElement('tr');
        rowTreatment.innerHTML = `
          <td>${patient.id}</td>
          <td>${patient.name}</td>
          <td><span class="triage-level level-${patient.triageLevel || 1}">Level ${patient.triageLevel || 1}</span></td>
          <td>${patient.symptoms || '-'}</td>
          <td>${patient.treatmentStart || '-'}</td>
          <td class="text-right">
            <button class="action-btn discharge-btn" data-patient-id="${patient.id}">Discharge</button>
          </td>
        `;
        inTreatmentTableBody.appendChild(rowTreatment);
      }
    });

    console.log("Tables populated, attaching button events...");

    // Attach button events
    document.querySelectorAll('.info-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const patientId = btn.getAttribute('data-patient-id');
        const patient = patients.find(p => p.id == patientId);
        console.log("View button clicked for patient:", patientId, patient);
        if (patient) showPatientModal(patient);
      });
    });

    document.querySelectorAll('.admit-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const patientId = btn.getAttribute('data-patient-id');
        console.log("Admit button clicked for patient:", patientId);
        const patient = patients.find(p => p.id == patientId);
        if (patient) {
          patient.status = "IN_TREATMENT";
          patient.treatmentStart = new Date().toLocaleTimeString();
          loadPatients(patients);
        }
      });
    });

    document.querySelectorAll('.discharge-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const patientId = btn.getAttribute('data-patient-id');
        console.log("Discharge button clicked for patient:", patientId);
        const patient = patients.find(p => p.id == patientId);
        if (patient) {
          patient.status = "TREATED";
          loadPatients(patients);
        }
      });
    });
  }

  // --- Show Patient Modal ---
  function showPatientModal(patient) {
    console.log("Showing modal for patient:", patient.name);
    
    const modalPatientName = document.getElementById('modalPatientName');
    const modalPatientId = document.getElementById('modalPatientId');
    const modalPatientAge = document.getElementById('modalPatientAge');
    const modalPatientGender = document.getElementById('modalPatientGender');
    const modalTriageLevel = document.getElementById('modalTriageLevel');
    const modalSymptoms = document.getElementById('modalSymptoms');
    const modalCurrentMeds = document.getElementById('modalCurrentMeds');
    const modalPastHistory = document.getElementById('modalPastHistory');
    const modalBpSys = document.getElementById('modalBpSys');
    const modalBpDia = document.getElementById('modalBpDia');
    const modalHr = document.getElementById('modalHr');
    const modalRr = document.getElementById('modalRr');
    const modalSpo2 = document.getElementById('modalSpo2');
    const modalTemp = document.getElementById('modalTemp');
    const modalTriageScore = document.getElementById('modalTriageScore');
    const modalRedFlag = document.getElementById('modalRedFlag');
    const modalTriageReason = document.getElementById('modalTriageReason');
    const modalCreatedAt = document.getElementById('modalCreatedAt');
    const modalUpdatedAt = document.getElementById('modalUpdatedAt');
    const modalStatus = document.getElementById('modalStatus');

    if (modalPatientName) modalPatientName.textContent = patient.name || '-';
    if (modalPatientId) modalPatientId.textContent = patient.id || '-';
    if (modalPatientAge) modalPatientAge.textContent = patient.age || '-';
    if (modalPatientGender) modalPatientGender.textContent = patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other';
    if (modalTriageLevel) modalTriageLevel.textContent = patient.triageLevel || '-';
    if (modalSymptoms) modalSymptoms.textContent = patient.symptoms || '-';
    if (modalCurrentMeds) modalCurrentMeds.textContent = patient.currentMeds || '-';
    if (modalPastHistory) modalPastHistory.textContent = patient.medicalHistory || '-';
    if (modalBpSys) modalBpSys.textContent = patient.vitals?.bp?.split('/')[0] || '-';
    if (modalBpDia) modalBpDia.textContent = patient.vitals?.bp?.split('/')[1] || '-';
    if (modalHr) modalHr.textContent = patient.vitals?.hr || '-';
    if (modalRr) modalRr.textContent = patient.vitals?.rr || '-';
    if (modalSpo2) modalSpo2.textContent = patient.vitals?.spo2 || '-';
    if (modalTemp) modalTemp.textContent = patient.vitals?.temp || '-';
    if (modalTriageScore) modalTriageScore.textContent = patient.triageScore || '-';
    if (modalRedFlag) modalRedFlag.textContent = patient.redFlag || 'No';
    if (modalTriageReason) modalTriageReason.textContent = patient.triageReason || '-';
    if (modalCreatedAt) modalCreatedAt.textContent = patient.createdAt || '-';
    if (modalUpdatedAt) modalUpdatedAt.textContent = patient.updatedAt || '-';
    if (modalStatus) modalStatus.textContent = patient.status === 'WAITING' ? 'Waiting' : 
                                              patient.status === 'IN_TREATMENT' ? 'In Treatment' : 'Treated';

    if (patientModal) {
      patientModal.classList.remove('hidden');
    }
  }

  // --- Modal Tab Switching ---
  modalTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalTabBtns.forEach(b => b.classList.remove('active'));
      modalTabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const tabName = btn.getAttribute('data-tab');
      const tabPane = document.getElementById(tabName);
      if (tabPane) tabPane.classList.add('active');
    });
  });

  // --- Close Modal ---
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (patientModal) patientModal.classList.add('hidden');
    });
  }

  if (patientModal) {
    patientModal.addEventListener('click', e => {
      if (e.target === patientModal) patientModal.classList.add('hidden');
    });
  }

  // Initialize dashboard with empty data
  loadPatients(patients);
  showSection('patientInfo');
  console.log("Patient dashboard initialized successfully");
}