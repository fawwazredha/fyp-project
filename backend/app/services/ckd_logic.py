def _parse_yes_no(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in ("yes", "true", "1", "y", "yes")
    return bool(value)


def _to_float(value, label):
    try:
        return float(value)
    except (TypeError, ValueError):
        raise ValueError(f"{label} must be a valid number")


def _to_int(value, label):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        raise ValueError(f"{label} must be a valid integer")


def _score_age(age: int) -> int:
    if age < 0:
        raise ValueError("Age must be non-negative")
    if age < 30:
        return 0
    if age <= 45:
        return 1
    if age <= 60:
        return 2
    return 3


def _score_gender(gender: str) -> int:
    return 1 if str(gender).strip().lower() == "male" else 0


def _score_bmi(bmi: float) -> int:
    if bmi < 18.5:
        return 0
    if bmi < 25:
        return 0
    if bmi < 30:
        return 2
    return 3


def _score_exercise(value: str) -> int:
    option = str(value).strip().lower()
    if option == "rarely/never":
        return 2
    if option == "1-2 times/week":
        return 1
    return 0


def _score_water(value: str) -> int:
    normalized = str(value).strip().lower()
    if normalized == "less than 1l/day":
        return 2
    if normalized == "1-2l/day":
        return 1
    return 0


def _risk_category(score: int) -> str:
    if score <= 7:
        return "Low Risk"
    if score <= 15:
        return "Moderate Risk"
    if score <= 25:
        return "High Risk"
    return "Very High Risk"


def calculate_ckd_risk(data: dict) -> dict:
    age = _to_int(data.get("age"), "Age")
    gender = str(data.get("gender", "")).strip()
    height_cm = _to_float(data.get("height_cm"), "Height")
    weight_kg = _to_float(data.get("weight_kg"), "Weight")

    if height_cm <= 0 or weight_kg <= 0:
        raise ValueError("Height and weight must be greater than zero")

    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m * height_m), 1)
    if bmi <= 0:
        raise ValueError("Calculated BMI is invalid")

    score = 0
    contributing_factors = []

    age_score = _score_age(age)
    score += age_score
    if age_score == 1:
        contributing_factors.append("Age 30-45")
    elif age_score == 2:
        contributing_factors.append("Age 46-60")
    elif age_score == 3:
        contributing_factors.append("Age above 60")

    gender_score = _score_gender(gender)
    score += gender_score
    if gender_score > 0:
        contributing_factors.append("Male gender")

    bmi_score = _score_bmi(bmi)
    score += bmi_score
    if bmi_score == 2:
        contributing_factors.append("Overweight")
    elif bmi_score == 3:
        contributing_factors.append("Obesity")

    if _parse_yes_no(data.get("smoking")):
        score += 2
        contributing_factors.append("Smoking")

    if _parse_yes_no(data.get("alcohol")):
        score += 1
        contributing_factors.append("Frequent alcohol consumption")

    exercise_score = _score_exercise(data.get("exercise_frequency", ""))
    score += exercise_score
    if exercise_score == 2:
        contributing_factors.append("Rarely or never exercises")
    elif exercise_score == 1:
        contributing_factors.append("Light exercise frequency")

    water_score = _score_water(data.get("water_intake", ""))
    score += water_score
    if water_score == 2:
        contributing_factors.append("Low daily water intake")
    elif water_score == 1:
        contributing_factors.append("Suboptimal hydration")

    if _parse_yes_no(data.get("salty_food")):
        score += 2
        contributing_factors.append("High salt intake")

    if _parse_yes_no(data.get("fast_food")):
        score += 2
        contributing_factors.append("Processed food consumption")

    if _parse_yes_no(data.get("sugary_drinks")):
        score += 2
        contributing_factors.append("Sugary beverage intake")

    fruit_veg = str(data.get("fruit_veg", "")).strip().lower()
    if fruit_veg == "rarely":
        score += 2
        contributing_factors.append("Low fruit and vegetable intake")
    elif fruit_veg == "sometimes":
        score += 1
        contributing_factors.append("Inconsistent fruit and vegetable intake")

    if _parse_yes_no(data.get("diabetes")):
        score += 5
        contributing_factors.append("Diabetes")

    if _parse_yes_no(data.get("hypertension")):
        score += 5
        contributing_factors.append("Hypertension")

    if _parse_yes_no(data.get("family_history")):
        score += 3
        contributing_factors.append("Family history of kidney disease")

    if _parse_yes_no(data.get("nsaid_usage")):
        score += 3
        contributing_factors.append("Long-term NSAID/painkiller use")

    if _parse_yes_no(data.get("stones_history")):
        score += 2
        contributing_factors.append("Kidney stone or UTI history")

    if _parse_yes_no(data.get("swelling")):
        score += 3
        contributing_factors.append("Swelling in legs or ankles")

    if _parse_yes_no(data.get("foamy_urine")):
        score += 3
        contributing_factors.append("Foamy urine")

    if _parse_yes_no(data.get("fatigue")):
        score += 2
        contributing_factors.append("Fatigue or tiredness")

    if _parse_yes_no(data.get("nighttime_urination")):
        score += 2
        contributing_factors.append("Frequent nighttime urination")

    if not contributing_factors:
        contributing_factors.append("No immediate risk factors identified")

    risk_level = _risk_category(score)
    recommendation = "Maintain a healthy lifestyle, hydrate well, and monitor kidney health regularly."
    if risk_level == "Moderate Risk":
        recommendation = "Consider a medical review and improve lifestyle habits to protect kidney function."
    elif risk_level == "High Risk":
        recommendation = "Please consult a healthcare professional for clinical kidney screening."
    elif risk_level == "Very High Risk":
        recommendation = "Seek immediate medical advice and follow up with a nephrologist as soon as possible."

    return {
        "bmi": bmi,
        "total_score": score,
        "risk_level": risk_level,
        "contributing_factors": contributing_factors,
        "recommendation": recommendation,
    }
