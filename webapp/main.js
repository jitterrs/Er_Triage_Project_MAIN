document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded - checking for dashboard elements...");

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

  // ========================
  // PATIENT DASHBOARD LOGIC
  // ========================
  
  // Check if we're on the patient dashboard page FIRST
  if (document.getElementById('btnPatientInfo')) {
    console.log("Patient dashboard detected - initializing...");
    initializePatientDashboard();
  }
});

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

  // --- Admit / Discharge Buttons ---
  const modalAdmitBtn = document.getElementById('modalAdmitBtn');
  const modalDischargeBtn = document.getElementById('modalDischargeBtn');

  // --- Patient Tables ---
  const patientTableBody = document.querySelector("#patientTable tbody");
  const queueTableBody = document.querySelector("#queueTable tbody");
  const inTreatmentTableBody = document.querySelector("#inTreatmentTable tbody");

  // Auto-refresh interval (30 seconds)
  let refreshInterval;
  const REFRESH_INTERVAL_MS = 30000; // 30 seconds

  // Start auto-refresh
  function startAutoRefresh() {
    refreshInterval = setInterval(() => {
      console.log("Auto-refreshing patient data...");
      loadPatientsFromDatabase();
    }, REFRESH_INTERVAL_MS);
  }

  // Stop auto-refresh (if needed)
  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  }

  // --- Fetch patients from database ---
  async function loadPatientsFromDatabase() {
    try {
      console.log("Fetching patients from database...");
      const response = await fetch('http://localhost:8080/er_triage_db/patients');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const patients = await response.json();
      console.log("Patients fetched:", patients.length);
      loadPatients(patients);
      
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Fallback to sample data if database is unavailable
      console.log("Using sample data as fallback...");
      loadPatients(getSamplePatients());
    }
  }

  // --- Update patient status in database ---
  async function updatePatientStatus(patientId, newStatus) {
    try {
      const response = await fetch(`http://localhost:8080/er_triage_db/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          treatmentStart: newStatus === 'IN_TREATMENT' ? new Date().toLocaleTimeString() : null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`Patient ${patientId} status updated to ${newStatus}`);
      return true;
    } catch (error) {
      console.error('Error updating patient status:', error);
      return false;
    }
  }

  // Sample data fallback
  function getSamplePatients() {
    return [
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
  }

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
      // Convert database status to display status
      const displayStatus = patient.status === 'WAITING' ? 'Waiting' : 
                           patient.status === 'IN_TREATMENT' ? 'In Treatment' : 'Treated';

      // Calculate wait time (simplified - you can enhance this)
      const waitTime = patient.status === 'WAITING' ? 
        (Math.floor(Math.random() * 30) + 5) + ' min' : '-';

      // --- Patient Info Table (All Patients) ---
      if (patientTableBody) {
        const rowPatient = document.createElement('tr');
        rowPatient.innerHTML = `
          <td>${patient.id}</td>
          <td>${patient.name}</td>
          <td><span class="triage-level level-${patient.triageLevel}">Level ${patient.triageLevel}</span></td>
          <td>${patient.symptom || patient.symptoms}</td>
          <td class="text-right"><button class="info-btn" data-patient-id="${patient.id}">View</button></td>
        `;
        patientTableBody.appendChild(rowPatient);
      }

      // --- Queue Table (Level 2 & 3, waiting) ---
      if (queueTableBody && patient.triageLevel >= 2 && patient.status === "WAITING") {
        const rowQueue = document.createElement('tr');
        rowQueue.innerHTML = `
          <td>${patient.id}</td>
          <td>${patient.name}</td>
          <td><span class="triage-level level-${patient.triageLevel}">Level ${patient.triageLevel}</span></td>
          <td>${patient.symptom || patient.symptoms}</td>
          <td>${waitTime}</td>
          <td><button class="info-btn" data-patient-id="${patient.id}">View</button></td>
        `;
        queueTableBody.appendChild(rowQueue);
      }

      // --- In-Treatment Table (Level 1, in treatment) ---
      if (inTreatmentTableBody && patient.triageLevel === 1 && patient.status === "IN_TREATMENT") {
        const rowTreatment = document.createElement('tr');
        rowTreatment.innerHTML = `
          <td>${patient.id}</td>
          <td>${patient.name}</td>
          <td><span class="triage-level level-${patient.triageLevel}">Level ${patient.triageLevel}</span></td>
          <td>${patient.symptom || patient.symptoms}</td>
          <td>${patient.treatmentStart || '-'}</td>
          <td><button class="info-btn" data-patient-id="${patient.id}">View</button></td>
        `;
        inTreatmentTableBody.appendChild(rowTreatment);
      }
    });

    console.log("Tables populated, attaching modal events...");

    // --- Attach Modal Event to all info buttons ---
    document.querySelectorAll('.info-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const patientId = btn.getAttribute('data-patient-id');
        const patient = patients.find(p => p.id == patientId);
        console.log("View button clicked for patient:", patientId, patient);
        if (patient) showPatientModal(patient);
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

    // Show/hide admit/discharge buttons based on status
    if (modalAdmitBtn) {
      modalAdmitBtn.style.display = patient.status === "IN_TREATMENT" ? "none" : "inline-block";
      modalAdmitBtn.onclick = async () => {
        const success = await updatePatientStatus(patient.id, 'IN_TREATMENT');
        if (success) {
          loadPatientsFromDatabase(); // Refresh data
        }
        if (patientModal) patientModal.classList.add('hidden');
      };
    }

    if (modalDischargeBtn) {
      modalDischargeBtn.style.display = patient.status === "WAITING" ? "none" : "inline-block";
      modalDischargeBtn.onclick = async () => {
        const success = await updatePatientStatus(patient.id, 'TREATED');
        if (success) {
          loadPatientsFromDatabase(); // Refresh data
        }
        if (patientModal) patientModal.classList.add('hidden');
      };
    }

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
  loadPatientsFromDatabase(); // Load from database first
  showSection('patientInfo');
  startAutoRefresh(); // Start auto-refresh
  console.log("Patient dashboard initialized successfully with auto-refresh");
}