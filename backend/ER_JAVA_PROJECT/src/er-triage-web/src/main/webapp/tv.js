(function () {
  const boardBody = document.getElementById("boardBody");
  const waitingCount = document.getElementById("waitingCount");
  const queueMeta = document.getElementById("queueMeta");
  const lastUpdated = document.getElementById("lastUpdated");
  const connectionPill = document.getElementById("connectionPill");

  const dimRange = document.getElementById("dimRange");
  const dimValue = document.getElementById("dimValue");

  const API = "/er-triage-web/api/queue/public";
  const REFRESH_MS = 15000;

  function toInitials(firstName, lastName, fullNameFallback) {
    // Preferred: first/last provided
    const f = (firstName || "").trim();
    const l = (lastName || "").trim();

    if (f && l) {
      return (f[0].toUpperCase() + ". " + l[0].toUpperCase() + ".");
    }

    // Fallback: try to infer from full name if backend still sends "name"
    const full = (fullNameFallback || "").trim();
    if (full) {
      const parts = full.split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0].toUpperCase() + ". " + parts[parts.length - 1][0].toUpperCase() + ".");
      }
    }

    return "--";
  }

  function setDim(percent) {
    const p = Math.max(0, Math.min(80, Number(percent)));
    document.documentElement.style.setProperty("--dim-opacity", (p / 100).toFixed(2));
    if (dimValue) dimValue.textContent = p + "%";
  }

  if (dimRange) {
    setDim(dimRange.value || 20);
    dimRange.addEventListener("input", (e) => setDim(e.target.value));
  }

  function setConnected(ok) {
    if (!connectionPill) return;
    connectionPill.textContent = ok ? "Connected" : "Connection issue";
    connectionPill.classList.toggle("connected", ok);
  }

  function setLastUpdated() {
    if (!lastUpdated) return;
    lastUpdated.textContent = "Last update: " + new Date().toLocaleTimeString();
  }

  function emptyState() {
    boardBody.innerHTML = `<tr><td colspan="4" class="muted">No waiting patients.</td></tr>`;
  }

  async function loadQueue() {
    try {
      const res = await fetch(API, { cache: "no-store", headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error("HTTP " + res.status);

      const data = await res.json();

      if (waitingCount) waitingCount.textContent = data.length;
      if (queueMeta) queueMeta.textContent = "Waiting patients: " + data.length;

      if (!Array.isArray(data) || data.length === 0) {
        emptyState();
      } else {
        boardBody.innerHTML = data.map(p => {
          // Accept either shape:
          // A) { ticket, firstName, lastName, triageLevel, expectedWaitLabel }
          // B) { ticket, displayName, triageLevel, expectedWaitLabel } where displayName could be full name
          const name = toInitials(p.firstName, p.lastName, p.displayName || p.name);
          const wait = p.expectedWaitLabel ?? p.expectedWait ?? "-";
          return `
            <tr>
              <td>${p.ticket ?? "-"}</td>
              <td>${name}</td>
              <td>L${p.triageLevel ?? "-"}</td>
              <td>${wait}</td>
            </tr>
          `;
        }).join("");
      }

      setLastUpdated();
      setConnected(true);
    } catch (e) {
      setConnected(false);
      console.error("TV load error:", e);
    }
  }

  loadQueue();
  setInterval(loadQueue, REFRESH_MS);
})();
