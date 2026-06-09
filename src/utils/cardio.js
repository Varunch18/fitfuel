// ---------------------------------------------------------------------------
// Cardio / walking calorie estimation using MET values.
//
// The MET (Metabolic Equivalent of Task) system is the standard way to
// estimate activity energy cost:
//
//   kcal burned = MET x bodyweight(kg) x duration(hours)
//
// because 1 MET ≈ 1 kcal per kg of bodyweight per hour (resting metabolism).
//
// Fixed MET values come from the Compendium of Physical Activities
// (Ainsworth et al.). Incline walking is computed dynamically from speed and
// grade using the ACSM walking metabolic equation, which is far more accurate
// than a single fixed value when incline/speed vary.
// ---------------------------------------------------------------------------

/** @typedef {'walk'|'incline'|'run'|'cycle'} CardioType */

/**
 * Cardio activity catalogue. `met` is a representative fixed value; the
 * incline walk uses a computed MET instead (see computeInclineWalkMET).
 */
export const CARDIO_TYPES = {
  walk: { label: 'Normal Walk', met: 3.5, computed: false, hint: 'Level ground, casual pace' },
  incline: { label: 'Incline Walk', met: null, computed: true, hint: 'Treadmill incline / hills' },
  run: { label: 'Running', met: 9.8, computed: false, hint: 'Steady jog/run' },
  cycle: { label: 'Cycling', met: 7.5, computed: false, hint: 'Moderate effort' },
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))
const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/**
 * ACSM walking metabolic equation -> MET for incline walking.
 *
 *   VO2 (mL/kg/min) = (0.1 * S) + (1.8 * S * G) + 3.5
 *   MET = VO2 / 3.5
 *
 * where S = speed in metres/min and G = grade as a fraction (5% -> 0.05).
 * The leading 3.5 is resting VO2 (1 MET).
 *
 * @param {number} speedKmh   Walking speed in km/h.
 * @param {number} inclinePercent  Treadmill/hill incline in percent.
 * @returns {number} Estimated MET (>= 2).
 */
export function computeInclineWalkMET(speedKmh, inclinePercent) {
  const speed = toNum(speedKmh) || 5 // default brisk walk
  const grade = clamp(toNum(inclinePercent) / 100, 0, 0.4)
  const sMetresPerMin = speed * (1000 / 60)
  const vo2 = 0.1 * sMetresPerMin + 1.8 * sMetresPerMin * grade + 3.5
  return Math.max(2, vo2 / 3.5)
}

/**
 * Resolves the MET value for a cardio configuration.
 * @param {Object} p
 * @param {CardioType} p.type
 * @param {number} [p.speed]    Required for incline walk.
 * @param {number} [p.incline]  Required for incline walk.
 * @returns {number}
 */
export function resolveMET({ type, speed, incline }) {
  const def = CARDIO_TYPES[type]
  if (!def) return 0
  if (def.computed) return computeInclineWalkMET(speed, incline)
  return def.met
}

/**
 * @typedef {Object} CardioResult
 * @property {CardioType} type
 * @property {string} label
 * @property {number} met              MET used for the estimate.
 * @property {number} perSession       kcal burned in one session.
 * @property {number} weekly           kcal burned across all weekly sessions.
 * @property {number} dailyAverage     weekly / 7 (added to TDEE).
 * @property {number} sessionsPerWeek
 * @property {number} durationMin
 * @property {boolean} active          True if it contributes any calories.
 */

/**
 * Computes calories burned from a cardio configuration.
 *
 * @param {Object} p
 * @param {CardioType} p.type
 * @param {number|string} p.durationMin
 * @param {number|string} p.sessionsPerWeek
 * @param {number} p.weightKg
 * @param {number|string} [p.speed]
 * @param {number|string} [p.incline]
 * @returns {CardioResult}
 */
export function computeCardio({ type, durationMin, sessionsPerWeek, weightKg, speed, incline }) {
  const def = CARDIO_TYPES[type] ? type : 'walk'
  const minutes = toNum(durationMin)
  const sessions = toNum(sessionsPerWeek)
  const weight = toNum(weightKg)
  const met = resolveMET({ type: def, speed, incline })

  // kcal = MET x kg x hours
  const perSession = Math.round(met * weight * (minutes / 60))
  const weekly = perSession * sessions
  const dailyAverage = Math.round(weekly / 7)

  return {
    type: def,
    label: CARDIO_TYPES[def].label,
    met: Number(met.toFixed(1)),
    perSession,
    weekly,
    dailyAverage,
    sessionsPerWeek: sessions,
    durationMin: minutes,
    active: perSession > 0 && sessions > 0,
  }
}
