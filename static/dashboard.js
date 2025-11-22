const USER_ID = 1;  // Hard-coded for now

// ------------------------------
// 1. Fetch Body Summary
// ------------------------------
async function loadSummary() {
    const res = await fetch(`/analytics/body/summary?user_id=${USER_ID}`);
    const data = await res.json();

    if (data.error) {
        document.getElementById("summary").innerText = "No data yet.";
        return;
    }

    document.getElementById("summary").innerHTML = `
      <b>Body Fat:</b> ${data.body_fat_percent.toFixed(1)}%<br>
      <b>BMI:</b> ${data.bmi.toFixed(1)}<br>
      <b>TDEE:</b> ${Math.round(data.tdee)} kcal/day
    `;
}

// ------------------------------
// 2. Weight Chart
// ------------------------------
async function loadWeightChart() {
    const res = await fetch(`/analytics/weight/trends?user_id=${USER_ID}`);
    const data = await res.json();

    const labels = data.raw.map(d => d[0]);
    const values = data.raw.map(d => d[1]);

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
        },
        options: {
            scales: { x: { display: false } }
        }
    });
}

// ------------------------------
// 3. GLP-1 Decay Graph
// ------------------------------
async function loadGLP1Chart() {
    const res = await fetch(`/analytics/glp1/decay?user_id=${USER_ID}`);
    const data = await res.json();

    if (data.error) return;

    const labels = data.curve.map(d => d[0]);
    const values = data.curve.map(d => d[1]);

    const ctx = document.getElementById("glp1Chart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "GLP-1 Concentration",
                data: values,
                borderColor: "#0f0",
                tension: 0.3
            }]
        }
    });
}

// ------------------------------
// Init
// ------------------------------
loadSummary();
loadWeightChart();
loadGLP1Chart();
