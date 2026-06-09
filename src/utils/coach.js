// ---------------------------------------------------------------------------
// Adaptive Calorie Coach.
//
// Weight loss is non-linear and individual: the same calorie target can
// produce different results depending on water retention, adherence, NEAT
// changes, etc. Rather than blindly trusting the math, the coach tells the
// user how to *react* to their real weekly results.
//
// Rules (for a fat-loss phase), based on average weekly weight change:
//   0.25 - 0.75 kg/week  -> on track, keep calories the same
//   < 0.25 kg/week       -> stalling, reduce calories by 100-150
//   > 1.0 kg/week        -> too fast, increase calories by 100-150
//
// For muscle-gain phases the logic is mirrored (target ~0.25-0.5 kg/week).
// ---------------------------------------------------------------------------

/** General reference rules shown in the UI regardless of the user's numbers. */
export const ADJUSTMENT_RULES = [
  { range: '0.25 – 0.75 kg / week', action: 'Keep calories the same', tone: 'success' },
  { range: 'Less than 0.25 kg / week', action: 'Reduce calories by 100–150', tone: 'amber' },
  { range: 'More than 1 kg / week', action: 'Increase calories by 100–150', tone: 'rose' },
]

/**
 * @typedef {Object} CoachAdvice
 * @property {'on-track'|'too-slow'|'too-fast'|'maintain'} status
 * @property {string} headline
 * @property {string} detail
 * @property {number} suggestedChange   kcal/day delta to apply (signed, 0 = none).
 * @property {'success'|'amber'|'rose'|'sky'} tone
 * @property {number} weeklyChangeKg     The projected weekly change used.
 */

/**
 * Produces a concrete coaching recommendation from the projection.
 *
 * @param {Object} p
 * @param {import('./projection.js').Projection} p.projection
 * @param {Object} p.goal   The GOALS entry (has `direction`).
 * @returns {CoachAdvice}
 */
export function getCoachAdvice({ projection, goal }) {
  const weekly = projection.weeklyChangeKg // signed kg/week
  const rate = Math.abs(weekly)

  if (projection.isMaintain || goal.direction === 0) {
    return {
      status: 'maintain',
      headline: 'Hold steady & monitor',
      detail:
        'You\u2019re set to maintenance. Weigh in 3-4x/week and average it. If your weekly average drifts up or down by more than ~0.5 kg, nudge calories by 100-150 to correct.',
      suggestedChange: 0,
      tone: 'sky',
      weeklyChangeKg: weekly,
    }
  }

  // Fat-loss phase.
  if (goal.direction < 0) {
    if (rate < 0.25) {
      return {
        status: 'too-slow',
        headline: 'Loss is stalling \u2014 reduce calories',
        detail: `At ~${rate.toFixed(2)} kg/week you\u2019re below the 0.25 kg target. Drop intake by 100-150 kcal/day (or add ~1,500 daily steps) and reassess in 1-2 weeks.`,
        suggestedChange: -125,
        tone: 'amber',
        weeklyChangeKg: weekly,
      }
    }
    if (rate > 1) {
      return {
        status: 'too-fast',
        headline: 'Losing too fast \u2014 add calories',
        detail: `~${rate.toFixed(2)} kg/week is aggressive and risks muscle loss. Add 100-150 kcal/day to bring it into the safe 0.25-0.75 kg/week range.`,
        suggestedChange: 125,
        tone: 'rose',
        weeklyChangeKg: weekly,
      }
    }
    return {
      status: 'on-track',
      headline: 'On track \u2014 keep going',
      detail: `~${rate.toFixed(2)} kg/week is right in the sustainable 0.25-0.75 kg range. Keep calories the same and stay consistent.`,
      suggestedChange: 0,
      tone: 'success',
      weeklyChangeKg: weekly,
    }
  }

  // Muscle-gain phase (target ~0.25-0.5 kg/week).
  if (rate < 0.125) {
    return {
      status: 'too-slow',
      headline: 'Gaining too slowly \u2014 add calories',
      detail: `At ~${rate.toFixed(2)} kg/week growth is minimal. Add 100-150 kcal/day (mostly carbs) to support training.`,
      suggestedChange: 125,
      tone: 'amber',
      weeklyChangeKg: weekly,
    }
  }
  if (rate > 0.5) {
    return {
      status: 'too-fast',
      headline: 'Gaining too fast \u2014 trim calories',
      detail: `~${rate.toFixed(2)} kg/week will add excess fat. Reduce by 100-150 kcal/day to keep the gain lean.`,
      suggestedChange: -125,
      tone: 'rose',
      weeklyChangeKg: weekly,
    }
  }
  return {
    status: 'on-track',
    headline: 'On track \u2014 lean gains',
    detail: `~${rate.toFixed(2)} kg/week is ideal for lean muscle gain. Hold calories steady and keep progressing in the gym.`,
    suggestedChange: 0,
    tone: 'success',
    weeklyChangeKg: weekly,
  }
}
