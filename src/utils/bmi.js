// ---------------------------------------------------------------------------
// Core anthropometric primitives: BMI, BMI classification, healthy weight
// range, and BMR. Kept dependency-free so other modules (goals, projection)
// can import them without circular references.
//
// All inputs are metric: weight in kg, height in cm, age in years.
// ---------------------------------------------------------------------------

/** @typedef {'male'|'female'} Gender */

/**
 * BMI = weight(kg) / height(m)^2.
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {number} BMI rounded to 1 decimal.
 */
export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100
  if (!heightM) return 0
  return Number((weightKg / (heightM * heightM)).toFixed(1))
}

/**
 * WHO BMI classification mapped to a label + tailwind tone.
 * @param {number} bmi
 * @returns {{label:string,color:string,range:string}}
 */
export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'sky', range: '< 18.5' }
  if (bmi < 25) return { label: 'Normal', color: 'brand', range: '18.5 - 24.9' }
  if (bmi < 30) return { label: 'Overweight', color: 'amber', range: '25 - 29.9' }
  return { label: 'Obese', color: 'rose', range: '30+' }
}

/**
 * Healthy weight range for a height, from the normal BMI band.
 *   min = BMI 18.5, ideal = BMI 22 (mid-normal), max = BMI 24.9
 * @param {number} heightCm
 * @returns {{min:number,ideal:number,max:number}}
 */
export function getHealthyWeightRange(heightCm) {
  const h = heightCm / 100
  if (!h) return { min: 0, ideal: 0, max: 0 }
  return {
    min: Math.round(18.5 * h * h),
    ideal: Math.round(22 * h * h),
    max: Math.round(24.9 * h * h),
  }
}

/**
 * BMR via the Mifflin-St Jeor equation (1990) — the most accurate general
 * predictive equation for healthy adults.
 *   Male:   10*kg + 6.25*cm - 5*age + 5
 *   Female: 10*kg + 6.25*cm - 5*age - 161
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {number} age
 * @param {Gender} gender
 * @returns {number}
 */
export function calculateBMR(weightKg, heightCm, age, gender) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  const bmr = gender === 'female' ? base - 161 : base + 5
  return Math.round(bmr)
}
