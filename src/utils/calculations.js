// ---------------------------------------------------------------------------
// FitFuel nutrition math.
// All formulas use metric units: weight in kg, height in cm, age in years.
// ---------------------------------------------------------------------------

// Activity multipliers used to turn BMR into TDEE (maintenance calories).
export const ACTIVITY_LEVELS = {
  sedentary: { label: 'Sedentary', multiplier: 1.2, hint: 'Little or no exercise, desk job' },
  light: { label: 'Lightly Active', multiplier: 1.375, hint: 'Light exercise 1-3 days/week' },
  moderate: { label: 'Moderately Active', multiplier: 1.55, hint: 'Moderate exercise 3-5 days/week' },
  very: { label: 'Very Active', multiplier: 1.725, hint: 'Hard exercise 6-7 days/week' },
  athlete: { label: 'Athlete', multiplier: 1.9, hint: 'Very hard exercise + physical job' },
}

// Goal calorie adjustments applied on top of TDEE.
export const GOALS = {
  maintain: { label: 'Maintain Weight', adjustment: 0, hint: 'Keep your current weight' },
  leanbulk: { label: 'Lean Bulk', adjustment: 250, hint: 'Slow muscle gain, minimal fat' },
  bulk: { label: 'Bulk', adjustment: 500, hint: 'Faster muscle & weight gain' },
  cut: { label: 'Cut', adjustment: -500, hint: 'Lose fat while keeping muscle' },
}

// Calorie density of each macronutrient (kcal per gram).
const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 }

/** BMI = weight(kg) / height(m)^2. Returns a rounded-to-1-decimal number. */
export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100
  if (!heightM) return 0
  return Number((weightKg / (heightM * heightM)).toFixed(1))
}

/** Maps a BMI value to its standard category + a tailwind color token. */
export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'sky', range: '< 18.5' }
  if (bmi < 25) return { label: 'Normal', color: 'brand', range: '18.5 - 24.9' }
  if (bmi < 30) return { label: 'Overweight', color: 'amber', range: '25 - 29.9' }
  return { label: 'Obese', color: 'rose', range: '30+' }
}

/**
 * BMR using the Mifflin-St Jeor equation.
 * Male:   10*kg + 6.25*cm - 5*age + 5
 * Female: 10*kg + 6.25*cm - 5*age - 161
 */
export function calculateBMR(weightKg, heightCm, age, gender) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  const bmr = gender === 'female' ? base - 161 : base + 5
  return Math.round(bmr)
}

/** TDEE (maintenance) = BMR * activity multiplier. */
export function calculateTDEE(bmr, activityKey) {
  const level = ACTIVITY_LEVELS[activityKey] ?? ACTIVITY_LEVELS.moderate
  return Math.round(bmr * level.multiplier)
}

/** Goal calories = TDEE + goal adjustment. */
export function calculateGoalCalories(tdee, goalKey) {
  const goal = GOALS[goalKey] ?? GOALS.maintain
  return Math.round(tdee + goal.adjustment)
}

/**
 * Macro split:
 *  - Protein: 2.0 g/kg bodyweight
 *  - Fat:     0.8 g/kg bodyweight
 *  - Carbs:   remaining calories after protein & fat
 * Returns grams + the kcal each macro contributes.
 */
export function calculateMacros(weightKg, goalCalories) {
  const proteinG = Math.round(weightKg * 2.0)
  const fatG = Math.round(weightKg * 0.8)

  const proteinCals = proteinG * CALORIES_PER_GRAM.protein
  const fatCals = fatG * CALORIES_PER_GRAM.fat

  const remaining = goalCalories - proteinCals - fatCals
  const carbsG = Math.max(0, Math.round(remaining / CALORIES_PER_GRAM.carbs))
  const carbsCals = carbsG * CALORIES_PER_GRAM.carbs

  return {
    protein: { grams: proteinG, cals: proteinCals },
    fat: { grams: fatG, cals: fatCals },
    carbs: { grams: carbsG, cals: carbsCals },
  }
}

/**
 * One-shot helper: takes raw form data and returns the full result object
 * used by the dashboard. Numeric strings are coerced to numbers here.
 */
export function computeResults(data) {
  const weight = Number(data.weight)
  const height = Number(data.height)
  const age = Number(data.age)

  const bmi = calculateBMI(weight, height)
  const bmiCategory = getBMICategory(bmi)
  const bmr = calculateBMR(weight, height, age, data.gender)
  const tdee = calculateTDEE(bmr, data.activity)
  const goalCalories = calculateGoalCalories(tdee, data.goal)
  const macros = calculateMacros(weight, goalCalories)

  return { bmi, bmiCategory, bmr, tdee, goalCalories, macros }
}

/** Basic validation for the calculator form. Returns an errors object. */
export function validateUserData(data) {
  const errors = {}
  if (!data.name?.trim()) errors.name = 'Please enter your name'
  if (!data.age || data.age < 10 || data.age > 100) errors.age = 'Age must be 10-100'
  if (!data.height || data.height < 100 || data.height > 250) errors.height = 'Height must be 100-250 cm'
  if (!data.weight || data.weight < 30 || data.weight > 300) errors.weight = 'Weight must be 30-300 kg'
  return errors
}
