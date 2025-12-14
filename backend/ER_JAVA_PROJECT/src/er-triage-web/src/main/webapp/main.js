// =====================================================================
// MAIN.JS – Coherent, page-safe version (Login + Register + Patient Dashboard)
// Backend context: http://localhost:8080/er-triage-web/
// APIs:
//   GET  /api/patients?page=0&size=..        (WAITING only)
//   GET  /api/queue                          (WAITING queue list)
//   GET  /api/patients/inTreatment           (IN_TREATMENT list)
//   GET  /api/patients/{id}
//   POST /api/patients/{id}/status           { "newStatus": "IN_TREATMENT" | "TREATED" }
//   POST /api/patients                       (register patient)
// =====================================================================

(() => {
  "use strict";

  // -----------------------------
  // Context + API base
  // -----------------------------
  function detectContextPath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "";
    return "/" + parts[0]; // "/er-triage-web"
  }

  const APP_CTX = detectContextPath();
  const API_BASE = `${APP_CTX}/api`;

  // -----------------------------
  // DOM helpers
  // -----------------------------
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

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

  async function apiGet(path) {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
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
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body ?? {}),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`POST ${url} failed: ${res.status} ${text}`);
    }

    const text = await res.text().catch(() => "");
    if (!text) return {};
    try { return JSON.parse(text); } catch { return {}; }
  }

  // =====================================================================
  // Accessibility (Brightness + toggles) – overlay approach
  // =====================================================================
  function initAccessibility() {
    const toggle = qs("#accessibilityToggle");
    const panel = qs("#accessibilityPanel");
    if (!toggle || !panel) return;

    const reduceBrightness = qs("#reduceBrightness");
    const highContrast = qs("#highContrast");
    const largeText = qs("#largeText");
    const reduceMotion = qs("#reduceMotion");
    const brightnessSlider = qs("#brightnessSlider");
    const brightnessValue = qs("#brightnessValue");

    function applyBrightness(percent) {
      const p = Math.min(100, Math.max(50, Number(percent) || 100));
      const opacity = ((100 - p) / 100) * 0.55;

      if (p >= 100) {
        document.body.style.removeProperty("--dim-opacity");
        document.body.classList.remove("dim-overlay");
      } else {
        document.body.classList.add("dim-overlay");
        document.body.style.setProperty("--dim-opacity", String(opacity));
      }

      if (brightnessSlider) brightnessSlider.value = String(p);
      if (brightnessValue) brightnessValue.textContent = `${p}%`;
    }

    function applyToggleClass(checkbox, className) {
      if (!checkbox) return;
      document.body.classList.toggle(className, checkbox.checked);
    }

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      panel.classList.toggle("accessibility-hidden");
    });

    document.addEventListener("click", (e) => {
      const clickedInside = panel.contains(e.target) || toggle.contains(e.target);
      if (!clickedInside) panel.classList.add("accessibility-hidden");
    });

    if (reduceBrightness) {
      reduceBrightness.addEventListener("change", () => {
        applyBrightness(reduceBrightness.checked ? 75 : 100);
      });
    }

    if (brightnessSlider) {
      brightnessSlider.addEventListener("input", () => {
        applyBrightness(brightnessSlider.value);
        if (reduceBrightness) reduceBrightness.checked = Number(brightnessSlider.value) < 100;
      });
    }

    if (highContrast) highContrast.addEventListener("change", () => applyToggleClass(highContrast, "high-contrast"));
    if (largeText) largeText.addEventListener("change", () => applyToggleClass(largeText, "large-text"));
    if (reduceMotion) reduceMotion.addEventListener("change", () => applyToggleClass(reduceMotion, "reduced-motion"));

    window.resetAccessibility = function resetAccessibility() {
      if (reduceBrightness) reduceBrightness.checked = false;
      if (highContrast) highContrast.checked = false;
      if (largeText) largeText.checked = false;
      if (reduceMotion) reduceMotion.checked = false;

      document.body.classList.remove("high-contrast", "large-text", "reduced-motion");
      document.body.style.removeProperty("--dim-opacity");
      document.body.classList.remove("dim-overlay");

      applyBrightness(100);
      panel.classList.add("accessibility-hidden");
    };

    applyBrightness(brightnessSlider?.value ?? 100);
    panel.classList.add("accessibility-hidden");
  }

  // =====================================================================
  // Login page (index.html)
  // =====================================================================
  function initLoginPage() {
    const loginForm = qs("#loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // Simple navigation login (your project behavior)
      window.location.href = `${APP_CTX}/dashboard.html`;
    });
  }

  // =====================================================================
  // Dashboard page (dashboard.html): Register + Cancel + View Patients
  // =====================================================================
  function initDashboardPage() {
    const registerBox = qs("#registerBox");
    const registerBtn = qs("#registerBtn");
    const viewBtn = qs("#viewBtn");
    const patientForm = qs("#patientForm");
    const cancelRegister = qs("#cancelRegister");

    // View Patients -> patientDashboard.html
    if (viewBtn) {
      viewBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = `${APP_CTX}/patientDashboard.html`;
      });
    }

    // Show register form
    if (registerBtn && registerBox) {
      registerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        registerBox.style.display = "block";
      });
    }

    // Cancel register form (must NOT submit, must NOT stick)
    if (cancelRegister && registerBox) {
      cancelRegister.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        registerBox.style.display = "none";
        if (patientForm) patientForm.reset();

        // Re-enable any disabled fields from "none" checkboxes
        qsa('input[type="checkbox"][id$="-none"]').forEach((cb) => {
          cb.checked = false;
          const row = cb.closest(".form-row");
          if (!row) return;
          const field = row.querySelector('input:not([type="checkbox"]), textarea, select');
          if (field) field.disabled = false;
        });
      });
    }

    // "None" checkboxes behavior (disable the paired field)
    qsa('input[type="checkbox"][id$="-none"]').forEach((cb) => {
      cb.addEventListener("change", () => {
        const row = cb.closest(".form-row");
        if (!row) return;
        const field = row.querySelector('input:not([type="checkbox"]), textarea, select');
        if (!field) return;

        if (cb.checked) {
          field.value = "";
          field.disabled = true;
        } else {
          field.disabled = false;
        }
      });
    });


    // Name Unknown (ONE checkbox controlling first + last)
    const nameUnknownCb = qs("#nameUnknown");
    const firstNameInput = qs("#firstName");
    const lastNameInput = qs("#lastName");
    if (nameUnknownCb && firstNameInput && lastNameInput) {
      const apply = () => {
        const on = !!nameUnknownCb.checked;
        firstNameInput.disabled = on;
        lastNameInput.disabled = on;
        if (on) { firstNameInput.value = ""; lastNameInput.value = ""; }
      };
      nameUnknownCb.addEventListener("change", apply);
      apply();
    }
    // Register patient submit
    if (!patientForm) return;

    patientForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const f = patientForm.elements;

      const nameUnknownEl = document.getElementById("nameUnknown");
      const nameUnknown = !!nameUnknownEl?.checked;
      const firstName = (f["firstName"]?.value ?? "").trim();
      const lastName = (f["lastName"]?.value ?? "").trim();
      const legacyName = (f["patientName"]?.value ?? "").trim();

      // Frontend guard: require first+last unless Name Unknown is checked.
      // Fallback: allow legacy patientName if your backend still expects "name".
      if (!nameUnknown) {
        if ((!firstName || !lastName) && !legacyName) {
          alert("Enter first and last name, or mark Name Unknown.");
          return;
        }
      }

      const fullName = legacyName || (nameUnknown ? "Unknown" : `${firstName} ${lastName}`.trim());

      const payload = {
  // =========================
  // Identity
  // =========================
  firstName: nameUnknown ? null : (firstName || null),
  lastName:  nameUnknown ? null : (lastName || null),
  nameUnknown: nameUnknown,

  nationalId: (f["nationalId"]?.value ?? "").trim() || null,
  phone: (f["phone"]?.value ?? "").trim() || null,

  // =========================
  // Required
  // =========================
  age: toIntOrNull(f["age"]?.value),
  gender: (f["gender"]?.value ?? "").trim(),

  symptoms: (f["symptoms"]?.value ?? "").trim(),

  // =========================
  // Vitals (MATCH BACKEND)
  // =========================
  bpSys: toIntOrNull(f["bpSys"]?.value),
  bpDia: toIntOrNull(f["bpDia"]?.value),
  hr: toIntOrNull(f["hr"]?.value),
  rr: toIntOrNull(f["rr"]?.value),
  spo2: toIntOrNull(f["spo2"]?.value),
  temp: toFloatOrNull(f["temp"]?.value),
};


      // Frontend guard: age must be positive (prevents backend 400)
      if ((payload.age ?? 0) <= 0) {
        alert("Age must be positive.");
        return;
      }

      try {
        const created = await apiPost("/patients", payload);
        const lvl = created?.triageLevel ?? "";
        alert(lvl ? `Patient registered! Triage Level: ${lvl}` : "Patient registered!");
        patientForm.reset();
        if (registerBox) registerBox.style.display = "none";
      } catch (err) {
        console.error(err);
        alert("Register failed. Check Console.");
      }
    });
  }

  // =====================================================================
  // Patient Dashboard (patientDashboard.html): tabs + tables + modal + search
  // =====================================================================
  async function initPatientDashboardPage() {
    // Only continue if patient dashboard elements exist
    const patientTable = qs("#patientTable");
    const queueTable = qs("#queueTable");
    const inTreatmentTable = qs("#inTreatmentTable");
    if (!patientTable && !queueTable && !inTreatmentTable) return;

    const btnPatientInfo = qs("#btnPatientInfo");
    const btnQueue = qs("#btnQueue");
    const btnInTreatment = qs("#btnInTreatment");

    const patientInfoSection = qs("#patientInfoSection");
    const queueSection = qs("#queueSection");
    const inTreatmentSection = qs("#inTreatmentSection");

    function setActiveTab(which) {
      if (btnPatientInfo) btnPatientInfo.classList.toggle("active", which === "patient");
      if (btnQueue) btnQueue.classList.toggle("active", which === "queue");
      if (btnInTreatment) btnInTreatment.classList.toggle("active", which === "treatment");

      if (patientInfoSection) patientInfoSection.classList.toggle("hidden", which !== "patient");
      if (queueSection) queueSection.classList.toggle("hidden", which !== "queue");
      if (inTreatmentSection) inTreatmentSection.classList.toggle("hidden", which !== "treatment");
    }

    if (btnPatientInfo) btnPatientInfo.addEventListener("click", (e) => { e.preventDefault(); setActiveTab("patient"); });
    if (btnQueue) btnQueue.addEventListener("click", (e) => { e.preventDefault(); setActiveTab("queue"); });
    if (btnInTreatment) btnInTreatment.addEventListener("click", (e) => { e.preventDefault(); setActiveTab("treatment"); });

    setActiveTab("patient");

    // ----------------------------
    // Modal + Modal Tabs
    // ----------------------------
    const patientModal = qs("#patientModal");
    const closeModalBtn = qs("#closeModalBtn");

    function setText(id, value) {
      const el = qs("#" + id);
      if (!el) return;
      el.textContent = (value === null || value === undefined || value === "") ? "-" : String(value);
    }

    function activateModalTab(tabId) {
      if (!patientModal) return;
      qsa(".tab-btn", patientModal).forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tabId));
      qsa(".tab-pane", patientModal).forEach((pane) => pane.classList.toggle("active", pane.id === tabId));
    }

    function initModalTabsOnce() {
      if (!patientModal) return;
      qsa(".tab-btn", patientModal).forEach((btn) => {
        if (btn.dataset.bound === "1") return;
        btn.dataset.bound = "1";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const tabId = btn.dataset.tab;
          if (tabId) activateModalTab(tabId);
        });
      });
    }

    function openModalWithPatient(p) {
      if (!patientModal) return;

      setText("modalPatientName", p.name);
      setText("modalPatientId", p.id);
      setText("modalNationalId", p.nationalId ?? p.nationalID);
      setText("modalPatientAge", p.age);
      setText("modalPatientGender", p.gender);
      setText("modalPatientPhone", p.phone);
      setText("modalStatus", p.status);

      setText("modalBpSys", p.bpSys);
      setText("modalBpDia", p.bpDia);
      setText("modalHr", p.hr);
      setText("modalRr", p.rr);
      setText("modalSpo2", p.spo2);
      setText("modalTemp", p.temp);

      setText("modalSymptoms", p.symptoms);
      setText("modalCurrentMeds", p.currentMeds ?? p.currentMedications);
      setText("modalPastHistory", p.medicalHistory ?? p.pastHistory);

      setText("modalTriageLevel", p.triageLevel);
      setText("modalTriageScore", p.triageScore);
      setText("modalRedFlag", p.redFlag);
      setText("modalTriageReason", p.triageReason);

      setText("modalCreatedAt", p.createdAt);
      setText("modalUpdatedAt", p.updatedAt);

      patientModal.classList.remove("hidden");
      patientModal.setAttribute("aria-hidden", "false");

      initModalTabsOnce();
      activateModalTab("vitals");
    }

    function closeModal() {
      if (!patientModal) return;
      patientModal.classList.add("hidden");
      patientModal.setAttribute("aria-hidden", "true");
    }

    if (closeModalBtn) closeModalBtn.addEventListener("click", (e) => { e.preventDefault(); closeModal(); });
    if (patientModal) patientModal.addEventListener("click", (e) => { if (e.target === patientModal) closeModal(); });

    // ----------------------------
    // Data caches + Search (all 3 tabs)
    // ----------------------------
    let cachedWaitingPatients = [];
    let cachedQueuePatients = [];
    let cachedInTreatmentPatients = [];

    const norm = (s) => String(s ?? "").toLowerCase().trim();

    function matchesPatient(p, q) {
      if (!q) return true;
      const id = norm(p.id);
      const name = norm(p.name);
      const nat = norm(p.nationalId ?? p.nationalID);
      return id.includes(q) || name.includes(q) || nat.includes(q);
    }

    function setCount(spanId, shown, total) {
      const el = qs("#" + spanId);
      if (!el) return;
      el.textContent = `${shown} / ${total}`;
    }

    function getQuery(inputId) {
      const el = qs("#" + inputId);
      return norm(el?.value);
    }

    function wireSearch(inputId, onChange) {
      const el = qs("#" + inputId);
      if (!el) return;
      if (el.dataset.bound === "1") return;
      el.dataset.bound = "1";
      el.addEventListener("input", onChange);
    }

    function renderWaitingPatients() {
      if (!patientTable) return;
      const tbody = patientTable.querySelector("tbody");
      if (!tbody) return;

      const q = getQuery("patientSearch");
      const filtered = cachedWaitingPatients.filter(p => matchesPatient(p, q));

      tbody.innerHTML = "";
      filtered.forEach((p) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(p.id)}</td>
          <td>${escapeHtml(p.name ?? "-")}</td>
          <td>${escapeHtml(p.triageLevel ?? "-")}</td>
          <td>${escapeHtml(p.symptoms ?? "-")}</td>
          <td class="text-right">
            <button class="pd-view-btn info-btn action-btn" data-id="${escapeHtml(p.id)}">View</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      setCount("patientSearchCount", filtered.length, cachedWaitingPatients.length);
    }

    function renderQueue() {
      if (!queueTable) return;
      const tbody = queueTable.querySelector("tbody");
      if (!tbody) return;

      const q = getQuery("queueSearch");
      const filtered = cachedQueuePatients.filter(p => matchesPatient(p, q));

      tbody.innerHTML = "";
      filtered.forEach((p) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(p.id)}</td>
          <td>${escapeHtml(p.name ?? "-")}</td>
          <td>${escapeHtml(p.triageLevel ?? "-")}</td>
          <td>${escapeHtml(p.symptoms ?? "-")}</td>
          <td>${escapeHtml(p.waitTime ?? "-")}</td>
          <td class="text-right">
            <button class="pd-view-btn info-btn action-btn" data-id="${escapeHtml(p.id)}">View</button>
            <button class="pd-admit-btn admit-btn action-btn" data-id="${escapeHtml(p.id)}">Admit</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      setCount("queueSearchCount", filtered.length, cachedQueuePatients.length);
    }

    function renderInTreatment() {
      if (!inTreatmentTable) return;
      const tbody = inTreatmentTable.querySelector("tbody");
      if (!tbody) return;

      const q = getQuery("treatmentSearch");
      const filtered = cachedInTreatmentPatients.filter(p => matchesPatient(p, q));

      tbody.innerHTML = "";
      filtered.forEach((p) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(p.id)}</td>
          <td>${escapeHtml(p.name ?? "-")}</td>
          <td>${escapeHtml(p.triageLevel ?? "-")}</td>
          <td>${escapeHtml(p.symptoms ?? "-")}</td>
          <td>${escapeHtml(p.treatmentStart ?? "-")}</td>
          <td class="text-right">
            <button class="pd-view-btn info-btn action-btn" data-id="${escapeHtml(p.id)}">View</button>
            <button class="pd-discharge-btn discharge-btn action-btn" data-id="${escapeHtml(p.id)}">Discharge</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      setCount("treatmentSearchCount", filtered.length, cachedInTreatmentPatients.length);
    }

    // Search bars (filter rows locally)
    wireSearch("patientSearch", () => { renderWaitingPatients(); attachRowButtons(); });
    wireSearch("queueSearch", () => { renderQueue(); attachRowButtons(); });
    wireSearch("treatmentSearch", () => { renderInTreatment(); attachRowButtons(); });

    // ----------------------------
    // Load + refresh
    // ----------------------------
    async function loadWaitingPatients() {
      const data = await apiGet("/patients?page=0&size=50");
      const list = Array.isArray(data) ? data : (data?.content ?? []);
      cachedWaitingPatients = Array.isArray(list) ? list : [];
      renderWaitingPatients();
    }

    async function loadQueue() {
      const list = await apiGet("/queue");
      cachedQueuePatients = Array.isArray(list) ? list : [];
      renderQueue();
    }

    async function loadInTreatment() {
      const list = await apiGet("/patients/inTreatment");
      cachedInTreatmentPatients = Array.isArray(list) ? list : [];
      renderInTreatment();
    }

    async function refreshAll() {
      await Promise.all([loadWaitingPatients(), loadQueue(), loadInTreatment()]);
      attachRowButtons();
    }

    function attachRowButtons() {
      // View buttons
      qsa(".pd-view-btn").forEach((btn) => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          try {
            const patient = await apiGet(`/patients/${id}`);
            openModalWithPatient(patient);
          } catch (err) {
            console.error(err);
            alert("View failed. Check Console.");
          }
        };
      });

      // Admit buttons
      qsa(".pd-admit-btn").forEach((btn) => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          try {
            await apiPost(`/patients/${id}/status`, { newStatus: "IN_TREATMENT" });
            await refreshAll();
          } catch (err) {
            console.error(err);
            alert("Admit failed. Check Console.");
          }
        };
      });

      // Discharge buttons
      qsa(".pd-discharge-btn").forEach((btn) => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          try {
            await apiPost(`/patients/${id}/status`, { newStatus: "TREATED" });
            await refreshAll();
          } catch (err) {
            console.error(err);
            alert("Discharge failed. Check Console.");
          }
        };
      });
    }

    await refreshAll();
  }

  // =====================================================================
  // Boot
  // =====================================================================
  document.addEventListener("DOMContentLoaded", () => {
    // All are page-safe (each checks if elements exist)
    initLoginPage();
    initDashboardPage();
    initAccessibility();

    initPatientDashboardPage().catch((err) => {
      console.error(err);
      // Don't crash other pages
    });
  });
})();