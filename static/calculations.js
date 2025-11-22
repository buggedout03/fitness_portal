const USER_ID = 1;
let latestTDEE = null;

// ----------------------------
// Load summary (BF%, BMI, TDEE)
// ----------------------------
async function loadSummary() {
    const res = await fetch(`/analytics/body/summary?user_id=${USER_ID}`);
    const data = await res.json();

    if (data.error) {
        summaryBox.innerHTML = "Missing data. Enter weight + measurements first.";
        return;
    }

    latestTDEE = data.tdee;

    summaryBox.innerHTML = `
        <b>Body Fat:</b> ${data.body_fat_percent.toFixed(1)}%<br>
        <b>BMI:</b> ${data.bmi.toFixed(1)}<br>
        <b>TDEE:</b> ${Math.round(data.tdee)} kcal/day
    `;
}

// ----------------------------
// Calorie deficit calculator
// ----------------------------
function calculateCalories() {
    if (!latestTDEE) {
        calorieBox.innerHTML = "Load summary first.";
        return;
    }

    const rate = parseFloat(deficitRate.value);
    if (!rate || rate <= 0) {
        calorieBox.innerHTML = "Enter a valid kg/week deficit.";
        return;
    }

    // ~770 kcal per kg loss per day? No.
    // Real formula: 1 kg fat ≈ 7700 kcal
    // Weekly loss → divide by 7
    const kcalPerKg = 7700;
    const dailyDeficit = (rate * kcalPerKg) / 7;

    const target = latestTDEE - dailyDeficit;

    calorieBox.innerHTML = `
        <b>Daily Deficit:</b> ${Math.round(dailyDeficit)} kcal<br>
        <b>Target Intake:</b> ${Math.round(target)} kcal/day
    `;
}

// Load initial summary
loadSummary();
