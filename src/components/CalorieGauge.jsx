import { motion } from 'framer-motion'

/**
 * Circular calorie "gauge" rendered with an SVG ring.
 * The ring is purely decorative (always full) but animates on mount to
 * give the dashboard an attractive, energetic feel.
 */
export default function CalorieGauge({ calories, label = 'Daily Target' }) {
  const radius = 80
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative flex h-56 w-56 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          strokeWidth="14"
          className="stroke-slate-100 dark:stroke-slate-800"
        />
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          className="stroke-brand-500"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-4xl font-extrabold text-slate-800 dark:text-white"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          {calories.toLocaleString()}
        </motion.span>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">kcal / day</span>
        <span className="mt-1 rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          {label}
        </span>
      </div>
    </div>
  )
}
