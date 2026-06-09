import { motion } from 'framer-motion'
import { ArrowDownCircle, ArrowUpCircle, CheckCircle2, Compass } from 'lucide-react'
import { ADJUSTMENT_RULES } from '../utils/calculations.js'

// Tone -> tailwind classes, matching the app's existing palette.
const TONES = {
  success: { box: 'border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/30', text: 'text-brand-700 dark:text-brand-300', icon: CheckCircle2 },
  amber: { box: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', icon: ArrowDownCircle },
  rose: { box: 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', icon: ArrowUpCircle },
  sky: { box: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', icon: Compass },
}

const RULE_DOT = { success: 'bg-brand-500', amber: 'bg-amber-500', rose: 'bg-rose-500' }

/**
 * "How To Adjust Calories" — shows the user's current coaching recommendation
 * plus the general adjustment rules so they know how to react week to week.
 */
export default function AdaptiveCoach({ advice }) {
  if (!advice) return null
  const tone = TONES[advice.tone] ?? TONES.sky
  const Icon = tone.icon

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">How To Adjust Calories</h2>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Weigh in 3–4x per week and use your <em>average</em> to decide when to change calories.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        {/* Personalized recommendation */}
        <motion.div
          className={`rounded-2xl border p-5 lg:col-span-2 ${tone.box}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center gap-2">
            <Icon size={22} className={tone.text} />
            <h3 className={`text-lg font-bold ${tone.text}`}>{advice.headline}</h3>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{advice.detail}</p>
          {advice.suggestedChange !== 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
              Suggested change:
              <span className={tone.text}>
                {advice.suggestedChange > 0 ? '+' : ''}
                {advice.suggestedChange} kcal/day
              </span>
            </div>
          )}
        </motion.div>

        {/* General rules */}
        <div className="card lg:col-span-3">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
            Weekly weight-change guide
          </h3>
          <div className="space-y-3">
            {ADJUSTMENT_RULES.map((rule) => (
              <div
                key={rule.range}
                className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${RULE_DOT[rule.tone]}`} />
                  {rule.range}
                </span>
                <span className="text-right text-sm text-slate-500 dark:text-slate-400">
                  {rule.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
