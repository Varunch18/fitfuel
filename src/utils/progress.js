// ---------------------------------------------------------------------------
// Progress-tracking foundation.
//
// Pure, storage-agnostic helpers for logging body weight over time and
// analysing the trend. These are intentionally decoupled from any UI or
// persistence layer so a future "Progress" page can drop in on top of them
// (e.g. backed by the existing localStorage UserDataContext pattern).
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} WeightEntry
 * @property {string} date     ISO date string (yyyy-mm-dd).
 * @property {number} weightKg
 */

/**
 * @typedef {Object} TrendAnalysis
 * @property {number} count
 * @property {WeightEntry|null} first
 * @property {WeightEntry|null} latest
 * @property {number} totalChangeKg     latest - first.
 * @property {number} weeklyRateKg      Average change per week (linear fit).
 * @property {'losing'|'gaining'|'stable'} direction
 * @property {number} spanDays
 */

/** Creates a normalized weight entry. */
export function createEntry(weightKg, date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  return { date: d.toISOString().slice(0, 10), weightKg: Number(weightKg) }
}

/** Returns a new array sorted chronologically (oldest first). */
export function sortEntries(entries = []) {
  return [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
}

/** Adds (or updates same-day) an entry and returns a new sorted array. */
export function addEntry(entries = [], entry) {
  const others = entries.filter((e) => e.date !== entry.date)
  return sortEntries([...others, entry])
}

/**
 * Simple moving average over `window` entries — smooths daily water-weight
 * noise so the underlying trend is visible.
 * @param {WeightEntry[]} entries
 * @param {number} window
 * @returns {{date:string, weightKg:number}[]}
 */
export function movingAverage(entries = [], window = 7) {
  const sorted = sortEntries(entries)
  return sorted.map((e, i) => {
    const slice = sorted.slice(Math.max(0, i - window + 1), i + 1)
    const avg = slice.reduce((s, x) => s + x.weightKg, 0) / slice.length
    return { date: e.date, weightKg: Number(avg.toFixed(2)) }
  })
}

/**
 * Analyses the weight trend using a least-squares linear fit over time, which
 * is far more robust to day-to-day fluctuation than comparing two points.
 * @param {WeightEntry[]} entries
 * @returns {TrendAnalysis}
 */
export function analyzeTrend(entries = []) {
  const sorted = sortEntries(entries)
  const count = sorted.length
  const empty = {
    count,
    first: sorted[0] ?? null,
    latest: sorted[count - 1] ?? null,
    totalChangeKg: 0,
    weeklyRateKg: 0,
    direction: 'stable',
    spanDays: 0,
  }
  if (count < 2) return empty

  const first = sorted[0]
  const latest = sorted[count - 1]
  const t0 = new Date(first.date).getTime()
  const days = sorted.map((e) => (new Date(e.date).getTime() - t0) / 86_400_000)
  const weights = sorted.map((e) => e.weightKg)

  // Least-squares slope (kg per day).
  const n = count
  const sumX = days.reduce((s, x) => s + x, 0)
  const sumY = weights.reduce((s, y) => s + y, 0)
  const sumXY = days.reduce((s, x, i) => s + x * weights[i], 0)
  const sumXX = days.reduce((s, x) => s + x * x, 0)
  const denom = n * sumXX - sumX * sumX
  const slopePerDay = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom
  const weeklyRateKg = Number((slopePerDay * 7).toFixed(2))

  return {
    count,
    first,
    latest,
    totalChangeKg: Number((latest.weightKg - first.weightKg).toFixed(1)),
    weeklyRateKg,
    direction: weeklyRateKg < -0.05 ? 'losing' : weeklyRateKg > 0.05 ? 'gaining' : 'stable',
    spanDays: Math.round(days[days.length - 1]),
  }
}
