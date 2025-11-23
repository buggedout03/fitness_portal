// dashboard.js

// 1. Summary
async function loadSummary() {
    const userId = await getCurrentUserId();
    if (!userId) {
        document.getElementById("summary").innerText = "No user selected.";
        return;
    }

    const res = await fetch(`/analytics/body/summary?user_id=${userId}`);
    const data = await res.json();

    if (data.error) {
        document.getElementById("summary").innerText = "No data yet.";
        return;
    }

    document.getElementById("summary").innerHTML = `
      <b>Body Fat:</b> ${data.body_fat_percent != null ? data.body_fat_percent.toFixed(1) + "%" : "N/A"}<br>
      <b>BMI:</b> ${data.bmi != null ? data.bmi.toFixed(1) : "N/A"}<br>
      <b>TDEE:</b> ${data.tdee != null ? Math.round(data.tdee) + " kcal/day" : "N/A"}
    `;
}

// 2. Weight Trend (re-using /weight/list)
async function loadWeightChart() {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const res = await fetch(`/weight/list?user_id=${userId}`);
    const rows = await res.json();

    const labels = rows.map(r => r.date);
    const values = rows.map(r => r.weight);

    const ctx = document.getElementById("weightChart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Weight (kg)",
                data: values,
                borderColor: "#0af",
                tension: 0.3
            }]
        }
    });
}

// 3. GLP-1 Chart
async function loadGLP1Chart() {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const res = await fetch(`/analytics/glp1?user_id=${userId}`);
    const data = await res.json();

    if (data.error) {
        const ctx = document.getElementById("glp1Chart").getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return;
    }

    const labels = data.curve.map(p => p[0]);
    const values = data.curve.map(p => p[1]);

    const ctx = document.getElementById("glp1Chart").getContext("2d");
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

// React to user changes
document.addEventListener("user-changed", () => {
    loadSummary();
    loadWeightChart();
    loadGLP1Chart();
});

// Initial
loadSummary();
loadWeightChart();
loadGLP1Chart();
