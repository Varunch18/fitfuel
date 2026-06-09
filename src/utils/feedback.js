// ---------------------------------------------------------------------------
// Smart feedback: turns the computed numbers into plain-language guidance and
// safety warnings. Pure function of the already-computed results, so it is
// easy to test and reuse.
//
// Thresholds are grounded in common guidance:
//   - Sustainable fat loss / lean gain ~0.5-1.0% of bodyweight per week.
//   - Eating below BMR (or very low absolute calories) is flagged.
//   - Protein below the evidence-based minimum is flagged.
//   - Target weights below a healthy BMI / safe body-fat floor are flagged.
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} FeedbackMessage
 * @property {'warning'|'caution'|'info'|'success'} type
 * @property {string} title
 * @property {string} message
 */

const MIN_CALORIES = { male: 1500, female: 1200 }

/**
 * Generates an ordered list of feedback messages (most important first).
 *
 * @param {Object} p
 * @param {Object} p.userData       Raw form data.
 * @param {number} p.bmr
 * @param {number} p.tdee
 * @param {number} p.goalCalories
 * @param {number} p.dailyDelta     goalCalories - tdee.
 * @param {import('./goals.js').ProteinTarget} p.protein
 * @param {import('./projection.js').Projection} p.projection
 * @param {import('./goals.js').TargetRange|null} p.targetRange
 * @param {Object} p.bmiCategory
 * @returns {FeedbackMessage[]}
 */
export function generateFeedback({
  userData,
  bmr,
  goalCalories,
  dailyDelta,
  protein,
  projection,
  targetRange,
}) {
  /** @type {FeedbackMessage[]} */
  const out = []
  const gender = userData.gender === 'female' ? 'female' : 'male'
  const floor = MIN_CALORIES[gender]

  // 1. Calories below BMR — too aggressive.
  if (goalCalories < bmr) {
    out.push({
      type: 'warning',
      title: 'Calorie target is below your BMR',
      message: `Your target (${goalCalories.toLocaleString()} kcal) is below your BMR (${bmr.toLocaleString()} kcal) — the energy you burn at rest. Never diet below this without medical supervision; use a smaller deficit to protect muscle and metabolism.`,
    })
  } else if (goalCalories < floor) {
    // 2. Very low absolute calories.
    out.push({
      type: 'warning',
      title: 'Calorie target is very low',
      message: `Eating under ~${floor.toLocaleString()} kcal/day is hard to sustain and may under-fuel you. A gentler deficit is usually more effective.`,
    })
  }

  // 2b. Deficit larger than 25% of maintenance — aggressive even if above BMR.
  if (tdee > 0 && dailyDelta < 0) {
    const deficitPct = Math.round((Math.abs(dailyDelta) / tdee) * 100)
    if (deficitPct > 25) {
      out.push({
        type: 'caution',
        title: 'Deficit is more than 25% of maintenance',
        message: `Your deficit (~${deficitPct}% of your ${tdee.toLocaleString()} kcal maintenance) is aggressive. Deficits beyond ~25% increase muscle loss, hunger and fatigue — consider easing toward 15-20%.`,
      })
    }
  }

  // 3. Weekly rate of change exceeds the recommended ~1% of bodyweight.
  if (!projection.isMaintain && projection.weeklyRatePercent > 1) {
    const losing = projection.weeklyChangeKg < 0
    out.push({
      type: 'caution',
      title: losing ? 'Weight-loss rate exceeds recommended limits' : 'Weight-gain rate is fast',
      message: losing
        ? `You're projected to lose ~${projection.weeklyRatePercent}% of bodyweight/week. Staying under ~1%/week helps retain muscle.`
        : `Gaining ~${projection.weeklyRatePercent}% of bodyweight/week will add more fat. A slower surplus keeps gains leaner.`,
    })
  }

  // 4. Protein below the recommended minimum (can happen if calories are tight).
  if (protein.grams < protein.minGrams) {
    out.push({
      type: 'caution',
      title: 'Protein intake is below recommended levels',
      message: `Aim for at least ${protein.minGrams} g protein/day for your goal. You're currently set to ${protein.grams} g.`,
    })
  }

  // 5. Unrealistic / unsafe target weight.
  const target = Number(userData.targetWeight) || null
  if (target && targetRange) {
    if (target < targetRange.min) {
      out.push({
        type: 'warning',
        title: 'Your target weight may be unrealistic',
        message: `A target of ${target} kg is below a healthy/safe range for your height (≈${targetRange.min}–${targetRange.max} kg). Consider aiming for ${targetRange.recommended} kg.`,
      })
    } else if (target > targetRange.max) {
      out.push({
        type: 'info',
        title: 'Target above the healthy range',
        message: `${target} kg is above the healthy BMI range for your height (≈${targetRange.min}–${targetRange.max} kg). That can be fine for muscle-focused goals — just monitor body fat.`,
      })
    }
  }

  // 6. Positive reinforcement when everything looks sensible.
  if (out.length === 0) {
    out.push({
      type: 'success',
      title: 'Your plan looks balanced',
      message: `A ${Math.abs(dailyDelta)} kcal/day ${
        dailyDelta === 0 ? 'maintenance' : dailyDelta > 0 ? 'surplus' : 'deficit'
      } with ${protein.grams} g protein is a sustainable, evidence-based setup. Stay consistent and track weekly.`,
    })
  }

  return out
}
