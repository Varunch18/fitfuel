import { motion } from 'framer-motion'
import { CalendarRange, Flame, Utensils } from 'lucide-react'

/**
 * "Monthly Milestones" — a higher-level timeline summarising the week-by-week
 * projection into ~monthly checkpoints. Complements (does not replace) the
 * detailed weekly table.
 */
export default function MonthlyMilestones({ milestones = [], unit = 'kg' }) {
  if (milestones.length < 1) return null

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Monthly Milestones</h2>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Your projected journey, month by month. Maintenance falls as your weight changes.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {milestones.map((m, i) => {
          const gaining = m.endWeight > m.startWeight
          const delta = Math.round((m.endWeight - m.startWeight) * 10) / 10
          return (
            <motion.div
              key={m.month}
              className="card relative overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
            >
              {/* Accent bar */}
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600" />

              <div className="flex items-center gap-2 text-slate-400">
                <CalendarRange size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">Month {m.month}</span>
              </div>

              {/* Weight transition */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  {m.startWeight}
                </span>
                <span className="text-slate-400">→</span>
                <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
                  {m.endWeight} {unit}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Range {m.rangeLow}–{m.rangeHigh} {unit}
                {delta !== 0 && (
                  <span className={gaining ? 'text-brand-500' : 'text-rose-500'}>
                    {' '}· {gaining ? '+' : ''}
                    {delta} {unit}
                  </span>
                )}
              </p>

              {/* Calories */}
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Utensils size={14} className="text-brand-500" /> Avg intake
                  </span>
                  <strong>{m.avgCalories.toLocaleString()} kcal</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-500" /> Maintenance
                  </span>
                  <strong>{m.avgMaintenance.toLocaleString()} kcal</strong>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
