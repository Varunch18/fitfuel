import { motion } from 'framer-motion'
import { CalendarDays, TrendingDown, TrendingUp, Minus, Flag } from 'lucide-react'

/**
 * Week-by-week cut / bulk / maintain plan.
 * `plan` is the object returned by generateWeeklyPlan() and `startWeight`
 * is the user's current weight (used as the "Week 0" baseline).
 */
export default function WeeklyPlan({ plan, startWeight, goalLabel, healthyRange }) {
  const { weeklyChangeKg, isMaintain, targetWeight, reachesTarget, weeks, totalChangeKg } = plan

  // Direction styling: losing (rose), gaining (brand/green), maintaining (sky).
  const losing = weeklyChangeKg < 0
  const tone = isMaintain ? 'sky' : losing ? 'rose' : 'brand'
  const toneText = {
    brand: 'text-brand-600 dark:text-brand-400',
    rose: 'text-rose-600 dark:text-rose-400',
    sky: 'text-sky-600 dark:text-sky-400',
  }[tone]
  const toneBar = { brand: 'bg-brand-500', rose: 'bg-rose-500', sky: 'bg-sky-500' }[tone]
  const DirIcon = isMaintain ? Minus : losing ? TrendingDown : TrendingUp

  // Progress of each week toward the target (for the mini bars).
  const span = targetWeight ? Math.abs(targetWeight - startWeight) || 1 : null

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
          <CalendarDays size={20} />
        </span>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Your Week-by-Week Plan
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {goalLabel} · projected at your current calorie target
          </p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <span className="text-sm text-slate-500 dark:text-slate-400">Weekly pace</span>
          <div className={`mt-1 flex items-center gap-2 text-2xl font-extrabold ${toneText}`}>
            <DirIcon size={22} />
            {isMaintain ? 'Hold' : `${weeklyChangeKg > 0 ? '+' : ''}${weeklyChangeKg} kg`}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {isMaintain ? 'Maintaining your weight' : 'per week'}
          </p>
        </div>

        <div className="card">
          <span className="text-sm text-slate-500 dark:text-slate-400">Projected change</span>
          <div className={`mt-1 text-2xl font-extrabold ${toneText}`}>
            {totalChangeKg > 0 ? '+' : ''}
            {totalChangeKg} kg
          </div>
          <p className="mt-1 text-xs text-slate-400">over {weeks.length} weeks</p>
        </div>

        <div className="card">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {targetWeight ? 'Goal weight' : 'Ideal weight'}
          </span>
          <div className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-slate-800 dark:text-white">
            <Flag size={20} className="text-brand-500" />
            {targetWeight ? `${targetWeight} kg` : healthyRange ? `${healthyRange.ideal} kg` : '—'}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {targetWeight
              ? reachesTarget
                ? `Reached in ~${weeks.length} weeks`
                : `Not reached within ${weeks.length} weeks`
              : healthyRange
                ? `Healthy range ${healthyRange.min}–${healthyRange.max} kg`
                : 'Set a target weight to see ETA'}
          </p>
        </div>
      </div>

      {/* Maintenance note instead of a weight table when there's no change. */}
      {isMaintain ? (
        <div className="card mt-5 text-sm text-slate-600 dark:text-slate-300">
          Your goal is to <strong>maintain</strong>, so weight should stay roughly the same. Each
          week, aim to eat around <strong>{weeks[0].calories.toLocaleString()} kcal/day</strong>,
          hit your protein target, and keep training consistent. Weigh yourself weekly and adjust
          calories by ~150 if you drift up or down.
        </div>
      ) : (
        <div className="card mt-5 overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-4 py-3 font-semibold">Week</th>
                <th className="px-4 py-3 font-semibold">Target weight</th>
                <th className="px-4 py-3 font-semibold">Daily calories</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Progress</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w, i) => {
                const progress = span
                  ? Math.min(100, (Math.abs(w.weight - startWeight) / span) * 100)
                  : ((i + 1) / weeks.length) * 100
                return (
                  <motion.tr
                    key={w.week}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800/60"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      Week {w.week}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{w.weight} kg</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {w.calories.toLocaleString()} kcal
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${toneBar}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400">
        Estimates assume ~7,700 kcal per kg of body mass and steady adherence. Real results vary with
        water, muscle and consistency — weigh in weekly and adjust.
      </p>
    </div>
  )
}
