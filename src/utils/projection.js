// ---------------------------------------------------------------------------
// Week-by-week weight projection.
//
// Improvement over a naive linear model: BMR (and therefore TDEE) is
// recalculated at *each* week's projected weight. As someone loses weight
// their TDEE falls, shrinking a fixed-calorie deficit, so loss naturally
// decelerates (and vice-versa for a surplus). This matches real-world
// "diet plateaus" far better than a straight line.
//
// We also express outcomes as a *range* rather than a single number, modelling
// adherence and the well-documented variability in energy balance
// (~7,700 kcal per kg is an average, not a constant).
// ---------------------------------------------------------------------------

import { calculateBMR } from './bmi.js'

// Average energy content of body-mass change (kcal/kg). Mixed lean+fat tissue.
export const KCAL_PER_KG = 7700

const round1 = (n) => Number(n.toFixed(1))

/**
 * @typedef {Object} ProjectionWeek
 * @property {number} week
 * @property {number} weight      Mid (expected) projected weight.
 * @property {number} weightLow   Optimistic-adherence estimate.
 * @property {number} weightHigh  Conservative-adherence estimate.
 * @property {number} calories    Daily calorie target (constant).
 * @property {number} tdee        Recomputed maintenance at this weight.
 */

/**
 * @typedef {Object} Projection
 * @property {ProjectionWeek[]} weeks
 * @property {number} weeklyChangeKg     Initial weekly change (kg, signed).
 * @property {boolean} isMaintain
 * @property {number|null} targetWeight
 * @property {boolean} reachesTarget
 * @property {number} weeksToTarget      Estimated weeks to reach target.
 * @property {number} totalChangeKg      Mid total change over the window.
 * @property {number} weeklyRatePercent  Weekly change as % of start weight.
 */

/**
 * Builds a non-linear projection by recomputing TDEE each week.
 *
 * @param {Object} p
 * @param {number} p.startWeight
 * @param {number} p.heightCm
 * @param {number} p.age
 * @param {Gender} p.gender
 * @param {number} p.activityMultiplier
 * @param {number} p.goalCalories
 * @param {number} [p.cardioDailyKcal=0]  Avg daily cardio burn (added to TDEE).
 * @param {number|string} [p.targetWeight]
 * @param {number} [p.maxWeeks=16]
 * @returns {Projection}
 */
export function generateProjection({
  startWeight,
  heightCm,
  age,
  gender,
  activityMultiplier,
  goalCalories,
  cardioDailyKcal = 0,
  targetWeight,
  maxWeeks = 16,
}) {
  const target = Number(targetWeight) || null

  // Initial weekly change (for labelling/maintenance detection).
  const startBmr = calculateBMR(startWeight, heightCm, age, gender)
  const startTdee = Math.round(startBmr * activityMultiplier + cardioDailyKcal)
  const initialWeeklyChange = round1(((goalCalories - startTdee) * 7) / KCAL_PER_KG)
  const isMaintain = Math.abs(initialWeeklyChange) < 0.05

  const weeks = []
  // Three adherence scenarios produce the displayed range. The "mid" path is
  // the expected outcome; low/high bound it by +/-20% of the calorie delta.
  let mid = startWeight
  let low = startWeight
  let high = startWeight
  let weeksToTarget = 0
  let reachesTarget = false

  for (let i = 1; i <= maxWeeks; i++) {
    mid = stepWeight(mid, heightCm, age, gender, activityMultiplier, goalCalories, 1.0, cardioDailyKcal)
    low = stepWeight(low, heightCm, age, gender, activityMultiplier, goalCalories, 1.2, cardioDailyKcal)
    high = stepWeight(high, heightCm, age, gender, activityMultiplier, goalCalories, 0.8, cardioDailyKcal)

    // Clamp every path so it never overshoots a defined target.
    if (target && !isMaintain) {
      ;[mid, low, high] = [mid, low, high].map((w) => clampToTarget(w, startWeight, target))
    }

    const tdee = Math.round(calculateBMR(mid, heightCm, age, gender) * activityMultiplier + cardioDailyKcal)
    weeks.push({
      week: i,
      weight: round1(mid),
      weightLow: round1(Math.min(low, high)),
      weightHigh: round1(Math.max(low, high)),
      calories: goalCalories,
      tdee,
    })

    if (target && !isMaintain && !reachesTarget && reachedTarget(mid, startWeight, target)) {
      reachesTarget = true
      weeksToTarget = i
    }

    // Stop early once the expected path reaches the target.
    if (reachesTarget && i >= weeksToTarget) break
    // Stop if change has stalled (deficit erased by lower TDEE).
    if (i > 1 && Math.abs(weeks[i - 1].weight - weeks[i - 2].weight) < 0.02) break
  }

  const last = weeks[weeks.length - 1]
  return {
    weeks,
    weeklyChangeKg: initialWeeklyChange,
    isMaintain,
    targetWeight: target,
    reachesTarget,
    weeksToTarget: reachesTarget ? weeksToTarget : weeks.length,
    totalChangeKg: round1(last.weight - startWeight),
    weeklyRatePercent: startWeight ? Number(((Math.abs(initialWeeklyChange) / startWeight) * 100).toFixed(2)) : 0,
  }
}

/**
 * Advances weight by one week given a calorie target and an adherence factor
 * applied to the deficit/surplus (1 = as planned, >1 optimistic loss, <1
 * conservative). TDEE is recomputed from the current weight.
 */
function stepWeight(weight, heightCm, age, gender, multiplier, goalCalories, adherence, cardioDailyKcal = 0) {
  const tdee = calculateBMR(weight, heightCm, age, gender) * multiplier + cardioDailyKcal
  const dailyDelta = (goalCalories - tdee) * adherence
  return weight + (dailyDelta * 7) / KCAL_PER_KG
}

function reachedTarget(weight, start, target) {
  return target > start ? weight >= target : weight <= target
}

function clampToTarget(weight, start, target) {
  if (target > start) return Math.min(weight, target)
  return Math.max(weight, target)
}

/**
 * @typedef {Object} Milestone
 * @property {number} month            1-indexed month number.
 * @property {number} startWeight      Weight at the start of the month.
 * @property {number} endWeight        Expected weight at the end of the month.
 * @property {number} rangeLow         Optimistic end-of-month weight.
 * @property {number} rangeHigh        Conservative end-of-month weight.
 * @property {number} avgCalories      Average daily intake that month.
 * @property {number} avgMaintenance   Average maintenance (TDEE) that month.
 */

/**
 * Groups the week-by-week projection into ~monthly (4-week) milestones for a
 * higher-level timeline view. Maintenance is averaged across the month's weeks
 * (it falls as weight changes), so each milestone shows a realistic snapshot.
 *
 * @param {Projection} projection
 * @param {number} startWeight
 * @returns {Milestone[]}
 */
export function buildMonthlyMilestones(projection, startWeight) {
  const { weeks } = projection
  if (!weeks.length) return []

  const milestones = []
  const monthCount = Math.ceil(weeks.length / 4)

  for (let m = 0; m < monthCount; m++) {
    const slice = weeks.slice(m * 4, m * 4 + 4)
    if (!slice.length) break
    const last = slice[slice.length - 1]
    const start = m === 0 ? startWeight : weeks[m * 4 - 1].weight
    const avgMaintenance = Math.round(slice.reduce((s, w) => s + w.tdee, 0) / slice.length)

    milestones.push({
      month: m + 1,
      startWeight: round1(start),
      endWeight: last.weight,
      rangeLow: last.weightLow,
      rangeHigh: last.weightHigh,
      avgCalories: slice[0].calories,
      avgMaintenance,
    })
  }

  return milestones
}
