import math
from datetime import datetime, timedelta
from typing import List, Tuple

# --------------------------
# Rolling Averages
# --------------------------

def rolling_average(data: List[Tuple[str, float]], days: int):
    """
    Expects list of (date_str, value)
    Returns rolling average for the last X days.
    """
    if not data:
        return None

    cutoff = datetime.now() - timedelta(days=days)

    # Filter entries newer than cutoff
    filtered = [
        v for (d, v) in data
        if datetime.strptime(d, "%Y-%m-%d") >= cutoff
    ]

    if not filtered:
        return None

    return sum(filtered) / len(filtered)


# --------------------------
# Linear Regression
# --------------------------

def linear_regression(data: List[Tuple[str, float]]):
    """
    Returns slope, intercept, r^2 for weight/measurement trend.
    """
    if len(data) < 2:
        return None

    # Convert date to integer day index
    x = [
        (datetime.strptime(d, "%Y-%m-%d") - datetime(2000,1,1)).days
        for (d, v) in data
    ]
    y = [v for (_, v) in data]

    n = len(x)
    sum_x = sum(x)
    sum_y = sum(y)
    sum_x2 = sum(i*i for i in x)
    sum_xy = sum(i*j for i,j in zip(x,y))

    # Slope (m) and intercept (b)
    denominator = (n * sum_x2 - sum_x**2)
    if denominator == 0:
        return None

    m = (n*sum_xy - sum_x*sum_y) / denominator
    b = (sum_y - m*sum_x) / n

    # R^2 correlation
    mean_y = sum_y / n
    ss_tot = sum((yi - mean_y)**2 for yi in y)
    ss_res = sum((yi - (m*xi + b))**2 for xi, yi in zip(x,y))
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else None

    return {
        "slope": m,
        "intercept": b,
        "r2": r2
    }


# --------------------------
# Navy Body Fat %
# --------------------------

def navy_body_fat(height_cm, waist_cm, neck_cm, hips_cm=None, gender="male"):
    """
    Returns body fat % or None if inputs are invalid for the Navy method.
    """
    if not height_cm or not waist_cm or not neck_cm:
        return None

    # Normalize gender to be forgiving
    g = str(gender).strip().lower()
    is_female = g in ("female", "f", "woman", "girl")

    try:
        if not is_female:
            # Treat everything else as "male" by default
            if waist_cm <= neck_cm or height_cm <= 0:
                return None

            return (
                86.010 * math.log10(waist_cm - neck_cm)
                - 70.041 * math.log10(height_cm)
                + 36.76
            )
        else:
            if hips_cm is None or height_cm <= 0:
                return None
            if waist_cm + hips_cm <= neck_cm:
                return None

            return (
                163.205 * math.log10(waist_cm + hips_cm - neck_cm)
                - 97.684 * math.log10(height_cm)
                - 78.387
            )
    except (ValueError, TypeError):
        return None


# --------------------------
# BMI
# --------------------------

def bmi(weight_kg, height_cm):
    h = height_cm / 100
    return weight_kg / (h*h)


# --------------------------
# TDEE (Mifflin-St Jeor)
# --------------------------

def tdee(weight_kg, height_cm, age, gender, activity=1.2):
    g = str(gender).strip().lower()
    is_female = g in ("female", "f", "woman", "girl")

    if is_female:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5

    return bmr * activity


# --------------------------
# GLP-1 Exponential Decay
# C(t) = C0 * (1/2)^(t / half_life)
# --------------------------

def glp1_daily_concentrations(dose_mg, half_life_days, start_date, days=7):
    """
    Returns list of (date_str, concentration)
    """
    start = datetime.strptime(start_date, "%Y-%m-%d")
    results = []

    for i in range(days + 1):
        t = i  # days since injection
        C0 = dose_mg
        Ct = C0 * (0.5 ** (t / half_life_days))

        day = start + timedelta(days=i)
        results.append((day.strftime("%Y-%m-%d"), Ct))

    return results
