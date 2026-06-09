// ---------------------------------------------------------------------------
// Step-based, personalized activity model.
//
// Rather than one generic "activity level" dropdown, we build the day's energy
// expenditure from the components that actually drive it:
//
//   Base TDEE = BMR x occupation multiplier   (day-long NEAT from your job)
//   + step adjustment       (extra NEAT above a 5,000/day baseline)
//   + gym adjustment        (resistance-training activity / EPOC)
//   + cardio calories       (computed separately via MET — see cardio.js)
//
// This function returns the *multiplier* portion (occupation + steps + gym).
// Cardio is added on top as an absolute kcal value in calculations.js so the
// MET-based estimate isn't double-counted.
//
// References: FAO/WHO/UNU Human Energy Requirements (2004); ACSM guidelines.
// ---------------------------------------------------------------------------

/** @typedef {'sedentary'|'light'|'moderate'|'heavy'} OccupationKey */

/**
 * @typedef {Object} ActivityInputs
 * @property {OccupationKey} [occupation]
 * @property {number|string} [gymSessions]   Resistance sessions per week.
 * @property {number|string} [dailySteps]    Average steps per day.
 */

/**
 * @typedef {Object} ActivityResult
 * @property {number} multiplier   Occupation + steps + gym multiplier (1.2-2.2).
 * @property {string} label        Human-readable activity tier.
 * @property {string} hint         Short description of the tier.
 * @property {Object} breakdown    Per-component contribution (for transparency).
 */

// Occupation multipliers (classic activity factors) — the base of TDEE.
// Keys kept stable for backwards-compatible saved data; labels match the
// requested wording (Desk Job / Lightly Active / Active Job / Physical Labor).
export const OCCUPATION_LEVELS = {
  sedentary: { label: 'Desk Job', base: 1.2, hint: 'Mostly sitting' },
  light: { label: 'Lightly Active', base: 1.375, hint: 'Some standing/walking' },
  moderate: { label: 'Active Job', base: 1.55, hint: 'On your feet most of the day' },
  heavy: { label: 'Physical Labor', base: 1.725, hint: 'Manual/heavy work' },
}

// Bounds keep the final estimate physiologically sensible.
const PAL_MIN = 1.2
const PAL_MAX = 2.2

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))
const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/**
 * Computes a personalized PAL multiplier from activity inputs.
 * @param {ActivityInputs} inputs
 * @returns {ActivityResult}
 */
export function computeActivityMultiplier(inputs = {}) {
  const occupation = OCCUPATION_LEVELS[inputs.occupation] ? inputs.occupation : 'sedentary'
  const base = OCCUPATION_LEVELS[occupation].base

  const gym = toNum(inputs.gymSessions)
  const steps = toNum(inputs.dailySteps)

  // Each resistance session nudges the multiplier up, capped so over-reported
  // training can't produce an unrealistic factor.
  const gymBonus = clamp(gym * 0.03, 0, 0.15) // ~5 sessions caps out

  // Steps above a 5,000/day baseline add NEAT (the occupation base already
  // assumes some movement, so we only count the surplus).
  const stepsBonus = clamp(((steps - 5000) / 1000) * 0.03, 0, 0.2)

  const multiplier = clamp(
    Number((base + gymBonus + stepsBonus).toFixed(3)),
    PAL_MIN,
    PAL_MAX,
  )

  return {
    multiplier,
    ...describeMultiplier(multiplier),
    breakdown: {
      occupationBase: base,
      gymBonus: Number(gymBonus.toFixed(3)),
      stepsBonus: Number(stepsBonus.toFixed(3)),
    },
  }
}

/**
 * Recommends a daily step goal from the user's goal and current steps.
 * Walking is the safest lever for adjusting NEAT without extra fatigue.
 * @param {number|string} currentSteps
 * @param {import('./goals.js').GoalKey} goalKey
 * @returns {{steps:number, note:string}}
 */
export function recommendStepGoal(currentSteps, goalKey) {
  const current = toNum(currentSteps)
  const baseline = goalKey === 'cut' ? 10000 : goalKey === 'bulk' || goalKey === 'leanbulk' ? 7000 : 8000
  // If they already walk more, nudge slightly upward for a cut, else maintain.
  const steps = goalKey === 'cut' ? Math.min(14000, Math.max(baseline, current + 1000)) : Math.max(baseline, current)
  const note =
    goalKey === 'cut'
      ? 'More steps boost your daily burn without extra hunger.'
      : goalKey === 'bulk' || goalKey === 'leanbulk'
        ? 'Keep steps moderate so you can recover and grow.'
        : 'A solid baseline for general health.'
  return { steps: Math.round(steps / 500) * 500, note }
}

/**
 * Maps a PAL multiplier to a friendly tier label + hint (used in the UI).
 * @param {number} multiplier
 * @returns {{label: string, hint: string}}
 */
export function describeMultiplier(multiplier) {
  if (multiplier < 1.35) return { label: 'Sedentary', hint: 'Little structured activity' }
  if (multiplier < 1.5) return { label: 'Lightly Active', hint: 'Light weekly activity' }
  if (multiplier < 1.65) return { label: 'Moderately Active', hint: 'Regular training' }
  if (multiplier < 1.8) return { label: 'Very Active', hint: 'Frequent, hard training' }
  return { label: 'Extremely Active', hint: 'High training + active lifestyle' }
}
