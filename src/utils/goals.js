// ---------------------------------------------------------------------------
// Goals, protein recommendations, and healthy target-weight ranges.
//
// Protein ranges are evidence-based (g per kg of reference bodyweight):
//   - Cutting:     2.0 - 2.4  (higher protein preserves lean mass in a deficit)
//   - Maintenance: 1.6 - 2.0
//   - Bulking:     1.6 - 2.2
// Refs: Morton et al. 2018 (meta-analysis); Helms et al. 2014; ISSN position
// stand (Jäger et al. 2017).
//
// For people carrying high body fat, dosing protein on *total* bodyweight
// overestimates needs, so we use an "adjusted bodyweight" (a clinically used
// approach) as the reference instead.
// ---------------------------------------------------------------------------

import { getHealthyWeightRange } from './bmi.js'

/** @typedef {'maintain'|'leanbulk'|'bulk'|'cut'} GoalKey */

/** Goal calorie adjustments applied on top of TDEE (kcal/day). */
export const GOALS = {
  maintain: { label: 'Maintain Weight', adjustment: 0, hint: 'Keep your current weight', direction: 0 },
  leanbulk: { label: 'Lean Bulk', adjustment: 250, hint: 'Slow muscle gain, minimal fat', direction: 1 },
  bulk: { label: 'Bulk', adjustment: 500, hint: 'Faster muscle & weight gain', direction: 1 },
  cut: { label: 'Cut', adjustment: -500, hint: 'Lose fat while keeping muscle', direction: -1 },
}

/** Evidence-based protein ranges (g/kg) keyed by goal. */
export const PROTEIN_RANGES = {
  cut: { min: 2.0, max: 2.4 },
  maintain: { min: 1.6, max: 2.0 },
  leanbulk: { min: 1.6, max: 2.2 },
  bulk: { min: 1.6, max: 2.2 },
}

/**
 * Adjusted bodyweight used as the protein/fat reference. For people above the
 * healthy weight range we weight the excess mass at 25% (it is largely fat,
 * which has low protein requirements). Otherwise we use actual bodyweight.
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {number}
 */
export function getReferenceWeight(weightKg, heightCm) {
  const { max } = getHealthyWeightRange(heightCm)
  if (max && weightKg > max) return Number((max + 0.25 * (weightKg - max)).toFixed(1))
  return weightKg
}

/**
 * @typedef {Object} ProteinTarget
 * @property {number} grams        Recommended daily protein (g).
 * @property {number} perKg        g/kg used (midpoint of the goal range).
 * @property {number} minGrams     Low end of the recommended band.
 * @property {number} maxGrams     High end of the recommended band.
 * @property {number} referenceWeight  Bodyweight basis used.
 * @property {'bodyweight'|'adjusted'} basis
 */

/**
 * Calculates an evidence-based daily protein target.
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {GoalKey} goalKey
 * @returns {ProteinTarget}
 */
export function calculateProteinTarget(weightKg, heightCm, goalKey) {
  const range = PROTEIN_RANGES[goalKey] ?? PROTEIN_RANGES.maintain
  const referenceWeight = getReferenceWeight(weightKg, heightCm)
  const perKg = (range.min + range.max) / 2
  return {
    grams: Math.round(perKg * referenceWeight),
    perKg: Number(perKg.toFixed(2)),
    minGrams: Math.round(range.min * referenceWeight),
    maxGrams: Math.round(range.max * referenceWeight),
    referenceWeight,
    basis: referenceWeight === weightKg ? 'bodyweight' : 'adjusted',
  }
}

/**
 * @typedef {Object} TargetRange
 * @property {number} min          Lower healthy/realistic target weight.
 * @property {number} max          Upper healthy/realistic target weight.
 * @property {number} recommended  Suggested value within the range.
 * @property {string} note         Short explanation for the user.
 */

/**
 * Recommends a healthy, realistic target-weight *range* based on BMI band,
 * lean body mass (a floor so we never suggest dropping below safe body fat),
 * and the chosen goal. Replaces the old single fixed-number suggestion.
 *
 * @param {Object} p
 * @param {number} p.weightKg
 * @param {number} p.heightCm
 * @param {GoalKey} p.goalKey
 * @param {number} p.leanBodyMass
 * @param {Gender} p.gender
 * @returns {TargetRange|null}
 */
export function recommendTargetRange({ weightKg, heightCm, goalKey, leanBodyMass, gender }) {
  const { min, ideal, max } = getHealthyWeightRange(heightCm)
  if (!ideal) return null

  // Safe minimum weight: the weight at which the user would hit the lower edge
  // of a healthy body-fat %. Prevents recommending unrealistic leanness.
  const safeBodyFat = gender === 'female' ? 0.18 : 0.10
  const leanFloor = leanBodyMass ? Math.round(leanBodyMass / (1 - safeBodyFat)) : min

  if (goalKey === 'cut') {
    const lo = Math.max(min, leanFloor)
    const hi = Math.min(max, Math.round(weightKg)) // never "cut" above current
    const recommended = Math.max(lo, Math.min(ideal, hi))
    return {
      min: lo,
      max: Math.max(lo, hi),
      recommended,
      note: 'Healthy fat-loss range that preserves lean mass.',
    }
  }

  if (goalKey === 'bulk' || goalKey === 'leanbulk') {
    const lo = Math.max(ideal, Math.round(weightKg)) // gain from current upward
    const hi = max
    const recommended = Math.min(hi, Math.max(lo, ideal))
    return {
      min: lo,
      max: Math.max(lo, hi),
      recommended,
      note: 'Lean-gain range within a healthy BMI.',
    }
  }

  return {
    min,
    max,
    recommended: ideal,
    note: 'Healthy weight range to maintain.',
  }
}
