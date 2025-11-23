// prs.js

async function submitPR() {
    const userId = await getCurrentUserId();
    if (!userId) {
        alert("Please create/select a user first.");
        return;
    }

    const dateStr = new Date().toISOString().split("T")[0];

    await fetch("/prs/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            user_id: userId,
            exercise_name: exercise.value,
            weight: parseFloat(prWeight.value),
            reps: parseInt(prReps.value),
            date: dateStr
        })
    });

    exercise.value = "";
    prWeight.value = "";
    prReps.value = "";

    loadPRs();
}

async function loadPRs() {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const res = await fetch(`/prs/list?user_id=${userId}`);
    const rows = await res.json();

    list.innerHTML = rows.map(r =>
        `<div>${r.date} — <b>${r.exercise_name}</b>: ${r.weight} kg x ${r.reps}</div>`
    ).join("");
}

document.addEventListener("user-changed", () => {
    loadPRs();
});

loadPRs();
