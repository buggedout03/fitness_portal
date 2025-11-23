// glp1.js

async function submitGLP() {
    const userId = await getCurrentUserId();
    if (!userId) {
        alert("Please create/select a user first.");
        return;
    }

    const dateStr = new Date().toISOString().split("T")[0];

    await fetch("/glp1/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            user_id: userId,
            dose_mg: parseFloat(dose.value),
            half_life_days: parseFloat(halflife.value),
            date: dateStr,
            concentration: parseFloat(dose.value)
        })
    });

    dose.value = "";
    halflife.value = "";

    loadDecay();
}

async function loadDecay() {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const res = await fetch(`/analytics/glp1?user_id=${userId}`);
    const data = await res.json();

    if (data.error) {
        const ctx = document.getElementById("glpChart").getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return;
    }

    const labels = data.curve.map(p => p[0]);
    const values = data.curve.map(p => p[1]);

    const ctx = document.getElementById("glpChart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Concentration",
                data: values,
                borderColor: "#0f0",
                tension: 0.3
            }]
        }
    });
}

document.addEventListener("user-changed", () => {
    loadDecay();
});

loadDecay();
