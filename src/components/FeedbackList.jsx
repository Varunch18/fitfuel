import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'

/**
 * Renders the smart-feedback messages produced by generateFeedback().
 * Each message has a type that maps to an icon + tone, matching the app's
 * existing card/dark-theme styling.
 */
const STYLES = {
  warning: {
    icon: AlertTriangle,
    box: 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40',
    icontone: 'text-rose-500',
    title: 'text-rose-700 dark:text-rose-300',
  },
  caution: {
    icon: TriangleAlert,
    box: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40',
    icontone: 'text-amber-500',
    title: 'text-amber-700 dark:text-amber-300',
  },
  info: {
    icon: Info,
    box: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40',
    icontone: 'text-sky-500',
    title: 'text-sky-700 dark:text-sky-300',
  },
  success: {
    icon: CheckCircle2,
    box: 'border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/30',
    icontone: 'text-brand-500',
    title: 'text-brand-700 dark:text-brand-300',
  },
}

export default function FeedbackList({ messages = [] }) {
  if (!messages.length) return null

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Smart Feedback</h2>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Personalized guidance based on your numbers.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {messages.map((m, i) => {
          const s = STYLES[m.type] ?? STYLES.info
          const Icon = s.icon
          return (
            <motion.div
              key={`${m.title}-${i}`}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${s.box}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Icon size={20} className={`mt-0.5 flex-shrink-0 ${s.icontone}`} />
              <div>
                <h3 className={`font-bold ${s.title}`}>{m.title}</h3>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{m.message}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
