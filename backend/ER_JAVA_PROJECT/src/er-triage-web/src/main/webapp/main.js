// =====================================================================
// MAIN.JS – Page-safe + Backend Connected (Auto context)
// Context example: http://localhost:8080/er-triage-web/
// =====================================================================

(() => {
  "use strict";

  // ==========================================================
  // Auto-detect context path (e.g. "/er-triage-web")
  // ==========================================================
  function detectContextPath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "";
    return "/" + parts[0];
  }

  const APP_CTX = detectContextPath();
  const API_BASE = `${APP_CTX}/api`;

  // ==========================================================
  // Helpers
  // ==========================================================
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function toIntOrNull(v) {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const n = Number.parseInt(s, 10);
    return Number.isFinite(n) ? n : null;
  }

  function toFloatOrNull(v) {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const n = Number.parseFloat(s);
    return Number.isFinite(n) ? n : null;
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ==========================================================
  // API
  // ==========================================================
  async function apiGet(path) {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`GET ${url} failed: ${res.status} ${text}`);
    }
    return await res.json();
  }

  async function apiPost(path, body) {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body ?? {}),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`POST ${url} failed: ${res.status} ${text}`);
    }

    const text = await res.text().catch(() => "");
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  }

  // ==========================================================
  // Login page (index.html)
  // ==========================================================
  function initLoginPage() {
    const loginForm = qs("#loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      window.location.href = `${APP_CTX}/dashboard.html`;
    });
  }

  // ==========================================================
  // Dashboard page (dashboard.html)
  //  IDs confirmed in your dashboard.html:
  //  viewBtn, registerBtn, registerBox, patientForm, newRegisterBtn, cancelRegister
  // ==========================================================
  function initDashboardPage() {
    const registerBox = qs("#registerBox");
    const registerBtn = qs("#registerBtn");
    const viewBtn = qs("#viewBtn");
    const patientForm = qs("#patientForm");
    const cancelRegister = qs("#cancelRegister");

    // Only run if this looks like dashboard.html
    if (!registerBox && !registerBtn && !viewBtn && !patientForm) return;

    // Default hide register box (if not already hidden by CSS)
    if (registerBox && getComputedStyle(registerBox).display !== "none") {
      // keep it visible if your CSS already controls it; but prevent "stuck" behavior
      // (no forced hide here)
    }

    if (viewBtn) {
      viewBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = `${APP_CTX}/patientDashboard.html`;
      });
    }

    if (registerBtn && registerBox) {
      registerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        registerBox.style.display = "block";
      });
    }

    // Cancel button must NOT submit anything
    if (cancelRegister && registerBox) {
      cancelRegister.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Hide and reset
        registerBox.style.display = "none";
        if (patientForm) patientForm.reset();

        // Re-enable fields disabled by "none" checkboxes
        qsa('input[type="checkbox"][id$="-none"]').forEach((cb) => {
          cb.checked = false;
          const row = cb.closest(".form-row");
          if (!row) return;
          const field = row.querySelector(
            'input:not([type="checkbox"]), textarea, select'
          );
          if (field) field.disabled = false;
        });
      });
    }

    // "None" checkbox behavior (disable/enable the field in the same row)
    qsa('input[type="checkbox"][id$="-none"]').forEach((cb) => {
      cb.addEventListener("change", () => {
        const row = cb.closest(".form-row");
        if (!row) return;

        const field = row.querySelector(
          'input:not([type="checkbox"]), textarea, select'
        );
        if (!field) return;

        if (cb.checked) {
          field.value = "";
          field.disabled = true;
        } else {
          field.disabled = false;
        }
      });
    });

    if (!patientForm) return;

    patientForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Matches your dashboard.html "name" attributes
      const patientName = patientForm.elements["patientName"]?.value ?? "";
      const age = toIntOrNull(patientForm.elements["age"]?.value);
      const gender = patientForm.elements["gender"]?.value ?? "";
      const symptoms = patientForm.elements["symptoms"]?.value ?? "";

      // BP is a single input (name="bp") like "120/80"
      const bpRaw = (patientForm.elements["bp"]?.value ?? "").trim();
      let bpSys = null;
      let bpDia = null;
      if (bpRaw) {
        const m = bpRaw.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
        if (m) {
          bpSys = toIntOrNull(m[1]);
          bpDia = toIntOrNull(m[2]);
        }
      }

      const hr = toIntOrNull(patientForm.elements["hr"]?.value);
      const rr = toIntOrNull(patientForm.elements["rr"]?.value);
      const spo2 = toIntOrNull(patientForm.elements["spo2"]?.value);
      const temp = toFloatOrNull(patientForm.elements["temp"]?.value);

      // Backend DTO expects these keys:
      const payload = {
        name: String(patientName).trim(),
        age: age ?? 0,
        gender: String(gender).trim(),
        symptoms: String(symptoms).trim(),
        bpSys,
        bpDia,
        hr,
        rr,
        spo2,
        temp,
      };

      try {
        const created = await apiPost("/patients", payload);
        const lvl = created?.triageLevel ?? "";
        alert(lvl ? `Patient registered! Triage Level: ${lvl}` : "Patient registered!");

        patientForm.reset();

        // reset "none" checkboxes
        qsa('input[type="checkbox"][id$="-none"]').forEach((cb) => {
          cb.checked = false;
          const row = cb.closest(".form-row");
          if (!row) return;
          const field = row.querySelector(
            'input:not([type="checkbox"]), textarea, select'
          );
          if (field) field.disabled = false;
        });

        if (registerBox) registerBox.style.display = "none";
      } catch (err) {
        console.error(err);
        alert("Error creating patient. Check console.");
      }
    });
  }

  // ==========================================================
  // Patient Dashboard (patientDashboard.html)
  // IDs confirmed:
  // btnPatientInfo, btnQueue, btnInTreatment
  // patientInfoSection, queueSection, inTreatmentSection
  // patientTable, queueTable, inTreatmentTable
  // patientModal, closeModalBtn, and many modal fields
  // ==========================================================
  async function initPatientDashboardPage() {
    const btnPatientInfo = qs("#btnPatientInfo");
    const btnQueue = qs("#btnQueue");
    const btnInTreatment = qs("#btnInTreatment");

    const patientInfoSection = qs("#patientInfoSection");
    const queueSection = qs("#queueSection");
    const inTreatmentSection = qs("#inTreatmentSection");

    const patientTable = qs("#patientTable");
    const queueTable = qs("#queueTable");
    const inTreatmentTable = qs("#inTreatmentTable");

    // If this page isn’t patientDashboard, exit
    if (!btnPatientInfo && !btnQueue && !btnInTreatment && !patientTable && !queueTable && !inTreatmentTable) {
      return;
    }

    // ---- Tab switching ----
    function setActiveTab(which) {
      // buttons
      if (btnPatientInfo) btnPatientInfo.classList.toggle("active", which === "patient");
      if (btnQueue) btnQueue.classList.toggle("active", which === "queue");
      if (btnInTreatment) btnInTreatment.classList.toggle("active", which === "treatment");

      // sections (HTML uses class "hidden")
      if (patientInfoSection) patientInfoSection.classList.toggle("hidden", which !== "patient");
      if (queueSection) queueSection.classList.toggle("hidden", which !== "queue");
      if (inTreatmentSection) inTreatmentSection.classList.toggle("hidden", which !== "treatment");
    }

    if (btnPatientInfo) btnPatientInfo.addEventListener("click", (e) => { e.preventDefault(); setActiveTab("patient"); });
    if (btnQueue) btnQueue.addEventListener("click", (e) => { e.preventDefault(); setActiveTab("queue"); });
    if (btnInTreatment) btnInTreatment.addEventListener("click", (e) => { e.preventDefault(); setActiveTab("treatment"); });

    // Default tab
    setActiveTab("patient");

    // ---- Modal ----
    const patientModal = qs("#patientModal");
    const closeModalBtn = qs("#closeModalBtn");

    function setText(id, value) {
      const el = qs("#" + id);
      if (el) el.textContent = value ?? "-";
    }

    function openModalWithPatient(p) {
      if (!patientModal) return;

      setText("modalId", p.id);
      setText("modalName", p.name);
      setText("modalNationalId", p.nationalId);
      setText("modalAge", p.age);
      setText("modalGender", p.gender);

      setText("modalBp", p.bp);
      setText("modalHr", p.hr);
      setText("modalRr", p.rr);
      setText("modalSpo2", p.spo2);
      setText("modalTemp", p.temp);

      setText("modalSymptoms", p.symptoms);
      setText("modalCurrentMeds", p.currentMeds);
      setText("modalPastHistory", p.pastHistory);

      setText("modalTriageLevel", p.triageLevel);
      setText("modalTriageScore", p.triageScore);
      setText("modalRedFlag", p.redFlag);
      setText("modalTriageReason", p.triageReason);

      setText("modalCreatedAt", p.createdAt);
      setText("modalUpdatedAt", p.updatedAt);

      patientModal.classList.remove("hidden");
      patientModal.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
      if (!patientModal) return;
      patientModal.classList.add("hidden");
      patientModal.setAttribute("aria-hidden", "true");
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closeModal();
      });
    }

    if (patientModal) {
      patientModal.addEventListener("click", (e) => {
        if (e.target === patientModal) closeModal();
      });
    }

    // ---- Table Loaders ----
    async function loadWaitingPatients() {
      if (!patientTable) return;
      const tbody = patientTable.querySelector("tbody");
      if (!tbody) return;

      tbody.innerHTML = "";
      const page = await apiGet("/patients?page=0&size=50"); // WAITING only (your backend behavior)

      const list = Array.isArray(page) ? page : (page?.content ?? page?.patients ?? []);
      list.forEach((p) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${escapeHtml(p.id)}</td>
          <td>${escapeHtml(p.name ?? "-")}</td>
          <td>${escapeHtml(p.triageLevel ?? "-")}</td>
          <td>${escapeHtml(p.symptoms ?? "-")}</td>
          <td class="text-right">
            <button class="pd-view-btn" data-id="${escapeHtml(p.id)}">View</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    async function loadQueue() {
      if (!queueTable) return;
      const tbody = queueTable.querySelector("tbody");
      if (!tbody) return;

      tbody.innerHTML = "";
      const data = await apiGet("/queue");

      data.forEach((p) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${escapeHtml(p.id)}</td>
          <td>${escapeHtml(p.name ?? "-")}</td>
          <td>${escapeHtml(p.triageLevel ?? "-")}</td>
          <td>${escapeHtml(p.symptoms ?? "-")}</td>
          <td>${escapeHtml(p.waitTime ?? "-")}</td>
          <td class="text-right">
            <button class="pd-view-btn" data-id="${escapeHtml(p.id)}">View</button>
            <button class="pd-admit-btn" data-id="${escapeHtml(p.id)}">Admit</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    async function loadInTreatment() {
      if (!inTreatmentTable) return;
      const tbody = inTreatmentTable.querySelector("tbody");
      if (!tbody) return;

      tbody.innerHTML = "";
      const list = await apiGet("/patients/inTreatment");

      list.forEach((p) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${escapeHtml(p.id)}</td>
          <td>${escapeHtml(p.name ?? "-")}</td>
          <td>${escapeHtml(p.triageLevel ?? "-")}</td>
          <td>${escapeHtml(p.symptoms ?? "-")}</td>
          <td>${escapeHtml(p.treatmentStart ?? "-")}</td>
          <td class="text-right">
            <button class="pd-view-btn" data-id="${escapeHtml(p.id)}">View</button>
            <button class="pd-discharge-btn" data-id="${escapeHtml(p.id)}">Discharge</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    async function refreshAll() {
      await Promise.all([loadWaitingPatients(), loadQueue(), loadInTreatment()]);
      attachRowButtons();
    }

    // ---- Row Button Actions ----
    function attachRowButtons() {
      // View (works in all 3 tables)
      qsa(".pd-view-btn").forEach((btn) => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          try {
            const patient = await apiGet(`/patients/${id}`);
            openModalWithPatient(patient);
          } catch (err) {
            console.error(err);
            alert("View failed. Check console.");
          }
        };
      });

      // Admit -> IN_TREATMENT
      qsa(".pd-admit-btn").forEach((btn) => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          try {
            await apiPost(`/patients/${id}/status`, { newStatus: "IN_TREATMENT" });
            await refreshAll();
          } catch (err) {
            console.error(err);
            alert("Admit failed. Check console.");
          }
        };
      });

      // Discharge -> TREATED
      qsa(".pd-discharge-btn").forEach((btn) => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          try {
            await apiPost(`/patients/${id}/status`, { newStatus: "TREATED" });
            await refreshAll();
          } catch (err) {
            console.error(err);
            alert("Discharge failed. Check console.");
          }
        };
      });
    }

    await refreshAll();
  }

  // ==========================================================
  // Boot
  // ==========================================================
  document.addEventListener("DOMContentLoaded", () => {
    initLoginPage();
    initDashboardPage();
    initPatientDashboardPage().catch((e) => console.error(e));
  });
})();
