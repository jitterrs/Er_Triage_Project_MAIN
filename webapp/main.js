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
      const patientData = {
        id: formData.get('patientId') || generatePatientId(),
        name: formData.get('patientName'),
        patientId: formData.get('patientId'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        symptoms: formData.get('symptoms'),
        currentMeds: formData.get('currentMeds'),
        medicalHistory: formData.get('medicalHistory'),
        triageLevel: formData.get('triageLevel'),
        redFlag: formData.get('redFlag'),
        triageReason: formData.get('triageReason'),
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
        triageScore: formData.get('triageScore'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Log the data (in real app, send to server)
      console.log('Patient Registration Data:', patientData);
      
      // Show success message
      alert('Patient registered successfully!');
      
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
      inputField.setAttribute('required', 'true');
    }
  }

  function resetFieldPlaceholder(inputField) {
    const placeholders = {
      'patientName': 'Patient Name',
      'patientId': 'Patient ID',
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
      'temp': 'e.g., 36.8',
      'triageScore': 'e.g., 8'
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
      input.setAttribute('required', 'true');
    });
  }

  // Initialize none checkbox functionality
  initializeNoneCheckboxes();

  // --- INPUT VALIDATION ---
  function initializeInputValidation() {
    const ageInput = document.querySelector('input[name="age"]');
    const hrInput = document.querySelector('input[name="hr"]');
    const rrInput = document.querySelector('input[name="rr"]');
    const spo2Input = document.querySelector('input[name="spo2"]');
    const tempInput = document.querySelector('input[name="temp"]');
    const triageScoreInput = document.querySelector('input[name="triageScore"]');

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

    if (triageScoreInput) {
      triageScoreInput.addEventListener('input', () => {
        if (triageScoreInput.value < 0) triageScoreInput.value = 0;
        if (triageScoreInput.value > 20) triageScoreInput.value = 20;
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
  
  // Check if we're on the patient dashboard page FIRST
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

  // Toggle panel visibility
  toggleBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    panel.classList.toggle('accessibility-hidden');
    console.log("Accessibility panel toggled");
  });

  // Brightness control - Apply to entire page
  if (brightnessSlider && brightnessValue) {
    brightnessSlider.addEventListener('input', function() {
      const brightness = this.value;
      brightnessValue.textContent = brightness + '%';
      
      // Apply brightness to the entire page
      document.documentElement.style.filter = `brightness(${brightness}%)`;
      console.log("Brightness set to:", brightness + '%');
    });
  }

  // High contrast mode
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

  // Large text mode
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

  // Reduce motion
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

  // Reduce brightness checkbox
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

  // Close panel when clicking outside
  document.addEventListener('click', function(e) {
    if (panel && !panel.contains(e.target) && !toggleBtn.contains(e.target) && !panel.classList.contains('accessibility-hidden')) {
      panel.classList.add('accessibility-hidden');
      console.log("Accessibility panel closed (click outside)");
    }
  });

  // Close panel with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && panel && !panel.classList.contains('accessibility-hidden')) {
      panel.classList.add('accessibility-hidden');
      console.log("Accessibility panel closed (Escape key)");
    }
  });

  console.log("Accessibility features initialized");
}

// Reset all accessibility settings
function resetAccessibility() {
  console.log("Resetting all accessibility settings");
  
  // Reset brightness on entire page
  document.documentElement.style.filter = 'brightness(100%)';
  document.body.classList.remove('high-contrast', 'large-text', 'reduced-motion');
  
  // Reset checkboxes
  const reduceBrightnessCheckbox = document.getElementById('reduceBrightness');
  const highContrastCheckbox = document.getElementById('highContrast');
  const largeTextCheckbox = document.getElementById('largeText');
  const reduceMotionCheckbox = document.getElementById('reduceMotion');
  
  if (reduceBrightnessCheckbox) reduceBrightnessCheckbox.checked = false;
  if (highContrastCheckbox) highContrastCheckbox.checked = false;
  if (largeTextCheckbox) largeTextCheckbox.checked = false;
  if (reduceMotionCheckbox) reduceMotionCheckbox.checked = false;
  
  // Reset slider
  const brightnessSlider = document.getElementById('brightnessSlider');
  const brightnessValue = document.getElementById('brightnessValue');
  
  if (brightnessSlider) brightnessSlider.value = 100;
  if (brightnessValue) brightnessValue.textContent = '100%';
  
  // Close panel
  const panel = document.getElementById('accessibilityPanel');
  if (panel) panel.classList.add('accessibility-hidden');
}

// PATIENT DASHBOARD FUNCTION (defined outside DOMContentLoaded)
function initializePatientDashboard() {
  console.log("Initializing patient dashboard...");

  // --- Navigation Buttons ---
  const btnPatientInfo = document.getElementById('btnPatientInfo');
  const btnQueue = document.getElementById('btnQueue');
  const btnInTreatment = document.getElementById('btnInTreatment');

  // --- Content Sections ---
  const patientInfoSection = document.getElementById('patientInfoSection');
  const queueSection = document.getElementById('queueSection');
  const inTreatmentSection = document.getElementById('inTreatmentSection');

  // --- Patient Modal ---
  const patientModal = document.getElementById('patientModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  // --- Tab Buttons inside Modal ---
  const modalTabBtns = document.querySelectorAll('.tab-btn');
  const modalTabPanes = document.querySelectorAll('.tab-pane');

  // --- Patient Tables ---
  const patientTableBody = document.querySelector("#patientTable tbody");
  const queueTableBody = document.querySelector("#queueTable tbody");
  const inTreatmentTableBody = document.querySelector("#inTreatmentTable tbody");

  // Sample patient data
  const samplePatients = [
    {
      id: "1",
      name: "Noura",
      age: "70",
      gender: "F",
      triageLevel: 2,
      symptoms: "Chest pain, shortness of breath",
      status: "WAITING",
      waitTime: "15 min",
      treatmentStart: "",
      currentMeds: "Aspirin",
      medicalHistory: "Hypertension",
      vitals: {
        bpSys: "102",
        bpDia: "65",
        hr: "96",
        rr: "22",
        spo2: "93",
        temp: "37.8"
      },
      triageScore: "8",
      redFlag: "No",
      triageReason: "SBP 102; SpO2 93%; chest pain",
      createdAt: "2025-01-15 10:15:00",
      updatedAt: "2025-01-15 10:15:00"
    },
    {
      id: "2",
      name: "Ali",
      age: "30",
      gender: "M",
      triageLevel: 3,
      symptoms: "Mild abdominal pain",
      status: "WAITING",
      waitTime: "25 min",
      treatmentStart: "",
      currentMeds: "None",
      medicalHistory: "None",
      vitals: {
        bpSys: "120",
        bpDia: "80",
        hr: "88",
        rr: "18",
        spo2: "97",
        temp: "37.0"
      },
      triageScore: "3",
      redFlag: "No",
      triageReason: "Stable vitals, mild abdominal pain",
      createdAt: "2025-01-15 10:20:00",
      updatedAt: "2025-01-15 10:20:00"
    },
    {
      id: "3",
      name: "Sara",
      age: "55",
      gender: "F",
      triageLevel: 1,
      symptoms: "Severe chest pain, sweating",
      status: "IN_TREATMENT",
      waitTime: "5 min",
      treatmentStart: "10:30 AM",
      currentMeds: "Metformin",
      medicalHistory: "Diabetes Type 2",
      vitals: {
        bpSys: "85",
        bpDia: "55",
        hr: "120",
        rr: "30",
        spo2: "84",
        temp: "38.2"
      },
      triageScore: "12",
      redFlag: "Yes",
      triageReason: "SpO2 84%; SBP 85; severe chest pain",
      createdAt: "2025-01-15 10:25:00",
      updatedAt: "2025-01-15 10:30:00"
    }
  ];

  // --- Navigation Function ---
  function showSection(section) {
    console.log("Showing section:", section);
    
    // Hide all sections
    if (patientInfoSection) patientInfoSection.classList.add('hidden');
    if (queueSection) queueSection.classList.add('hidden');
    if (inTreatmentSection) inTreatmentSection.classList.add('hidden');

    // Remove active class from all buttons
    if (btnPatientInfo) btnPatientInfo.classList.remove('active');
    if (btnQueue) btnQueue.classList.remove('active');
    if (btnInTreatment) btnInTreatment.classList.remove('active');

    // Show selected section and activate button
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
    
    // Clear tables
    if (patientTableBody) patientTableBody.innerHTML = '';
    if (queueTableBody) queueTableBody.innerHTML = '';
    if (inTreatmentTableBody) inTreatmentTableBody.innerHTML = '';

    patients.forEach(patient => {
      // Calculate wait time
      const waitTime = patient.status === 'WAITING' ? 
        (Math.floor(Math.random() * 30) + 5) + ' min' : '-';

      // --- Patient Info Table (All Patients - Only View Button) ---
      if (patientTableBody) {
        const rowPatient = document.createElement('tr');
        rowPatient.innerHTML = `
          <td>${patient.id}</td>
          <td>${patient.name}</td>
          <td><span class="triage-level level-${patient.triageLevel}">Level ${patient.triageLevel}</span></td>
          <td>${patient.symptom || patient.symptoms}</td>
          <td class="text-right">
            <button class="info-btn" data-patient-id="${patient.id}">View Info</button>
          </td>
        `;
        patientTableBody.appendChild(rowPatient);
      }

      // --- Queue Table (Level 2 & 3, waiting - Only Admit Button) ---
      if (queueTableBody && patient.triageLevel >= 2 && patient.status === "WAITING") {
        const rowQueue = document.createElement('tr');
        rowQueue.innerHTML = `
          <td>${patient.id}</td>
          <td>${patient.name}</td>
          <td><span class="triage-level level-${patient.triageLevel}">Level ${patient.triageLevel}</span></td>
          <td>${patient.symptom || patient.symptoms}</td>
          <td>${waitTime}</td>
          <td class="text-right">
            <button class="action-btn admit-btn" data-patient-id="${patient.id}">Admit to Treatment</button>
          </td>
        `;
        queueTableBody.appendChild(rowQueue);
      }

      // --- In-Treatment Table (Level 1, in treatment - Only Discharge Button) ---
      if (inTreatmentTableBody && patient.triageLevel === 1 && patient.status === "IN_TREATMENT") {
        const rowTreatment = document.createElement('tr');
        rowTreatment.innerHTML = `
          <td>${patient.id}</td>
          <td>${patient.name}</td>
          <td><span class="triage-level level-${patient.triageLevel}">Level ${patient.triageLevel}</span></td>
          <td>${patient.symptom || patient.symptoms}</td>
          <td>${patient.treatmentStart || '-'}</td>
          <td class="text-right">
            <button class="action-btn discharge-btn" data-patient-id="${patient.id}">Discharge</button>
          </td>
        `;
        inTreatmentTableBody.appendChild(rowTreatment);
      }
    });

    console.log("Tables populated, attaching button events...");

    // --- Attach View Button Events (Patient Info Table Only) ---
    document.querySelectorAll('.info-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const patientId = btn.getAttribute('data-patient-id');
        const patient = patients.find(p => p.id == patientId);
        console.log("View button clicked for patient:", patientId, patient);
        if (patient) showPatientModal(patient);
      });
    });

    // --- Attach Admit Button Events (Queue Table) ---
    document.querySelectorAll('.admit-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const patientId = btn.getAttribute('data-patient-id');
        console.log("Admit button clicked for patient:", patientId);
        const patient = patients.find(p => p.id == patientId);
        if (patient) {
          // Update status locally (no database update for now)
          patient.status = "IN_TREATMENT";
          patient.treatmentStart = new Date().toLocaleTimeString();
          loadPatients(patients); // Refresh the display
        }
      });
    });

    // --- Attach Discharge Button Events (In-Treatment Table) ---
    document.querySelectorAll('.discharge-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const patientId = btn.getAttribute('data-patient-id');
        console.log("Discharge button clicked for patient:", patientId);
        const patient = patients.find(p => p.id == patientId);
        if (patient) {
          // Update status locally (no database update for now)
          patient.status = "TREATED";
          loadPatients(patients); // Refresh the display
        }
      });
    });
  }

  // --- Show Patient Modal ---
  function showPatientModal(patient) {
    console.log("Showing modal for patient:", patient.name);
    
    // Update modal content
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
    if (modalSymptoms) modalSymptoms.textContent = patient.symptom || patient.symptoms || '-';
    if (modalCurrentMeds) modalCurrentMeds.textContent = patient.current_medications || patient.currentMeds || '-';
    if (modalPastHistory) modalPastHistory.textContent = patient.past_medical_history || patient.medicalHistory || '-';
    if (modalBpSys) modalBpSys.textContent = patient.bp_sys || patient.vitals?.bpSys || '-';
    if (modalBpDia) modalBpDia.textContent = patient.bp_dia || patient.vitals?.bpDia || '-';
    if (modalHr) modalHr.textContent = patient.hr || patient.vitals?.hr || '-';
    if (modalRr) modalRr.textContent = patient.rr || patient.vitals?.rr || '-';
    if (modalSpo2) modalSpo2.textContent = patient.spo2 || patient.vitals?.spo2 || '-';
    if (modalTemp) modalTemp.textContent = patient.temp || patient.vitals?.temp || '-';
    if (modalTriageScore) modalTriageScore.textContent = patient.triage_score || patient.triageScore || '-';
    if (modalRedFlag) modalRedFlag.textContent = patient.red_flag ? 'Yes' : patient.redFlag || 'No';
    if (modalTriageReason) modalTriageReason.textContent = patient.triage_reason || patient.triageReason || '-';
    if (modalCreatedAt) modalCreatedAt.textContent = patient.created_at || patient.createdAt || '-';
    if (modalUpdatedAt) modalUpdatedAt.textContent = patient.updated_at || patient.updatedAt || '-';
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

  // --- Click outside modal to close ---
  if (patientModal) {
    patientModal.addEventListener('click', e => {
      if (e.target === patientModal) patientModal.classList.add('hidden');
    });
  }

  // Initialize dashboard
  loadPatients(samplePatients);
  showSection('patientInfo');
  console.log("Patient dashboard initialized successfully");
}