// calculations.js
let latestTDEE = null;

async function loadSummary() {
    const userId = await getCurrentUserId();
    if (!userId) {
        summaryBox.innerHTML = "No user selected.";
        latestTDEE = null;
        return;
    }

    const res = await fetch(`/analytics/body/summary?user_id=${userId}`);
    const data = await res.json();

    if (data.error) {
        summaryBox.innerHTML = "Missing data. Enter weight + measurements first.";
        latestTDEE = null;
        return;
    }

    latestTDEE = data.tdee || null;

    const bf = data.body_fat_percent;
    const bmiVal = data.bmi;
    const tdeeVal = data.tdee;

    summaryBox.innerHTML = `
        <b>Body Fat:</b> ${bf != null ? bf.toFixed(1) + "%" : "N/A"}<br>
        <b>BMI:</b> ${bmiVal != null ? bmiVal.toFixed(1) : "N/A"}<br>
        <b>TDEE:</b> ${tdeeVal != null ? Math.round(tdeeVal) + " kcal/day" : "N/A"}
    `;
}

function calculateCalories() {
    if (!latestTDEE) {
        calorieBox.innerHTML = "No TDEE available. Refresh summary first.";
        return;
    }

    const rate = parseFloat(deficitRate.value);
    if (!rate || rate <= 0) {
        calorieBox.innerHTML = "Enter a positive weekly weight loss target.";
        return;
    }

    const kcalPerKg = 7700;
    const dailyDeficit = (rate * kcalPerKg) / 7;
    const target = latestTDEE - dailyDeficit;

    calorieBox.innerHTML = `
        <b>Daily Deficit:</b> ${Math.round(dailyDeficit)} kcal<br>
        <b>Target Intake:</b> ${Math.round(target)} kcal/day
    `;
}

// Auto update on user change
document.addEventListener("user-changed", () => {
    loadSummary();
});

// initial
loadSummary();
