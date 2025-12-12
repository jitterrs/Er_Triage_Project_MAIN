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

const API_BASE = "/er-triage-web/api";

async function createPatient() {
    const name = document.getElementById("name").value;
    const age = parseInt(document.getElementById("age").value);
    const gender = document.getElementById("gender").value;
    const symptoms = document.getElementById("symptoms").value;

    const payload = {
        name,
        age,
        gender,
        symptoms
    };

    try {
        const response = await fetch(`${API_BASE}/patients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Failed to create patient");
        }

        const patient = await response.json();

        alert(`Patient created!\nID: ${patient.id}\nTriage Level: ${patient.triageLevel}`);
        console.log(patient);

    } catch (err) {
        console.error(err);
        alert("Error creating patient");
    }
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
                status: "IN_TREATMENT"
            });

            refreshDashboard();
        });
    });


    // Discharge Patient (TREATED)
    document.querySelectorAll('.discharge-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const patientId = this.dataset.id;

            await apiPost(`/api/patients/${patientId}/status`, {
                status: "TREATED"
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
