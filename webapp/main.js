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
    patientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Collect form data and map to SQL structure
      const formData = new FormData(patientForm);
      const patientData = {
        name: formData.get('patientName'),
        national_id: formData.get('patientId'),
        age: parseInt(formData.get('age')) || 0,
        gender: formData.get('gender'),
        phone: formData.get('phone') || '',
        symptom: formData.get('symptoms'),
        current_medications: formData.get('currentMeds'),
        past_medical_history: formData.get('medicalHistory'),
        triage_level: parseInt(formData.get('triageLevel')) || 3,
        triage_score: parseInt(formData.get('triageScore')) || 0,
        red_flag: formData.get('redFlag') === 'Yes',
        triage_reason: formData.get('triageReason'),
        status: formData.get('status') || 'WAITING',
        
        // Vitals data
        bp_sys: parseInt(formData.get('bp_sys')) || null,
        bp_dia: parseInt(formData.get('bp_dia')) || null,
        hr: parseInt(formData.get('hr')) || null,
        rr: parseInt(formData.get('rr')) || null,
        spo2: parseInt(formData.get('spo2')) || null,
        temp: parseFloat(formData.get('temp')) || null
      };

      console.log('Patient Registration Data:', patientData);
      
      try {
        // Send data to server/backend
        const response = await fetch('/api/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(patientData)
        });

        if (response.ok) {
          alert('Patient registered successfully!');
          patientForm.reset();
          resetNoneCheckboxes();
          registerBox.style.display = 'none';
          
          // Refresh patient list if on dashboard
          if (typeof loadPatients === 'function') {
            const patients = await fetch('/api/patients').then(res => res.json());
            loadPatients(patients);
          }
        } else {
          alert('Error registering patient. Please try again.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to register patient. Please check your connection.');
      }
    });
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
      if (inputField.name !== 'phone') { // Phone is optional
        inputField.setAttribute('required', 'true');
      }
    }
  }

  function resetFieldPlaceholder(inputField) {
    const placeholders = {
      'patientName': 'Patient Name',
      'patientId': 'National ID',
      'age': 'Age',
      'phone': 'Phone (optional)',
      'symptoms': 'Symptoms',
      'currentMeds': 'Current Medications',
      'medicalHistory': 'Past Medical History',
      'triageReason': 'Triage Reason',
      'bp_sys': 'Systolic BP (e.g., 120)',
      'bp_dia': 'Diastolic BP (e.g., 80)',
      'hr': 'Heart Rate (e.g., 75)',
      'rr': 'Respiratory Rate (e.g., 16)',
      'spo2': 'SpO2 (e.g., 98)',
      'temp': 'Temperature (e.g., 36.8)',
      'triageScore': 'Triage Score (e.g., 8)'
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
      if (input.name !== 'phone') {
        input.setAttribute('required', 'true');
      }
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

  // --- LOGIN FUNCTIONALITY (Updated to use nurses table) ---
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const message = document.getElementById("loginMessage");

      try {
        const response = await fetch('/api/nurses/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password })
        });

        if (response.ok) {
          const data = await response.json();
          message.textContent = `Welcome ${data.full_name || username}!`;
          message.style.color = "lightgreen";
          setTimeout(() => {
            window.location.href = "dashboard.html"; 
          }, 1000);
        } else {
          message.textContent = "Invalid credentials.";
          message.style.color = "red";
        }
      } catch (error) {
        console.error('Login error:', error);
        message.textContent = "Login failed. Please try again.";
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

// ACCESSIBILITY FUNCTIONALITY (unchanged)
function initializeAccessibility() {
  // ... (keep the same accessibility code)
}

// Reset all accessibility settings (unchanged)
function resetAccessibility() {
  // ... (keep the same reset code)
}

// PATIENT DASHBOARD FUNCTION
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
  }
  if (btnQueue) {
    btnQueue.addEventListener('click', () => showSection('queue'));
  }
  if (btnInTreatment) {
    btnInTreatment.addEventListener('click', () => showSection('inTreatment'));
  }

  // --- Function to Populate Patient Tables ---
  function loadPatients(patients) {
    console.log("Loading patients:", patients.length);
    
    // Clear tables
    if (patientTableBody) patientTableBody.innerHTML = '';
    if (queueTableBody) queueTableBody.innerHTML = '';
    if (inTreatmentTableBody) inTreatmentTableBody.innerHTML = '';

    patients.forEach(patient => {
      // --- Patient Info Table (All Patients) ---
      if (patientTableBody) {
        const rowPatient = document.createElement('tr');
        rowPatient.innerHTML = `
          <td>${patient.id}</td>
          <td>${patient.name}</td>
          <td><span class="triage-level level-${patient.triage_level}">Level ${patient.triage_level}</span></td>
          <td>${patient.symptom || 'No symptoms recorded'}</td>
          <td>${patient.status}</td>
          <td class="text-right">
            <button class="info-btn" data-patient-id="${patient.id}">View Info</button>
          </td>
        `;
        patientTableBody.appendChild(rowPatient);
      }

      // --- Queue Table (Level 2 & 3, waiting) ---
      if (queueTableBody && patient.triage_level >= 2 && patient.status === "WAITING") {
        const createdTime = new Date(patient.created_at);
        const waitTime = Math.floor((Date.now() - createdTime) / (1000 * 60));
        const rowQueue = document.createElement('tr');
        rowQueue.innerHTML = `
          <td>${patient.id}</td>
          <td>${patient.name}</td>
          <td><span class="triage-level level-${patient.triage_level}">Level ${patient.triage_level}</span></td>
          <td>${patient.symptom || 'No symptoms recorded'}</td>
          <td>${waitTime > 0 ? waitTime + ' min' : '< 1 min'}</td>
          <td class="text-right">
            <button class="action-btn admit-btn" data-patient-id="${patient.id}">Admit to Treatment</button>
          </td>
        `;
        queueTableBody.appendChild(rowQueue);
      }

      // --- In-Treatment Table (Level 1, in treatment) ---
      if (inTreatmentTableBody && patient.triage_level === 1 && patient.status === "IN_TREATMENT") {
        const rowTreatment = document.createElement('tr');
        rowTreatment.innerHTML = `
          <td>${patient.id}</td>
          <td>${patient.name}</td>
          <td><span class="triage-level level-${patient.triage_level}">Level ${patient.triage_level}</span></td>
          <td>${patient.symptom || 'No symptoms recorded'}</td>
          <td>${patient.updated_at ? new Date(patient.updated_at).toLocaleTimeString() : '-'}</td>
          <td class="text-right">
            <button class="action-btn discharge-btn" data-patient-id="${patient.id}">Discharge</button>
          </td>
        `;
        inTreatmentTableBody.appendChild(rowTreatment);
      }
    });

    // --- Attach View Button Events ---
    document.querySelectorAll('.info-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const patientId = btn.getAttribute('data-patient-id');
        const patient = patients.find(p => p.id == patientId);
        if (patient) showPatientModal(patient);
      });
    });

    // --- Attach Admit Button Events ---
    document.querySelectorAll('.admit-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const patientId = btn.getAttribute('data-patient-id');
        try {
          const response = await fetch(`/api/patients/${patientId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'IN_TREATMENT' })
          });
          
          if (response.ok) {
            // Refresh the patient list
            const patients = await fetch('/api/patients').then(res => res.json());
            loadPatients(patients);
          }
        } catch (error) {
          console.error('Error admitting patient:', error);
        }
      });
    });

    // --- Attach Discharge Button Events ---
    document.querySelectorAll('.discharge-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const patientId = btn.getAttribute('data-patient-id');
        try {
          const response = await fetch(`/api/patients/${patientId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'TREATED' })
          });
          
          if (response.ok) {
            // Refresh the patient list
            const patients = await fetch('/api/patients').then(res => res.json());
            loadPatients(patients);
          }
        } catch (error) {
          console.error('Error discharging patient:', error);
        }
      });
    });
  }

  // --- Show Patient Modal ---
  function showPatientModal(patient) {
    console.log("Showing modal for patient:", patient.name);
    
    // Update modal content to match SQL structure
    const modalPatientName = document.getElementById('modalPatientName');
    const modalPatientId = document.getElementById('modalPatientId');
    const modalPatientAge = document.getElementById('modalPatientAge');
    const modalPatientGender = document.getElementById('modalPatientGender');
    const modalPhone = document.getElementById('modalPhone');
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
    if (modalPatientId) modalPatientId.textContent = patient.national_id || '-';
    if (modalPatientAge) modalPatientAge.textContent = patient.age || '-';
    if (modalPatientGender) modalPatientGender.textContent = patient.gender || '-';
    if (modalPhone) modalPhone.textContent = patient.phone || '-';
    if (modalTriageLevel) modalTriageLevel.textContent = patient.triage_level || '-';
    if (modalSymptoms) modalSymptoms.textContent = patient.symptom || '-';
    if (modalCurrentMeds) modalCurrentMeds.textContent = patient.current_medications || '-';
    if (modalPastHistory) modalPastHistory.textContent = patient.past_medical_history || '-';
    if (modalBpSys) modalBpSys.textContent = patient.bp_sys || '-';
    if (modalBpDia) modalBpDia.textContent = patient.bp_dia || '-';
    if (modalHr) modalHr.textContent = patient.hr || '-';
    if (modalRr) modalRr.textContent = patient.rr || '-';
    if (modalSpo2) modalSpo2.textContent = patient.spo2 || '-';
    if (modalTemp) modalTemp.textContent = patient.temp || '-';
    if (modalTriageScore) modalTriageScore.textContent = patient.triage_score || '-';
    if (modalRedFlag) modalRedFlag.textContent = patient.red_flag ? 'Yes' : 'No';
    if (modalTriageReason) modalTriageReason.textContent = patient.triage_reason || '-';
    if (modalCreatedAt) modalCreatedAt.textContent = patient.created_at ? new Date(patient.created_at).toLocaleString() : '-';
    if (modalUpdatedAt) modalUpdatedAt.textContent = patient.updated_at ? new Date(patient.updated_at).toLocaleString() : '-';
    if (modalStatus) modalStatus.textContent = patient.status || '-';

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

  // --- Load patients from backend ---
  async function loadPatientsFromServer() {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const patients = await response.json();
        loadPatients(patients);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  }

  // Initialize dashboard
  loadPatientsFromServer();
  showSection('patientInfo');
  console.log("Patient dashboard initialized successfully");
}