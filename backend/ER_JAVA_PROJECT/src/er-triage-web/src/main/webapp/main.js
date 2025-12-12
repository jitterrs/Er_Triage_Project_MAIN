// =====================================================================
// MAIN.JS – Page-safe + Backend Connected (Auto context) + Accessibility
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
  // Accessibility (♿ button + panel)
  // ==========================================================
  function initAccessibility() {
    const toggle = qs("#accessibilityToggle");
    const panel = qs("#accessibilityPanel");

    // If the page doesn't have the accessibility UI, do nothing
    if (!toggle || !panel) return;

    const reduceBrightness = qs("#reduceBrightness");
    const highContrast = qs("#highContrast");
    const largeText = qs("#largeText");
    const reduceMotion = qs("#reduceMotion");
    const brightnessSlider = qs("#brightnessSlider");
    const brightnessValue = qs("#brightnessValue");

    function applyBrightness(percent) {
      const p = Math.min(100, Math.max(50, Number(percent) || 100));
      document.body.style.filter = `brightness(${p / 100})`;
      if (brightnessSlider) brightnessSlider.value = String(p);
      if (brightnessValue) brightnessValue.textContent = `${p}%`;
    }

    function applyToggleClass(checkbox, className) {
      if (!checkbox) return;
      document.body.classList.toggle(className, checkbox.checked);
    }

    function openClosePanel() {
      panel.classList.toggle("accessibility-hidden");
    }

    // Toggle panel
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      openClosePanel();
    });

    // Click outside to close (optional but nice)
    document.addEventListener("click", (e) => {
      const clickedInside =
        panel.contains(e.target) || toggle.contains(e.target);
      if (!clickedInside) {
        panel.classList.add("accessibility-hidden");
      }
    });

    // Reduce Brightness checkbox
    if (reduceBrightness) {
      reduceBrightness.addEventListener("change", () => {
        if (reduceBrightness.checked) {
          applyBrightness(75);
        } else {
          applyBrightness(100);
        }
      });
    }

    // Brightness slider
    if (brightnessSlider) {
      brightnessSlider.addEventListener("input", () => {
        applyBrightness(brightnessSlider.value);

        // Keep checkbox in sync (if user lowers brightness manually)
        if (reduceBrightness) {
          reduceBrightness.checked = Number(brightnessSlider.value) < 100;
        }
      });
    }

    // High Contrast
    if (highContrast) {
      highContrast.addEventListener("change", () => {
        applyToggleClass(highContrast, "high-contrast");
      });
    }

    // Large Text
    if (largeText) {
      largeText.addEventListener("change", () => {
        applyToggleClass(largeText, "large-text");
      });
    }

    // Reduced Motion
    if (reduceMotion) {
      reduceMotion.addEventListener("change", () => {
        applyToggleClass(reduceMotion, "reduced-motion");
      });
    }

    // Global reset function used by the inline onclick in patientDashboard.html
    window.resetAccessibility = function resetAccessibility() {
      if (reduceBrightness) reduceBrightness.checked = false;
      if (highContrast) highContrast.checked = false;
      if (largeText) largeText.checked = false;
      if (reduceMotion) reduceMotion.checked = false;

      document.body.classList.remove("high-contrast", "large-text", "reduced-motion");
      applyBrightness(100);

      // Close panel after reset (optional)
      panel.classList.add("accessibility-hidden");
    };

    // Initialize defaults
    applyBrightness(brightnessSlider?.value ?? 100);
    panel.classList.add("accessibility-hidden");
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
  // ==========================================================
  function initDashboardPage() {
    const registerBox = qs("#registerBox");
    const registerBtn = qs("#registerBtn");
    const viewBtn = qs("#viewBtn");
    const patientForm = qs("#patientForm");
    const cancelRegister = qs("#cancelRegister");

    if (!registerBox && !registerBtn && !viewBtn && !patientForm) return;

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

    if (cancelRegister && registerBox) {
      cancelRegister.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        registerBox.style.display = "none";
        if (patientForm) patientForm.reset();

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

      const patientName = patientForm.elements["patientName"]?.value ?? "";
      const age = toIntOrNull(patientForm.elements["age"]?.value);
      const gender = patientForm.elements["gender"]?.value ?? "";
      const symptoms = patientForm.elements["symptoms"]?.value ?? "";

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

    if (!btnPatientInfo && !btnQueue && !btnInTreatment && !patientTable && !queueTable && !inTreatmentTable) {
      return;
    }

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

    // Modal
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

      setText("modalBp", p.bp ?? (p.bpSys && p.bpDia ? `${p.bpSys}/${p.bpDia}` : "-"));
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

    async function loadWaitingPatients() {
      if (!patientTable) return;
      const tbody = patientTable.querySelector("tbody");
      if (!tbody) return;

      tbody.innerHTML = "";
      const page = await apiGet("/patients?page=0&size=50");
      const list = Array.isArray(page) ? page : (page?.content ?? page?.patients ?? []);

      list.forEach((p) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${escapeHtml(p.id)}</td>
          <td>${escapeHtml(p.name ?? "-")}</td>
          <td>${escapeHtml(p.triageLevel ?? "-")}</td>
          <td>${escapeHtml(p.symptoms ?? "-")}</td>
          <td class="text-right">
            <div class="actions">
              <button class="pd-view-btn info-btn action-btn" data-id="${escapeHtml(p.id)}">View</button>
            </div>
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
            <div class="actions">
              <button class="pd-view-btn info-btn action-btn" data-id="${escapeHtml(p.id)}">View</button>
              <button class="pd-admit-btn admit-btn action-btn" data-id="${escapeHtml(p.id)}">Admit</button>
            </div>
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
            <div class="actions">
              <button class="pd-view-btn info-btn action-btn" data-id="${escapeHtml(p.id)}">View</button>
              <button class="pd-discharge-btn discharge-btn action-btn" data-id="${escapeHtml(p.id)}">Discharge</button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    async function refreshAll() {
      await Promise.all([loadWaitingPatients(), loadQueue(), loadInTreatment()]);
      attachRowButtons();
    }

    function attachRowButtons() {
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
    initAccessibility();          // ✅ restored
    initLoginPage();
    initDashboardPage();
    initPatientDashboardPage().catch((e) => console.error(e));
  });
})();
