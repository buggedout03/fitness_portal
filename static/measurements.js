// measurements.js
let measurementRows = [];
let chartInstance = null;

async function submitMeasurements() {
    const userId = await getCurrentUserId();
    if (!userId) {
        alert("Please create/select a user first.");
        return;
    }

    const dateStr = new Date().toISOString().split("T")[0];

    const payload = {
        user_id: userId,
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

    loadData();
}

async function loadData() {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const res = await fetch(`/measurements/list?user_id=${userId}`);
    measurementRows = await res.json();
    renderChart();
}

function renderChart() {
    const metric = document.getElementById("metricSelect").value;

    const labels = measurementRows.map(r => r.date);
    const values = measurementRows.map(r => r[metric]);

    const ctx = document.getElementById("measurementChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: metricLabel(metric),
                data: values,
                borderColor: "#f80",
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

// Update when user changes
document.addEventListener("user-changed", () => {
    loadData();
});

// Initial load
loadData();
