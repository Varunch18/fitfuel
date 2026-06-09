// ---------------------------------------------------------------------------
// Activity scoring -> personalized Physical Activity Level (PAL) multiplier.
//
// Instead of a single static "activity multiplier", we build the PAL from the
// components that actually drive daily energy expenditure:
//   1. Occupation (baseline NEAT - non-exercise activity)
//   2. Daily steps (additional NEAT above a baseline)
//   3. Structured gym / resistance sessions (TEA - thermic effect of activity)
//   4. Cardio sessions (TEA)
//
// PAL is the established way exercise physiology scales BMR into TDEE
// (TDEE = BMR x PAL). Typical PAL spans ~1.2 (sedentary) to ~2.0+ (very
// active). References: FAO/WHO/UNU Human Energy Requirements (2004);
// Mifflin-St Jeor (1990).
// ---------------------------------------------------------------------------

/** @typedef {'sedentary'|'light'|'moderate'|'heavy'} OccupationKey */

/**
 * @typedef {Object} ActivityInputs
 * @property {OccupationKey} [occupation]
 * @property {number|string} [gymSessions]   Resistance sessions per week.
 * @property {number|string} [cardioSessions] Cardio sessions per week.
 * @property {number|string} [dailySteps]    Average steps per day.
 */

/**
 * @typedef {Object} ActivityResult
 * @property {number} multiplier   Final PAL multiplier (1.2 - 2.2).
 * @property {string} label        Human-readable activity tier.
 * @property {string} hint         Short description of the tier.
 * @property {Object} breakdown    Per-component contribution (for transparency).
 */

// Occupation baselines reflect day-long NEAT excluding deliberate exercise.
export const OCCUPATION_LEVELS = {
  sedentary: { label: 'Desk job', base: 1.25, hint: 'Mostly sitting' },
  light: { label: 'Lightly active job', base: 1.35, hint: 'Some standing/walking' },
  moderate: { label: 'On your feet', base: 1.45, hint: 'Standing/walking most of the day' },
  heavy: { label: 'Physical labor', base: 1.6, hint: 'Manual/heavy work' },
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
  const cardio = toNum(inputs.cardioSessions)
  const steps = toNum(inputs.dailySteps)

  // Each structured session nudges PAL up, with diminishing/​capped returns so
  // we never produce unrealistic multipliers from over-reported training.
  const gymBonus = clamp(gym * 0.025, 0, 0.15) // ~6 sessions caps out
  const cardioBonus = clamp(cardio * 0.03, 0, 0.15)

  // Steps above a 5,000/day baseline add NEAT (the occupation base already
  // assumes some movement, so we only count the surplus).
  const stepsBonus = clamp(((steps - 5000) / 1000) * 0.025, 0, 0.15)

  const multiplier = clamp(
    Number((base + gymBonus + cardioBonus + stepsBonus).toFixed(3)),
    PAL_MIN,
    PAL_MAX,
  )

  return {
    multiplier,
    ...describeMultiplier(multiplier),
    breakdown: {
      occupationBase: base,
      gymBonus: Number(gymBonus.toFixed(3)),
      cardioBonus: Number(cardioBonus.toFixed(3)),
      stepsBonus: Number(stepsBonus.toFixed(3)),
    },
  }
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
