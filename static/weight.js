// weight.js

let weightLogs = [];
let weightChart = null;

function getCurrentUserId() {
  const select = document.getElementById("userSelect");
  if (!select || !select.value) {
    alert("Please select a user first.");
    throw new Error("No user selected");
  }
  return parseInt(select.value, 10);
}

// Called by the "Submit" button in weight.html
async function submitWeight() {
  let userId;
  try {
    userId = getCurrentUserId();
  } catch {
    return;
  }

  const input = document.getElementById("weightInput");
  const weightVal = parseFloat(input.value);

  if (isNaN(weightVal) || weightVal <= 0) {
    alert("Please enter a valid weight in kg.");
    return;
  }

  // Use today's date (YYYY-MM-DD). You can later replace with an <input type="date">
  const today = new Date().toISOString().slice(0, 10);

  const payload = {
    user_id: userId,
    date: today,
    weight: weightVal
  };

  try {
    const resp = await fetch("/weight/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to add weight: " + (err.detail || resp.statusText));
      return;
    }

    input.value = "";
    await refreshWeightHistory();
  } catch (e) {
    console.error(e);
    alert("Network error while adding weight.");
  }
}

async function refreshWeightHistory() {
  let userId;
  try {
    userId = getCurrentUserId();
  } catch {
    return;
  }

  try {
    const resp = await fetch(`/weight/list?user_id=${userId}`);
    if (!resp.ok) {
      throw new Error("Failed to fetch weight history");
    }

    weightLogs = await resp.json();
    renderWeightChart();
    renderWeightTable();
  } catch (e) {
    console.error(e);
    // Optional: show an error banner in the UI
  }
}

function renderWeightChart() {
  const ctx = document.getElementById("historyChart");
  if (!ctx) return;

  const labels = weightLogs.map((row) => row.date);
  const data = weightLogs.map((row) => row.weight);

  if (weightChart) {
    weightChart.destroy();
  }

  // Chart.js 3.x+
  weightChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Weight (kg)",
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

function renderWeightTable() {
  // We don't have a dedicated div in the HTML, so we attach under the chart container.
  const container = document.querySelector(".card .chart-container");
  if (!container) return;

  let table = document.getElementById("weightTable");
  if (!table) {
    table = document.createElement("table");
    table.id = "weightTable";
    table.style.width = "100%";
    table.style.marginTop = "10px";
    table.style.borderCollapse = "collapse";
    container.parentNode.appendChild(table);
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th style="text-align:left;">Date</th>
        <th style="text-align:left;">Weight (kg)</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${weightLogs
        .map(
          (row) => `
        <tr>
          <td>${row.date}</td>
          <td>${row.weight.toFixed ? row.weight.toFixed(1) : row.weight}</td>
          <td>
            <button onclick="editWeight(${row.id})">Edit</button>
            <button onclick="deleteWeight(${row.id})">Delete</button>
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  `;
}

async function deleteWeight(id) {
  if (!confirm("Delete this weight entry?")) return;

  try {
    const resp = await fetch(`/weight/${id}`, {
      method: "DELETE"
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to delete weight: " + (err.detail || resp.statusText));
      return;
    }

    await refreshWeightHistory();
  } catch (e) {
    console.error(e);
    alert("Network error while deleting weight.");
  }
}

async function editWeight(id) {
  const entry = weightLogs.find((w) => w.id === id);
  if (!entry) return;

  const newWeightStr = prompt(
    `Edit weight for ${entry.date}:`,
    String(entry.weight)
  );
  if (newWeightStr === null) return; // cancelled

  const newWeight = parseFloat(newWeightStr);
  if (isNaN(newWeight) || newWeight <= 0) {
    alert("Invalid weight.");
    return;
  }

  const payload = {
    user_id: entry.user_id,
    date: entry.date,
    weight: newWeight
  };

  try {
    const resp = await fetch(`/weight/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to update weight: " + (err.detail || resp.statusText));
      return;
    }

    await refreshWeightHistory();
  } catch (e) {
    console.error(e);
    alert("Network error while updating weight.");
  }
}


document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "userSelect") {
    refreshWeightHistory();
  }
});
