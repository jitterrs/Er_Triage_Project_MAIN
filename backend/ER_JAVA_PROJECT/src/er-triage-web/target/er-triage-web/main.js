// =====================================================================
//  MAIN.JS – Backend Connected Version
//  Works with the following API endpoints:
//
//  POST   /er-triage-web/api/patients
//  GET    /er-triage-web/api/patients
//  GET    /er-triage-web/api/patients/{id}
//  POST   /er-triage-web/api/patients/{id}/status
//  POST   /er-triage-web/api/patients/{id}/vitals   (future)
//  POST   /er-triage-web/api/patients/{id}/symptoms (future)
// =====================================================================

// Global Elements
const patientForm = document.getElementById('patientForm');
const patientTableBody = document.getElementById('patientTableBody');
const registerBox = document.getElementById('registerBox');

// ==========================================================
//  Helper: Reset "None" checkboxes in symptoms list
// ==========================================================
function resetNoneCheckboxes() {
    document.getElementById("none").checked = false;
}


// =====================================================================
//  BACKEND API HELPERS
// =====================================================================
async function apiGet(path) {
    const res = await fetch(`/er-triage-web${path}`);
    return await res.json();
}

async function apiPost(path, bodyObj) {
    const res = await fetch(`/er-triage-web${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj)
    });
    return await res.json();
}


// =====================================================================
//  REGISTER NEW PATIENT  → POST /api/patients
// =====================================================================
patientForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Read form inputs
    const name = document.getElementById('fullName').value;
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;

    // Symptoms
    const symptomCheckboxes = document.querySelectorAll('.symptom:checked');
    let symptoms = [];

    symptomCheckboxes.forEach(cb => symptoms.push(cb.value));

    if (symptoms.includes("None")) {
        symptoms = ["None"];
    }

    const patientData = {
        name: name,
        age: age,
        gender: gender,
        symptoms: symptoms.join(", ")
    };

    try {
        const created = await apiPost('/api/patients', patientData);

        alert(`Patient registered successfully! Triage Level: ${created.triageLevel}`);

        patientForm.reset();
        resetNoneCheckboxes();
        registerBox.style.display = 'none';

        refreshDashboard();
    } catch (err) {
        alert("Error creating patient.");
        console.error(err);
    }
});


// =====================================================================
//  LOAD DASHBOARD PATIENTS → GET /api/patients
// =====================================================================
async function refreshDashboard() {
    try {
        const patients = await apiGet('/api/patients');
        loadPatients(patients);
    } catch (err) {
        console.error("Failed to load patient list:", err);
    }
}

// Refresh every 10 seconds
setInterval(refreshDashboard, 10000);


// =====================================================================
//  RENDER PATIENTS IN THE TABLE
// =====================================================================
function loadPatients(patients) {
    patientTableBody.innerHTML = "";

    patients.forEach(patient => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.triageLevel}</td>
            <td>${patient.status}</td>
            <td>
                <button class="view-btn" data-id="${patient.id}">View Info</button>
                <button class="admit-btn" data-id="${patient.id}">Admit</button>
                <button class="discharge-btn" data-id="${patient.id}">Discharge</button>
            </td>
        `;

        patientTableBody.appendChild(row);
    });

    attachActionButtons();
}


// =====================================================================
//  ATTACH BUTTON HANDLERS FOR VIEW / ADMIT / DISCHARGE
// =====================================================================
function attachActionButtons() {

    // View Info (modal)
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const patientId = this.dataset.id;

            try {
                const patient = await apiGet(`/api/patients/${patientId}`);
                showPatientModal(patient);
            } catch (err) {
                console.error("Failed to load patient info:", err);
            }
        });
    });


    // Admit Patient (IN_TREATMENT)
    document.querySelectorAll('.admit-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const patientId = this.dataset.id;

            await apiPost(`/api/patients/${patientId}/status`, {
                newstatus: "IN_TREATMENT"
            });

            refreshDashboard();
        });
    });


    // Discharge Patient (TREATED)
    document.querySelectorAll('.discharge-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const patientId = this.dataset.id;

            await apiPost(`/api/patients/${patientId}/status`, {
                newstatus: "TREATED"
            });

            refreshDashboard();
        });
    });
}


// =====================================================================
//  SHOW PATIENT DETAILS IN A MODAL (FRONT-END ONLY DISPLAY)
// =====================================================================
function showPatientModal(patient) {
    const modal = document.getElementById("patientModal");
    const modalContent = document.getElementById("modalContent");

    modalContent.innerHTML = `
        <h2>Patient Info</h2>
        <p><strong>ID:</strong> ${patient.id}</p>
        <p><strong>Name:</strong> ${patient.name}</p>
        <p><strong>Age:</strong> ${patient.age}</p>
        <p><strong>Gender:</strong> ${patient.gender}</p>
        <p><strong>Symptoms:</strong> ${patient.symptoms}</p>
        <p><strong>Triage Level:</strong> ${patient.triageLevel}</p>
        <p><strong>Status:</strong> ${patient.status}</p>
        <button onclick="closeModal()">Close</button>
    `;

    modal.style.display = "block";
}

function closeModal() {
    document.getElementById("patientModal").style.display = "none";
}


// Initial load
refreshDashboard();
// ============================================================
// PATIENT DASHBOARD (queueTable + inTreatmentTable)
// ============================================================

async function refreshPatientDashboard() {
    // Only run on patientDashboard.html (tables exist there)
    const queueTable = document.getElementById("queueTable");
    const inTreatmentTable = document.getElementById("inTreatmentTable");
    if (!queueTable || !inTreatmentTable) return;

    await Promise.all([loadQueueTable(), loadInTreatmentTable()]);
}

async function loadQueueTable() {
    const table = document.getElementById("queueTable");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    // Best source for wait time is /api/queue/public (WaitingRoomView)
    // If it doesn't exist, fallback to /api/patients
    let data;
    try {
        data = await apiGet("/api/queue/public");
    } catch (e) {
        data = await apiGet("/api/patients?page=0&size=50");
    }

    data.forEach(p => {
        const id = p.id;
        const name = p.name ?? "-";
        const triage = p.triageLevel ?? "-";
        const symptoms = p.symptoms ?? "-";
        const waitTime = p.waitTime ?? "-"; // may exist only in /queue/public

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${id}</td>
            <td>${name}</td>
            <td>${triage}</td>
            <td>${symptoms}</td>
            <td>${waitTime}</td>
            <td>
                <button class="view-btn" data-id="${id}">View</button>
                <button class="admit-btn" data-id="${id}">Admit</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    attachPatientDashboardButtons();
}

async function loadInTreatmentTable() {
    const table = document.getElementById("inTreatmentTable");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    const list = await apiGet("/api/patients/inTreatment?page=0&size=50");

    list.forEach(p => {
        const id = p.id;
        const name = p.name ?? "-";
        const triage = p.triageLevel ?? "-";
        const symptoms = p.symptoms ?? "-";
        const start = p.treatmentStart ?? "-"; // if not provided by backend, it will show "-"

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${id}</td>
            <td>${name}</td>
            <td>${triage}</td>
            <td>${symptoms}</td>
            <td>${start}</td>
            <td>
                <button class="view-btn" data-id="${id}">View</button>
                <button class="discharge-btn" data-id="${id}">Discharge</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    attachPatientDashboardButtons();
}

function attachPatientDashboardButtons() {
    // View
    document.querySelectorAll(".view-btn").forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            const patient = await apiGet(`/api/patients/${id}`);
            showPatientModal(patient);
        };
    });

    // Admit
    document.querySelectorAll(".admit-btn").forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            await apiPost(`/api/patients/${id}/status`, { newStatus: "IN_TREATMENT" });
            await refreshPatientDashboard();
        };
    });

    // Discharge
    document.querySelectorAll(".discharge-btn").forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            await apiPost(`/api/patients/${id}/status`, { newStatus: "TREATED" });
            await refreshPatientDashboard();
        };
    });
}

// Run both dashboards safely (each function checks if its page exists)
refreshDashboard();
refreshPatientDashboard();
