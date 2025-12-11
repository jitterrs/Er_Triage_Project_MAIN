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
        status: formData.get('status'),
        waitTime: formData.get('waitTime'),
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

      console.log('Patient Registration Data:', patientData);
      alert('Patient registered successfully!');

      patientForm.reset();
      resetNoneCheckboxes();
      registerBox.style.display = 'none';
    });
  }

  function generatePatientId() {
    return 'PAT' + Date.now().toString().slice(-6);
  }

  // --- NONE CHECKBOX FUNCTIONALITY ---
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
    // Intentionally left blank: real login will be wired to backend later.
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

  if (!toggleBtn || !panel) return;

  toggleBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    panel.classList.toggle('accessibility-hidden');
  });

  if (brightnessSlider && brightnessValue) {
    brightnessSlider.addEventListener('input', function() {
      document.documentElement.style.filter = `brightness(${this.value}%)`;
      brightnessValue.textContent = this.value + '%';
    });
  }

  const highContrastCheckbox = document.getElementById('highContrast');
  if (highContrastCheckbox) {
    highContrastCheckbox.addEventListener('change', function(e) {
      document.body.classList.toggle('high-contrast', e.target.checked);
    });
  }

  const largeTextCheckbox = document.getElementById('largeText');
  if (largeTextCheckbox) {
    largeTextCheckbox.addEventListener('change', function(e) {
      document.body.classList.toggle('large-text', e.target.checked);
    });
  }

  const reduceMotionCheckbox = document.getElementById('reduceMotion');
  if (reduceMotionCheckbox) {
    reduceMotionCheckbox.addEventListener('change', function(e) {
      document.body.classList.toggle('reduced-motion', e.target.checked);
    });
  }

  const reduceBrightnessCheckbox = document.getElementById('reduceBrightness');
  if (reduceBrightnessCheckbox && brightnessSlider) {
    reduceBrightnessCheckbox.addEventListener('change', function(e) {
      brightnessSlider.value = e.target.checked ? 70 : 100;
      document.documentElement.style.filter = `brightness(${brightnessSlider.value}%)`;
      if (brightnessValue) brightnessValue.textContent = brightnessSlider.value + '%';
    });
  }

  document.addEventListener('click', function(e) {
    if (panel && !panel.contains(e.target) && !toggleBtn.contains(e.target)) {
      panel.classList.add('accessibility-hidden');
    }
  });
}

function resetAccessibility() {
  document.documentElement.style.filter = 'brightness(100%)';
  document.body.classList.remove('high-contrast', 'large-text', 'reduced-motion');

  const ids = ['reduceBrightness', 'highContrast', 'largeText', 'reduceMotion'];
  ids.forEach(id => {
    const box = document.getElementById(id);
    if (box) box.checked = false;
  });

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

  // ❌ REMOVED SAMPLE PATIENT DATA
  const samplePatients = [];

  function showSection(section) {
    if (patientInfoSection) patientInfoSection.classList.add('hidden');
    if (queueSection) queueSection.classList.add('hidden');
    if (inTreatmentSection) inTreatmentSection.classList.add('hidden');

    if (btnPatientInfo) btnPatientInfo.classList.remove('active');
    if (btnQueue) btnQueue.classList.remove('active');
    if (btnInTreatment) btnInTreatment.classList.remove('active');

    if (section === 'patientInfo') {
      patientInfoSection.classList.remove('hidden');
      btnPatientInfo.classList.add('active');
    }
    if (section === 'queue') {
      queueSection.classList.remove('hidden');
      btnQueue.classList.add('active');
    }
    if (section === 'inTreatment') {
      inTreatmentSection.classList.remove('hidden');
      btnInTreatment.classList.add('active');
    }
  }

  if (btnPatientInfo) btnPatientInfo.addEventListener('click', () => showSection('patientInfo'));
  if (btnQueue) btnQueue.addEventListener('click', () => showSection('queue'));
  if (btnInTreatment) btnInTreatment.addEventListener('click', () => showSection('inTreatment'));

  function loadPatients(patients) {
    if (patientTableBody) patientTableBody.innerHTML = '';
    if (queueTableBody) queueTableBody.innerHTML = '';
    if (inTreatmentTableBody) inTreatmentTableBody.innerHTML = '';
  }

  function showPatientModal() {
    if (patientModal) patientModal.classList.remove('hidden');
  }

  modalTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalTabBtns.forEach(b => b.classList.remove('active'));
      modalTabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const tabPane = document.getElementById(btn.getAttribute('data-tab'));
      if (tabPane) tabPane.classList.add('active');
    });
  });

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

  loadPatients(samplePatients);
  showSection('patientInfo');
  console.log("Patient dashboard initialized");
}
