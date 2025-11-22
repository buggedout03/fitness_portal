const USER_ID = 1;

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

async function loadWaistChart() {
    const res = await fetch(`/measurements/list?user_id=${USER_ID}`);
    const rows = await res.json();

    const labels = rows.map(r => r.date);
    const values = rows.map(r => r.waist_cm);

    const ctx = document.getElementById("waistChart").getContext("2d");
    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Waist (cm)",
                data: values,
                borderColor: "#f55",
                tension: 0.3
            }]
        }
    });
}

loadWaistChart();
