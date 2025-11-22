const USER_ID = 1;

async function submitPR() {
    const dateStr = new Date().toISOString().split("T")[0];

    await fetch("/prs/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            user_id: USER_ID,
            exercise_name: exercise.value,
            weight: parseFloat(prWeight.value),
            reps: parseInt(prReps.value),
            date: dateStr
        })
    });

    location.reload();
}

async function loadPRs() {
    const res = await fetch(`/prs/list?user_id=${USER_ID}`);
    const rows = await res.json();

    list.innerHTML = rows.map(r =>
        `<div>${r.date} — <b>${r.exercise_name}</b>: ${r.weight} kg x ${r.reps}</div>`
    ).join("");
}

loadPRs();
