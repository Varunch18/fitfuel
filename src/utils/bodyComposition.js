// ---------------------------------------------------------------------------
// Body-composition estimates: body fat % and lean body mass (LBM).
//
// We support three sources, in order of preference:
//   1. User-provided body fat % (most accurate if they measured it).
//   2. RFM (Relative Fat Mass) from height + waist — validated against DXA
//      (Woolcott & Bergman, 2018). Only needs height and waist.
//   3. Deurenberg BMI-based estimate (Deurenberg et al., 1991) as a fallback
//      when no waist is provided.
//
// Lean Body Mass = weight x (1 - bodyFat/100).
// ---------------------------------------------------------------------------

/** @typedef {'male'|'female'} Gender */

/**
 * @typedef {Object} BodyFatResult
 * @property {number} percent     Estimated/known body fat %.
 * @property {'measured'|'rfm'|'bmi'} method  How it was derived.
 * @property {{label:string,color:string}} category  Fitness category + tone.
 */

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))
const validNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * RFM (Relative Fat Mass) body-fat estimate.
 *   men:   64 - 20 * (height / waist)
 *   women: 76 - 20 * (height / waist)
 * @param {number} heightCm
 * @param {number} waistCm
 * @param {Gender} gender
 * @returns {number}
 */
export function bodyFatFromWaist(heightCm, waistCm, gender) {
  const constant = gender === 'female' ? 76 : 64
  return clamp(constant - 20 * (heightCm / waistCm), 3, 60)
}

/**
 * Deurenberg BMI-based body-fat estimate.
 *   BF% = 1.20*BMI + 0.23*age - 10.8*sex - 5.4   (sex: male=1, female=0)
 * @param {number} bmi
 * @param {number} age
 * @param {Gender} gender
 * @returns {number}
 */
export function bodyFatFromBMI(bmi, age, gender) {
  const sex = gender === 'female' ? 0 : 1
  return clamp(1.2 * bmi + 0.23 * age - 10.8 * sex - 5.4, 3, 60)
}

/**
 * Resolves the best available body-fat estimate.
 * @param {Object} p
 * @param {number} p.bmi
 * @param {number} p.age
 * @param {Gender} p.gender
 * @param {number} p.heightCm
 * @param {number|string} [p.bodyFat]  User-provided %.
 * @param {number|string} [p.waist]    Waist circumference in cm.
 * @returns {BodyFatResult}
 */
export function estimateBodyFat({ bmi, age, gender, heightCm, bodyFat, waist }) {
  const measured = validNum(bodyFat)
  const waistCm = validNum(waist)

  let percent
  /** @type {BodyFatResult['method']} */
  let method

  if (measured) {
    percent = clamp(measured, 3, 60)
    method = 'measured'
  } else if (waistCm && heightCm) {
    percent = bodyFatFromWaist(heightCm, waistCm, gender)
    method = 'rfm'
  } else {
    percent = bodyFatFromBMI(bmi, age, gender)
    method = 'bmi'
  }

  percent = Number(percent.toFixed(1))
  return { percent, method, category: getBodyFatCategory(percent, gender) }
}

/**
 * Lean body mass from total weight and body-fat %.
 * @param {number} weightKg
 * @param {number} bodyFatPercent
 * @returns {number}
 */
export function calculateLeanBodyMass(weightKg, bodyFatPercent) {
  return Number((weightKg * (1 - bodyFatPercent / 100)).toFixed(1))
}

/**
 * Categorizes body fat using ACE/ACSM-style ranges (gender-specific).
 * @param {number} bf
 * @param {Gender} gender
 * @returns {{label:string,color:string}}
 */
export function getBodyFatCategory(bf, gender) {
  // [maxExclusive, label, tailwind tone]
  const male = [
    [6, 'Essential', 'sky'],
    [14, 'Athletic', 'brand'],
    [18, 'Fitness', 'brand'],
    [25, 'Average', 'amber'],
    [Infinity, 'High', 'rose'],
  ]
  const female = [
    [14, 'Essential', 'sky'],
    [21, 'Athletic', 'brand'],
    [25, 'Fitness', 'brand'],
    [32, 'Average', 'amber'],
    [Infinity, 'High', 'rose'],
  ]
  const table = gender === 'female' ? female : male
  const row = table.find(([max]) => bf < max) ?? table[table.length - 1]
  return { label: row[1], color: row[2] }
}
