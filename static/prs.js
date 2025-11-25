// prs.js

let prs = [];

function getCurrentUserId() {
  const select = document.getElementById("userSelect");
  if (!select || !select.value) {
    alert("Please select a user first.");
    throw new Error("No user selected");
  }
  return parseInt(select.value, 10);
}

async function submitPR() {
  let userId;
  try {
    userId = getCurrentUserId();
  } catch {
    return;
  }

  const exercise = document.getElementById("exercise").value.trim();
  const prWeight = parseFloat(document.getElementById("prWeight").value);
  const prReps = parseInt(document.getElementById("prReps").value, 10);

  if (!exercise) {
    alert("Please enter an exercise name.");
    return;
  }
  if (isNaN(prWeight) || prWeight <= 0) {
    alert("Please enter a valid weight.");
    return;
  }
  if (isNaN(prReps) || prReps <= 0) {
    alert("Please enter a valid rep count.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  const payload = {
    user_id: userId,
    exercise_name: exercise,
    weight: prWeight,
    reps: prReps,
    date: today
  };

  try {
    const resp = await fetch("/prs/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to add PR: " + (err.detail || resp.statusText));
      return;
    }

    document.getElementById("exercise").value = "";
    document.getElementById("prWeight").value = "";
    document.getElementById("prReps").value = "";

    await refreshPRs();
  } catch (e) {
    console.error(e);
    alert("Network error while adding PR.");
  }
}

async function refreshPRs() {
  let userId;
  try {
    userId = getCurrentUserId();
  } catch {
    return;
  }

  try {
    const resp = await fetch(`/prs/list?user_id=${userId}`);
    if (!resp.ok) throw new Error("Failed to fetch PRs");
    prs = await resp.json();
    renderPRList();
  } catch (e) {
    console.error(e);
  }
}

function renderPRList() {
  const listDiv = document.getElementById("list");
  if (!listDiv) return;

  if (!prs.length) {
    listDiv.innerHTML = "<p>No PRs logged yet.</p>";
    return;
  }

  listDiv.innerHTML = `
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;">Date</th>
          <th style="text-align:left;">Exercise</th>
          <th style="text-align:left;">Weight</th>
          <th style="text-align:left;">Reps</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${prs
          .map(
            (p) => `
          <tr>
            <td>${p.date}</td>
            <td>${p.exercise_name}</td>
            <td>${p.weight}</td>
            <td>${p.reps}</td>
            <td>
              <button onclick="editPR(${p.id})">Edit</button>
              <button onclick="deletePR(${p.id})">Delete</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

async function deletePR(id) {
  if (!confirm("Delete this PR?")) return;

  try {
    const resp = await fetch(`/prs/${id}`, { method: "DELETE" });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to delete PR: " + (err.detail || resp.statusText));
      return;
    }
    await refreshPRs();
  } catch (e) {
    console.error(e);
    alert("Network error while deleting PR.");
  }
}

async function editPR(id) {
  const entry = prs.find(p => p.id === id);
  if (!entry) return;

  const newWeight = parseFloat(prompt("Weight:", entry.weight));
  if (isNaN(newWeight) || newWeight <= 0) {
    alert("Invalid weight.");
    return;
  }

  const newReps = parseInt(prompt("Reps:", entry.reps), 10);
  if (isNaN(newReps) || newReps <= 0) {
    alert("Invalid reps.");
    return;
  }

  const payload = {
    user_id: entry.user_id,
    exercise_name: entry.exercise_name,
    weight: newWeight,
    reps: newReps,
    date: entry.date
  };

  try {
    const resp = await fetch(`/prs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to update PR: " + (err.detail || resp.statusText));
      return;
    }

    await refreshPRs();
  } catch (e) {
    console.error(e);
    alert("Network error while updating PR.");
  }
}

document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "userSelect") {
    refreshPRs();
  }
});
