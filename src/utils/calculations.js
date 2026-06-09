// ---------------------------------------------------------------------------
// FitFuel nutrition math — orchestration layer.
//
// The heavy lifting now lives in focused, testable modules:
//   bmi.js              BMI, classification, healthy range, BMR (Mifflin-St Jeor)
//   activity.js         personalized PAL multiplier from lifestyle inputs
//   bodyComposition.js  body fat % (measured / RFM / Deurenberg) + lean mass
//   goals.js            evidence-based protein + healthy target ranges
//   projection.js       non-linear weekly weight projection (TDEE recomputed)
//   feedback.js         plain-language guidance & safety warnings
//
// This file composes them into a single `computeResults()` used by the UI,
// and re-exports the primitives that components import directly.
//
// All formulas use metric units: weight in kg, height in cm, age in years.
// ---------------------------------------------------------------------------

import {
  calculateBMI,
  getBMICategory,
  getHealthyWeightRange,
  calculateBMR,
} from './bmi.js'
import { computeActivityMultiplier } from './activity.js'
import { estimateBodyFat, calculateLeanBodyMass } from './bodyComposition.js'
import { GOALS, calculateProteinTarget, recommendTargetRange } from './goals.js'
import { generateProjection, KCAL_PER_KG } from './projection.js'
import { generateFeedback } from './feedback.js'

// Re-export primitives so existing imports from './calculations.js' keep working.
export {
  calculateBMI,
  getBMICategory,
  getHealthyWeightRange,
  calculateBMR,
} from './bmi.js'
export { GOALS } from './goals.js'
export { KCAL_PER_KG, generateProjection } from './projection.js'

// Calorie density of each macronutrient (kcal per gram).
const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 }

/** TDEE (maintenance) = BMR * personalized activity multiplier. */
export function calculateTDEE(bmr, multiplier) {
  return Math.round(bmr * multiplier)
}

/** Goal calories = TDEE + goal adjustment. */
export function calculateGoalCalories(tdee, goalKey) {
  const goal = GOALS[goalKey] ?? GOALS.maintain
  return Math.round(tdee + goal.adjustment)
}

/**
 * Splits a calorie target into macros given a protein target.
 *  - Protein: from the evidence-based goal calculation (calculateProteinTarget)
 *  - Fat:     0.8 g/kg of reference weight, with a floor of 20% of calories
 *             (important for hormone health)
 *  - Carbs:   the remaining calories
 * @param {number} goalCalories
 * @param {number} proteinGrams
 * @param {number} referenceWeight
 */
export function calculateMacros(goalCalories, proteinGrams, referenceWeight) {
  const fatG = Math.max(
    Math.round(0.8 * referenceWeight),
    Math.round((0.2 * goalCalories) / CALORIES_PER_GRAM.fat),
  )

  const proteinCals = proteinGrams * CALORIES_PER_GRAM.protein
  const fatCals = fatG * CALORIES_PER_GRAM.fat
  const carbsCals = Math.max(0, goalCalories - proteinCals - fatCals)
  const carbsG = Math.round(carbsCals / CALORIES_PER_GRAM.carbs)

  return {
    protein: { grams: proteinGrams, cals: proteinCals },
    fat: { grams: fatG, cals: fatCals },
    carbs: { grams: carbsG, cals: carbsCals },
  }
}

/**
 * @typedef {Object} Results
 * @property {number} bmi
 * @property {Object} bmiCategory
 * @property {number} bmr
 * @property {{multiplier:number,label:string,hint:string}} activity
 * @property {number} tdee
 * @property {Object} goal
 * @property {number} goalCalories
 * @property {number} dailyDelta
 * @property {{percent:number,method:string,category:Object}} bodyFat
 * @property {number} leanBodyMass
 * @property {import('./goals.js').ProteinTarget} protein
 * @property {Object} macros
 * @property {import('./goals.js').TargetRange|null} targetRange
 * @property {{min:number,ideal:number,max:number}} healthyRange
 * @property {import('./projection.js').Projection} projection
 * @property {import('./feedback.js').FeedbackMessage[]} feedback
 */

/**
 * Computes the full dashboard result object from raw form data.
 * Numeric strings are coerced here so callers can pass the form as-is.
 * @param {Object} data
 * @returns {Results}
 */
export function computeResults(data) {
  const weight = Number(data.weight)
  const height = Number(data.height)
  const age = Number(data.age)
  const gender = data.gender === 'female' ? 'female' : 'male'

  // Anthropometrics
  const bmi = calculateBMI(weight, height)
  const bmiCategory = getBMICategory(bmi)
  const bmr = calculateBMR(weight, height, age, gender)
  const healthyRange = getHealthyWeightRange(height)

  // Personalized activity & energy
  const activity = computeActivityMultiplier({
    occupation: data.occupation,
    gymSessions: data.gymSessions,
    cardioSessions: data.cardioSessions,
    dailySteps: data.dailySteps,
  })
  const tdee = calculateTDEE(bmr, activity.multiplier)
  const goal = GOALS[data.goal] ?? GOALS.maintain
  const goalCalories = calculateGoalCalories(tdee, data.goal)
  const dailyDelta = goalCalories - tdee

  // Body composition
  const bodyFat = estimateBodyFat({
    bmi,
    age,
    gender,
    heightCm: height,
    bodyFat: data.bodyFat,
    waist: data.waist,
  })
  const leanBodyMass = calculateLeanBodyMass(weight, bodyFat.percent)

  // Protein & macros
  const protein = calculateProteinTarget(weight, height, data.goal)
  const macros = calculateMacros(goalCalories, protein.grams, protein.referenceWeight)

  // Goal recommendation (range) & projection
  const targetRange = recommendTargetRange({
    weightKg: weight,
    heightCm: height,
    goalKey: data.goal,
    leanBodyMass,
    gender,
  })
  const projection = generateProjection({
    startWeight: weight,
    heightCm: height,
    age,
    gender,
    activityMultiplier: activity.multiplier,
    goalCalories,
    targetWeight: data.targetWeight,
  })

  // Guidance
  const feedback = generateFeedback({
    userData: data,
    bmr,
    tdee,
    goalCalories,
    dailyDelta,
    protein,
    projection,
    targetRange,
    bmiCategory,
  })

  return {
    bmi,
    bmiCategory,
    bmr,
    activity,
    tdee,
    goal,
    goalCalories,
    dailyDelta,
    bodyFat,
    leanBodyMass,
    protein,
    macros,
    targetRange,
    healthyRange,
    projection,
    feedback,
  }
}

/**
 * Validates the calculator form. Required fields are always checked; optional
 * body-composition fields are only checked when provided.
 * @param {Object} data
 * @returns {Object} map of field -> error message
 */
export function validateUserData(data) {
  const errors = {}
  if (!data.name?.trim()) errors.name = 'Please enter your name'
  if (!data.age || data.age < 10 || data.age > 100) errors.age = 'Age must be 10-100'
  if (!data.height || data.height < 100 || data.height > 250) errors.height = 'Height must be 100-250 cm'
  if (!data.weight || data.weight < 30 || data.weight > 300) errors.weight = 'Weight must be 30-300 kg'

  // Optional fields — validate only if the user entered something.
  if (data.bodyFat !== '' && data.bodyFat != null) {
    const bf = Number(data.bodyFat)
    if (!(bf >= 3 && bf <= 60)) errors.bodyFat = 'Body fat must be 3-60%'
  }
  if (data.waist !== '' && data.waist != null) {
    const w = Number(data.waist)
    if (!(w >= 40 && w <= 200)) errors.waist = 'Waist must be 40-200 cm'
  }
  if (data.dailySteps !== '' && data.dailySteps != null) {
    const s = Number(data.dailySteps)
    if (!(s >= 0 && s <= 50000)) errors.dailySteps = 'Steps must be 0-50,000'
  }
  return errors
}
