const USER_ID = 1;

async function submitWeight() {
    const val = document.getElementById("weightInput").value;
    if (!val) return;

    const dateStr = new Date().toISOString().split("T")[0];

    await fetch("/weight/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            user_id: USER_ID,
            date: dateStr,
            weight: parseFloat(val)
        })
    });

    location.reload();
}

async function loadHistory() {
    const res = await fetch(`/weight/list?user_id=${USER_ID}`);
    const rows = await res.json();

    const labels = rows.map(r => r.date);
    const values = rows.map(r => r.weight);

    const ctx = document.getElementById("historyChart").getContext("2d");
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

loadHistory();
