// weight.js
// Uses shared getCurrentUserId() from user.js

async function submitWeight() {
    const userId = await getCurrentUserId();
    if (!userId) {
        alert("Please create/select a user first.");
        return;
    }

    const val = document.getElementById("weightInput").value;
    if (!val) return;

    const dateStr = new Date().toISOString().split("T")[0];

    await fetch("/weight/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            user_id: userId,
            date: dateStr,
            weight: parseFloat(val)
        })
    });

    document.getElementById("weightInput").value = "";
    loadHistory();
}

async function loadHistory() {
    const userId = await getCurrentUserId();
    if (!userId) return;

    const res = await fetch(`/weight/list?user_id=${userId}`);
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

// Auto-refresh when user changes
document.addEventListener("user-changed", () => {
    loadHistory();
});

// Initial load
loadHistory();
