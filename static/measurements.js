// measurements.js

let measurementLogs = [];
let measurementChart = null;

function getCurrentUserId() {
  const select = document.getElementById("userSelect");
  if (!select || !select.value) {
    alert("Please select a user first.");
    throw new Error("No user selected");
  }
  return parseInt(select.value, 10);
}

// Called by "Submit" button
async function submitMeasurements() {
  let userId;
  try {
    userId = getCurrentUserId();
  } catch {
    return;
  }

  const waist = parseFloat(document.getElementById("waist").value);
  const hips = parseFloat(document.getElementById("hips").value);
  const neck = parseFloat(document.getElementById("neck").value);
  const shoulder = parseFloat(document.getElementById("shoulder").value);
  const chest = parseFloat(document.getElementById("chest").value);

  if ([waist, hips, neck, shoulder, chest].some(v => isNaN(v) || v <= 0)) {
    alert("Please enter all measurements as positive numbers.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  const payload = {
    user_id: userId,
    date: today,
    waist_cm: waist,
    hips_cm: hips,
    neck_cm: neck,
    shoulder_cm: shoulder,
    chest_cm: chest
  };

  try {
    const resp = await fetch("/measurements/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to add measurements: " + (err.detail || resp.statusText));
      return;
    }

    // Clear inputs
    ["waist", "hips", "neck", "shoulder", "chest"].forEach(id => {
      document.getElementById(id).value = "";
    });

    await refreshMeasurements();
  } catch (e) {
    console.error(e);
    alert("Network error while adding measurements.");
  }
}

async function refreshMeasurements() {
  let userId;
  try {
    userId = getCurrentUserId();
  } catch {
    return;
  }

  try {
    const resp = await fetch(`/measurements/list?user_id=${userId}`);
    if (!resp.ok) {
      throw new Error("Failed to fetch measurements");
    }

    measurementLogs = await resp.json();
    renderChart();
    renderMeasurementTable();
  } catch (e) {
    console.error(e);
  }
}

// Called by <select onchange="renderChart()">
function renderChart() {
  const metricSelect = document.getElementById("metricSelect");
  const metricKey = metricSelect ? metricSelect.value : "waist_cm";

  const labels = measurementLogs.map(m => m.date);
  const data = measurementLogs.map(m => m[metricKey]);

  const ctx = document.getElementById("measurementChart");
  if (!ctx) return;

  if (measurementChart) {
    measurementChart.destroy();
  }

  measurementChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: metricKey.replace("_cm", "").toUpperCase() + " (cm)",
          data,
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: { autoSkip: true, maxTicksLimit: 10 }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

function renderMeasurementTable() {
  // Attach table under the card (below chart)
  const container = document.querySelector(".card:last-of-type");
  if (!container) return;

  let table = document.getElementById("measurementTable");
  if (!table) {
    table = document.createElement("table");
    table.id = "measurementTable";
    table.style.width = "100%";
    table.style.marginTop = "10px";
    table.style.borderCollapse = "collapse";
    container.appendChild(table);
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th style="text-align:left;">Date</th>
        <th style="text-align:left;">Waist</th>
        <th style="text-align:left;">Hips</th>
        <th style="text-align:left;">Neck</th>
        <th style="text-align:left;">Shoulders</th>
        <th style="text-align:left;">Chest</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${measurementLogs
        .map(
          (m) => `
        <tr>
          <td>${m.date}</td>
          <td>${m.waist_cm}</td>
          <td>${m.hips_cm}</td>
          <td>${m.neck_cm}</td>
          <td>${m.shoulder_cm}</td>
          <td>${m.chest_cm}</td>
          <td>
            <button onclick="editMeasurement(${m.id})">Edit</button>
            <button onclick="deleteMeasurement(${m.id})">Delete</button>
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;
}

async function deleteMeasurement(id) {
  if (!confirm("Delete this measurement entry?")) return;

  try {
    const resp = await fetch(`/measurements/${id}`, { method: "DELETE" });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to delete measurement: " + (err.detail || resp.statusText));
      return;
    }
    await refreshMeasurements();
  } catch (e) {
    console.error(e);
    alert("Network error while deleting measurement.");
  }
}

async function editMeasurement(id) {
  const entry = measurementLogs.find(m => m.id === id);
  if (!entry) return;

  const newWaist = parseFloat(prompt("Waist (cm):", entry.waist_cm));
  if (isNaN(newWaist) || newWaist <= 0) { alert("Invalid waist."); return; }

  const newHips = parseFloat(prompt("Hips (cm):", entry.hips_cm));
  if (isNaN(newHips) || newHips <= 0) { alert("Invalid hips."); return; }

  const newNeck = parseFloat(prompt("Neck (cm):", entry.neck_cm));
  if (isNaN(newNeck) || newNeck <= 0) { alert("Invalid neck."); return; }

  const newShoulder = parseFloat(prompt("Shoulders (cm):", entry.shoulder_cm));
  if (isNaN(newShoulder) || newShoulder <= 0) { alert("Invalid shoulders."); return; }

  const newChest = parseFloat(prompt("Chest (cm):", entry.chest_cm));
  if (isNaN(newChest) || newChest <= 0) { alert("Invalid chest."); return; }

  const payload = {
    user_id: entry.user_id,
    date: entry.date,
    waist_cm: newWaist,
    hips_cm: newHips,
    neck_cm: newNeck,
    shoulder_cm: newShoulder,
    chest_cm: newChest
  };

  try {
    const resp = await fetch(`/measurements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to update measurement: " + (err.detail || resp.statusText));
      return;
    }

    await refreshMeasurements();
  } catch (e) {
    console.error(e);
    alert("Network error while updating measurement.");
  }
}

// When user changes in navbar
document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "userSelect") {
    refreshMeasurements();
  }
});
