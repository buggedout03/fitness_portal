// workouts.js

async function submitWorkout() {
    const userId = await getCurrentUserId();
    if (!userId) {
        alert("Please create/select a user first.");
        return;
    }

    const dateStr = new Date().toISOString().split("T")[0];

    await fetch("/workouts/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            user_id: userId,
            date: dateStr,
            name: workoutName.value,
            exercises_json: exercises.value
        })
    });

    workoutName.value = "";
    exercises.value = "";
    loadWorkouts();
}

async function loadWorkouts() {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const res = await fetch(`/workouts/list?user_id=${userId}`);
    const rows = await res.json();

    list.innerHTML = rows.map(r => `
        <div class="card">
            <div>
                <b>${r.date}</b> — ${r.name}
                <button onclick="toggleWorkout(${r.id})">Toggle</button>
            </div>
            <pre id="w${r.id}"
                 style="display:none; background:#222; padding:10px; border-radius:8px; white-space:pre-wrap;">
${r.exercises_json}
            </pre>
        </div>
    `).join("");
}

function toggleWorkout(id) {
    const el = document.getElementById("w" + id);
    if (!el) return;
    el.style.display = (el.style.display === "none" || !el.style.display) ? "block" : "none";
}

document.addEventListener("user-changed", () => {
    loadWorkouts();
});

// Initial
loadWorkouts();
