const USER_ID = 1;
let latestTDEE = null;

async function loadSummary() {
    const res = await fetch(`/analytics/body/summary?user_id=${USER_ID}`);
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

    const bfText = (bf != null) ? `${bf.toFixed(1)}%` : "N/A";
    const bmiText = (bmiVal != null) ? bmiVal.toFixed(1) : "N/A";
    const tdeeText = (tdeeVal != null) ? `${Math.round(tdeeVal)} kcal/day` : "N/A";

    summaryBox.innerHTML = `
        <b>Body Fat:</b> ${bfText}<br>
        <b>BMI:</b> ${bmiText}<br>
        <b>TDEE:</b> ${tdeeText}
    `;
}

function calculateCalories() {
    if (!latestTDEE) {
        calorieBox.innerHTML = "Load summary first or ensure TDEE is available.";
        return;
    }

    const rate = parseFloat(deficitRate.value);
    if (!rate || rate <= 0) {
        calorieBox.innerHTML = "Enter a valid kg/week deficit.";
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

// initial
loadSummary();
