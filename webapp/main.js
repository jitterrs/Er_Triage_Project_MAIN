document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded - checking for dashboard elements...");

  // --- AUTO-FILL ADMIN LOGIN ---
  const usernameField = document.getElementById("username");
  const passwordField = document.getElementById("password");
  if (usernameField && passwordField) {
    usernameField.value = "admin";
    passwordField.value = "1234";  // <-- set your admin password here
  }

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

  // NONE CHECKBOX FUNCTIONALITY
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
      'bp': '120/80',
      'hr': '75',
      'rr': '16',
      'spo2': '98',
      'temp': '36.8',
      'triageScore': '8'
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

  // INPUT VALIDATION
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

  // VIEW PATIENT BUTTON LOGIC
  if (viewBtn) {
    viewBtn.addEventListener('click', () => {
      window.location.href = "patientDashboard.html";
    });
  }

  // --- LOGIN FUNCTIONALITY (FINAL) ---
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const message = document.getElementById("loginMessage");

      if (!username || !password) {
        message.textContent = "Please enter username and password.";
        message.style.color = "red";
        return;
      }

      message.textContent = "Logging in...";
      message.style.color = "black";

      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({ username, password }).toString()
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          message.textContent = data.message || "Invalid credentials";
          message.style.color = "red";
          return;
        }

        message.textContent = "Login successful!";
        message.style.color = "lightgreen";

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 700);

      } catch (err) {
        console.error(err);
        message.textContent = "Server error";
        message.style.color = "red";
      }
    });
  }

  // PATIENT DASHBOARD LOGIC
  if (document.getElementById('btnPatientInfo')) {
    initializePatientDashboard();
  }
});
