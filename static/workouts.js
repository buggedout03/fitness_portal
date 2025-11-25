// workouts.js

let workouts = [];

function getCurrentUserId() {
  const select = document.getElementById("userSelect");
  if (!select || !select.value) {
    alert("Please select a user first.");
    throw new Error("No user selected");
  }
  return parseInt(select.value, 10);
}

async function submitWorkout() {
  let userId;
  try {
    userId = getCurrentUserId();
  } catch {
    return;
  }

  const name = document.getElementById("workoutName").value.trim();
  const exercisesText = document.getElementById("exercises").value.trim();

  if (!name) {
    alert("Please enter a workout name.");
    return;
  }
  if (!exercisesText) {
    alert("Please enter exercises JSON.");
    return;
  }

  // Validate JSON
  try {
    JSON.parse(exercisesText);
  } catch (e) {
    alert("Exercises must be valid JSON.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  const payload = {
    user_id: userId,
    date: today,
    name,
    exercises_json: exercisesText,
    duration: null
  };

  try {
    const resp = await fetch("/workouts/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to add workout: " + (err.detail || resp.statusText));
      return;
    }

    document.getElementById("workoutName").value = "";
    document.getElementById("exercises").value = "";

    await refreshWorkouts();
  } catch (e) {
    console.error(e);
    alert("Network error while adding workout.");
  }
}

async function refreshWorkouts() {
  let userId;
  try {
    userId = getCurrentUserId();
  } catch {
    return;
  }

  try {
    const resp = await fetch(`/workouts/list?user_id=${userId}`);
    if (!resp.ok) throw new Error("Failed to fetch workouts");
    workouts = await resp.json();
    renderWorkoutList();
  } catch (e) {
    console.error(e);
  }
}

function renderWorkoutList() {
  const listDiv = document.getElementById("list");
  if (!listDiv) return;

  if (!workouts.length) {
    listDiv.innerHTML = "<p>No workouts logged yet.</p>";
    return;
  }

  listDiv.innerHTML = `
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;">Date</th>
          <th style="text-align:left;">Name</th>
          <th style="text-align:left;">Exercises (JSON)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${workouts
          .map((w) => {
            const shortJson =
              w.exercises_json && w.exercises_json.length > 80
                ? w.exercises_json.slice(0, 80) + "..."
                : w.exercises_json || "";
            return `
              <tr>
                <td>${w.date}</td>
                <td>${w.name}</td>
                <td><pre style="white-space:pre-wrap; max-width:350px;">${shortJson}</pre></td>
                <td>
                  <button onclick="editWorkout(${w.id})">Edit</button>
                  <button onclick="deleteWorkout(${w.id})">Delete</button>
                </td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

async function deleteWorkout(id) {
  if (!confirm("Delete this workout?")) return;

  try {
    const resp = await fetch(`/workouts/${id}`, { method: "DELETE" });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to delete workout: " + (err.detail || resp.statusText));
      return;
    }
    await refreshWorkouts();
  } catch (e) {
    console.error(e);
    alert("Network error while deleting workout.");
  }
}

async function editWorkout(id) {
  const entry = workouts.find(w => w.id === id);
  if (!entry) return;

  const newName = prompt("Workout name:", entry.name);
  if (newName === null || !newName.trim()) return;

  const newJson = prompt("Exercises JSON:", entry.exercises_json);
  if (newJson === null) return;

  try {
    JSON.parse(newJson);
  } catch {
    alert("Invalid JSON.");
    return;
  }

  const payload = {
    user_id: entry.user_id,
    date: entry.date,
    name: newName.trim(),
    exercises_json: newJson,
    duration: entry.duration
  };

  try {
    const resp = await fetch(`/workouts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      alert("Failed to update workout: " + (err.detail || resp.statusText));
      return;
    }

    await refreshWorkouts();
  } catch (e) {
    console.error(e);
    alert("Network error while updating workout.");
  }
}

document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "userSelect") {
    refreshWorkouts();
  }
});
