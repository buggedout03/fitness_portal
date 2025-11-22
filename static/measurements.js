const USER_ID = 1;
let measurementRows = [];   // cache from API
let chartInstance = null;   // Chart.js instance

async function submitMeasurements() {
    const dateStr = new Date().toISOString().split("T")[0];

    const payload = {
        user_id: USER_ID,
        date: dateStr,
        waist_cm: parseFloat(waist.value),
        hips_cm: parseFloat(hips.value),
        neck_cm: parseFloat(neck.value),
        shoulder_cm: parseFloat(shoulder.value),
        chest_cm: parseFloat(chest.value)
    };

    await fetch("/measurements/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    });

    location.reload();
}

async function loadData() {
    const res = await fetch(`/measurements/list?user_id=${USER_ID}`);
    measurementRows = await res.json();
    renderChart();
}

function renderChart() {
    if (!measurementRows.length) return;

    const metric = document.getElementById("metricSelect").value;

    const labels = measurementRows.map(r => r.date);
    const values = measurementRows.map(r => r[metric]);

    // destroy previous chart if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = document.getElementById("measurementChart").getContext("2d");
    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: metricLabel(metric),
                data: values,
                borderColor: "#f55",
                tension: 0.3
            }]
        }
    });
}

function metricLabel(metric) {
    switch (metric) {
        case "waist_cm": return "Waist (cm)";
        case "hips_cm": return "Hips (cm)";
        case "neck_cm": return "Neck (cm)";
        case "shoulder_cm": return "Shoulders (cm)";
        case "chest_cm": return "Chest (cm)";
        default: return metric;
    }
}

// initial load
loadData();
