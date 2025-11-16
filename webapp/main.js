// main.js
document.addEventListener("DOMContentLoaded", () => {

  // --- REGISTER BUTTON LOGIC ---
  const registerBtn = document.getElementById('registerBtn');
  const registerBox = document.getElementById('registerBox');
  const cancelRegister = document.getElementById('cancelRegister');
  const viewBtn = document.getElementById('viewBtn');

  if (registerBtn && registerBox && cancelRegister) {
    registerBtn.addEventListener('click', () => {
      registerBox.style.display = 'block';
    });
    cancelRegister.addEventListener('click', () => {
      registerBox.style.display = 'none';
    });
  }

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

  // --- PATIENT DASHBOARD LOGIC ---
  function initializePatientDashboard() {
    // Navigation buttons
    const btnPatientInfo = document.getElementById('btnPatientInfo');
    const btnQueue = document.getElementById('btnQueue');
    const btnInTreatment = document.getElementById('btnInTreatment');
    const btnNurseInfo = document.getElementById('btnNurseInfo');
    
    // Content sections
    const patientInfoSection = document.getElementById('patientInfoSection');
    const queueSection = document.getElementById('queueSection');
    const inTreatmentSection = document.getElementById('inTreatmentSection');
    
    // Modals
    const patientModal = document.getElementById('patientModal');
    const nurseModal = document.getElementById('nurseModal');
    
    // Patient data (in real app, this would come from API)
    const patientData = {
      'P001': {
        name: 'John Smith',
        age: 45,
        gender: 'Male',
        triageLevel: 'Level 1',
        symptoms: 'Chest pain, shortness of breath, sweating, nausea',
        medicalHistory: 'Hypertension, high cholesterol. Previous heart attack in 2020. Family history of heart disease.'
      },
      'P002': {
        name: 'Maria Garcia',
        age: 32,
        gender: 'Female',
        triageLevel: 'Level 2',
        symptoms: 'High fever (102°F), severe headache, neck stiffness, sensitivity to light',
        medicalHistory: 'No significant medical history. Allergic to penicillin.'
      },
      'P003': {
        name: 'Robert Johnson',
        age: 28,
        gender: 'Male',
        triageLevel: 'Level 3',
        symptoms: 'Minor cut on left forearm, bruising on right knee. Pain level 3/10.',
        medicalHistory: 'Asthma, uses inhaler as needed. No surgeries.'
      },
      'P004': {
        name: 'Sarah Wilson',
        age: 65,
        gender: 'Female',
        triageLevel: 'Level 1',
        symptoms: 'Unconscious, head injury from fall, unequal pupils',
        medicalHistory: 'Diabetes type 2, osteoporosis. Previous hip replacement surgery.'
      },
      'P005': {
        name: 'David Brown',
        age: 38,
        gender: 'Male',
        triageLevel: 'Level 2',
        symptoms: 'Severe abdominal pain, vomiting, fever, loss of appetite',
        medicalHistory: 'Appendectomy in 2015. No other significant history.'
      }
    };

    // Only initialize if we're on the patient dashboard page
    if (btnPatientInfo && patientInfoSection) {
      // Navigation functionality
      function showSection(section) {
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

      // Event listeners for navigation buttons
      if (btnPatientInfo) {
        btnPatientInfo.addEventListener('click', () => showSection('patientInfo'));
      }
      if (btnQueue) {
        btnQueue.addEventListener('click', () => showSection('queue'));
      }
      if (btnInTreatment) {
        btnInTreatment.addEventListener('click', () => showSection('inTreatment'));
      }

      // Nurse info button
      if (btnNurseInfo) {
        btnNurseInfo.addEventListener('click', () => {
          if (nurseModal) nurseModal.classList.remove('hidden');
        });
      }

      // Patient info buttons
      document.querySelectorAll('.info-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const patientId = this.getAttribute('data-patient');
          const patient = patientData[patientId];
          
          if (patient && patientModal) {
            // Populate modal with patient data
            const modalPatientName = document.getElementById('modalPatientName');
            const modalPatientId = document.getElementById('modalPatientId');
            const modalTriageLevel = document.getElementById('modalTriageLevel');
            const modalPatientAge = document.getElementById('modalPatientAge');
            const modalPatientGender = document.getElementById('modalPatientGender');
            const modalSymptoms = document.getElementById('modalSymptoms');
            const modalMedicalHistory = document.getElementById('modalMedicalHistory');
            
            if (modalPatientName) modalPatientName.textContent = patient.name;
            if (modalPatientId) modalPatientId.textContent = patientId;
            if (modalTriageLevel) modalTriageLevel.textContent = patient.triageLevel;
            if (modalPatientAge) modalPatientAge.textContent = patient.age;
            if (modalPatientGender) modalPatientGender.textContent = patient.gender;
            if (modalSymptoms) modalSymptoms.textContent = patient.symptoms;
            if (modalMedicalHistory) modalMedicalHistory.textContent = patient.medicalHistory;
            
            // Show modal
            patientModal.classList.remove('hidden');
          }
        });
      });

      // Modal tab functionality
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const tabName = this.getAttribute('data-tab');
          
          // Remove active class from all tabs
          document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
          
          // Activate clicked tab
          this.classList.add('active');
          const tabPane = document.getElementById(tabName + 'Tab');
          if (tabPane) tabPane.classList.add('active');
        });
      });

      // Close modal buttons
      document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
          if (patientModal) patientModal.classList.add('hidden');
          if (nurseModal) nurseModal.classList.add('hidden');
        });
      });

      // Close modal when clicking outside
      if (patientModal) {
        patientModal.addEventListener('click', function(e) {
          if (e.target === this) {
            this.classList.add('hidden');
          }
        });
      }
      
      if (nurseModal) {
        nurseModal.addEventListener('click', function(e) {
          if (e.target === this) {
            this.classList.add('hidden');
          }
        });
      }

      // Admit to treatment buttons
      document.querySelectorAll('.admit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const patientId = this.getAttribute('data-patient');
          const row = this.closest('tr');
          if (row) {
            const patientName = row.cells[1].textContent;
            if (confirm(`Admit ${patientName} to treatment?`)) {
              alert(`${patientName} has been admitted to treatment.`);
              // In real application, this would update the backend
            }
          }
        });
      });

      // Discharge buttons
      document.querySelectorAll('.discharge-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const patientId = this.getAttribute('data-patient');
          const row = this.closest('tr');
          if (row) {
            const patientName = row.cells[1].textContent;
            if (confirm(`Discharge ${patientName}?`)) {
              alert(`${patientName} has been discharged.`);
              // In real application, this would update the backend
            }
          }
        });
      });

      // Initialize with patient info section visible
      showSection('patientInfo');
    }

    // Legacy navigation for old dashboard style (if exists)
    const navItems = document.querySelectorAll('.nav-item');
    const tables = document.querySelectorAll('.table-container table');
    
    if (navItems.length > 0) {
      navItems.forEach(item => {
        item.addEventListener('click', function() {
          // Remove active class from all items
          navItems.forEach(nav => nav.classList.remove('active'));
          
          // Add active class to clicked item
          this.classList.add('active');
          
          // Hide all tables
          tables.forEach(table => table.classList.add('table-hidden'));
          
          // Show selected table
          const target = this.getAttribute('data-target');
          if (target) {
            const targetTable = document.getElementById(target);
            if (targetTable) targetTable.classList.remove('table-hidden');
          }
        });
      });
    }

    // Legacy button functionality (if exists)
    const btnAddPatient = document.getElementById('btnAddPatient');
    const btnRefresh = document.getElementById('btnRefresh');

    if (btnAddPatient) {
      btnAddPatient.addEventListener('click', function() {
        alert('Add Patient functionality would go here');
      });
    }

    if (btnRefresh) {
      btnRefresh.addEventListener('click', function() {
        alert('Refreshing data...');
        // In a real application, this would fetch updated data from the server
      });
    }
  }

  // Initialize patient dashboard
  initializePatientDashboard();

});