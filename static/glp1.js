// glp1.js

let glpLogs = [];
let glpChart = null;

function getCurrentUserId() {
  const select = document.getElementById("userSelect");
  if (!select || !select.value) {
    alert("Please select a user first.");
    throw new Error("No user selected");
  }
  return parseInt(select.value, 10);
}

// Called by "Submit" button
async function submitGLP() {
  let userId;
  try {
    userId = getCurrentUserId();
  } catch {
    return;
  }

  const dose = parseFloat(document.getElementById("dose").value);
  const halflife = parseFloat(document.getElementById("halflife").value);

  if (isNaN(dose) || dose <= 0) {
    alert("Please enter a valid dose (mg).");
    return;
  }
  if (isNaN(halflife) || halflife <= 0) {
    alert("Please enter a valid half-life (days).");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  const payload = {
    user_id: userId,
    dose_mg: dose,
    date: today,
    half_life_days: halflife,
    concentration: dose // simple initial estimate
  };

  try {
    const resp = await fetch("/glp1/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to add GLP-1 entry: " + (err.detail || resp.statusText));
      return;
    }

    document.getElementById("dose").value = "";
    document.getElementById("halflife").value = "";

    await refreshGLP();
  } catch (e) {
    console.error(e);
    alert("Network error while adding GLP-1 entry.");
  }
}

async function refreshGLP() {
  let userId;
  try {
    userId = getCurrentUserId();
  } catch {
    return;
  }

  await Promise.all([refreshGLPHistory(userId), refreshGLPChart(userId)]);
}

async function refreshGLPHistory(userId) {
  try {
    const resp = await fetch(`/glp1/list?user_id=${userId}`);
    if (!resp.ok) throw new Error("Failed to fetch GLP1 list");
    glpLogs = await resp.json();
    renderGLPHistoryTable();
  } catch (e) {
    console.error(e);
  }
}

function renderGLPHistoryTable() {
  const containerCard = document.querySelector(".container"); // or second card etc.
  if (!containerCard) return;

  let table = document.getElementById("glp1Table");
  if (!table) {
    table = document.createElement("table");
    table.id = "glp1Table";
    table.style.width = "100%";
    table.style.marginTop = "10px";
    table.style.borderCollapse = "collapse";
    containerCard.appendChild(table);
  }

  if (!glpLogs.length) {
    table.innerHTML = "<tbody><tr><td>No GLP-1 entries yet.</td></tr></tbody>";
    return;
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th style="text-align:left;">Date</th>
        <th style="text-align:left;">Dose (mg)</th>
        <th style="text-align:left;">Half-life (days)</th>
        <th style="text-align:left;">Concentration</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${glpLogs
        .map(
          (e) => `
        <tr>
          <td>${e.date}</td>
          <td>${e.dose_mg}</td>
          <td>${e.half_life_days}</td>
          <td>${e.concentration}</td>
          <td>
            <button onclick="editGLP(${e.id})">Edit</button>
            <button onclick="deleteGLP(${e.id})">Delete</button>
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;
}

async function refreshGLPChart(userId) {
  try {
    const resp = await fetch(`/analytics/glp1/decay?user_id=${userId}`);
    const data = await resp.json();

    if (!resp.ok || data.error) {
      console.warn("GLP1 decay not available:", data.error || resp.statusText);
      return;
    }

    const labels = data.curve.map(([date]) => date);
    const concs = data.curve.map(([, c]) => c);

    const ctx = document.getElementById("glpChart");
    if (!ctx) return;

    if (glpChart) {
      glpChart.destroy();
    }

    glpChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "GLP-1 concentration (relative)",
            data: concs,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: { ticks: { autoSkip: true, maxTicksLimit: 8 } },
          y: { beginAtZero: false }
        }
      }
    });
  } catch (e) {
    console.error(e);
  }
}

async function deleteGLP(id) {
  if (!confirm("Delete this GLP-1 log?")) return;

  try {
    const resp = await fetch(`/glp1/${id}`, { method: "DELETE" });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to delete GLP-1 entry: " + (err.detail || resp.statusText));
      return;
    }
    await refreshGLP();
  } catch (e) {
    console.error(e);
    alert("Network error while deleting GLP-1 entry.");
  }
}

async function editGLP(id) {
  const entry = glpLogs.find(x => x.id === id);
  if (!entry) return;

  const newDose = parseFloat(prompt("Dose (mg):", entry.dose_mg));
  if (isNaN(newDose) || newDose <= 0) { alert("Invalid dose."); return; }

  const newHalf = parseFloat(prompt("Half-life (days):", entry.half_life_days));
  if (isNaN(newHalf) || newHalf <= 0) { alert("Invalid half-life."); return; }

  const payload = {
    user_id: entry.user_id,
    dose_mg: newDose,
    date: entry.date,
    half_life_days: newHalf,
    concentration: entry.concentration // or recalc if you prefer
  };

  try {
    const resp = await fetch(`/glp1/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to update GLP-1 entry: " + (err.detail || resp.statusText));
      return;
    }

    await refreshGLP();
  } catch (e) {
    console.error(e);
    alert("Network error while updating GLP-1 entry.");
  }
}

document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "userSelect") {
    refreshGLP();
  }
});
