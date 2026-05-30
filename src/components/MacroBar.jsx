import { motion } from 'framer-motion'

/**
 * Animated progress bar for a single macronutrient.
 * `value`/`max` drive the fill width; `color` is a tailwind color name.
 */
export default function MacroBar({ label, grams, cals, percent, color = 'brand' }) {
  const colorMap = {
    brand: 'bg-brand-500',
    sky: 'bg-sky-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {grams} g · {cals} kcal
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div
          className={`h-full rounded-full ${colorMap[color] ?? colorMap.brand}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percent)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="mt-1 text-right text-xs text-slate-400">{Math.round(percent)}% of calories</div>
    </div>
  )
}
