export interface AssessmentFormData {
  age: number
  gender: 'female' | 'male'
  height_cm: number
  weight_kg: number
  smoking: 'yes' | 'no'
  alcohol: 'yes' | 'no'
  exercise_frequency: 'Rarely/Never' | '1-2 times/week' | '>=3 times/week'
  water_intake: 'Less than 1L/day' | '1-2L/day' | 'More than 2L/day'
  salty_food: 'yes' | 'no'
  fast_food: 'yes' | 'no'
  sugary_drinks: 'yes' | 'no'
  fruit_veg: 'Rarely' | 'Sometimes' | 'Daily'
  diabetes: 'yes' | 'no'
  hypertension: 'yes' | 'no'
  family_history: 'yes' | 'no'
  nsaid_usage: 'yes' | 'no'
  stones_history: 'yes' | 'no'
  swelling: 'yes' | 'no'
  foamy_urine: 'yes' | 'no'
  fatigue: 'yes' | 'no'
  nighttime_urination: 'yes' | 'no'
}

export interface RiskResult {
  bmi: number
  total_score: number
  risk_level: string
  contributing_factors: string[]
  recommendation: string
}
