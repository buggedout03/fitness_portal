const USER_ID = 1;

async function submitWorkout() {
    const dateStr = new Date().toISOString().split("T")[0];

    await fetch("/workouts/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            user_id: USER_ID,
            date: dateStr,
            name: workoutName.value,
            exercises_json: exercises.value
        })
    });

    location.reload();
}

async function loadWorkouts() {
    const res = await fetch(`/workouts/list?user_id=${USER_ID}`);
    const rows = await res.json();

    list.innerHTML = rows.map(r =>
        `<div><b>${r.date}</b> — ${r.name}</div>`
    ).join("");
}

loadWorkouts();
