const USER_ID = 1;

async function submitGLP() {
    const dateStr = new Date().toISOString().split("T")[0];

    await fetch("/glp1/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            user_id: USER_ID,
            dose_mg: parseFloat(dose.value),
            half_life_days: parseFloat(halflife.value),
            date: dateStr,
            concentration: parseFloat(dose.value)  // initial peak
        })
    });

    location.reload();
}

async function loadDecay() {
    const res = await fetch(`/analytics/glp1/decay?user_id=${USER_ID}`);
    const data = await res.json();

    if (data.error) return;

    const labels = data.curve.map(d => d[0]);
    const values = data.curve.map(d => d[1]);

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

loadDecay();
