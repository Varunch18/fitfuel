import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  Calculator,
  Flame,
  HeartPulse,
  Salad,
  Target,
  TrendingUp,
} from 'lucide-react'

const features = [
  { icon: HeartPulse, title: 'BMI & Health', text: 'See where you stand and what your number means.' },
  { icon: Flame, title: 'BMR & TDEE', text: 'Know how many calories your body burns each day.' },
  { icon: Target, title: 'Goal Calories', text: 'Maintain, lean bulk, bulk, or cut with clear targets.' },
  { icon: Salad, title: 'Macros & Foods', text: 'Protein, carbs & fats plus easy food ideas.' },
]

const steps = [
  { n: '1', title: 'Enter your details', text: 'Age, gender, height, weight, activity & goal.' },
  { n: '2', title: 'We do the math', text: 'Trusted formulas calculate everything instantly.' },
  { n: '3', title: 'Follow your plan', text: 'Get calories, macros and beginner food tips.' },
]

// Landing page: hero, value props, and how it works.
export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-900/30" />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
              <Activity size={15} /> Nutrition made simple for beginners
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
              Fuel your fitness with the <span className="text-brand-500">right numbers</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              FitFuel calculates your BMI, calories and macros in seconds — then shows you exactly
              what to eat. No experience needed.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/calculator" className="btn-primary">
                <Calculator size={18} /> Start Calculating
              </Link>
              <Link to="/about" className="btn-ghost">
                Learn how it works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                <f.icon size={22} />
              </span>
              <h3 className="mt-4 font-bold text-slate-800 dark:text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">How it works</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Three simple steps to your plan.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="card text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-lg font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-4 font-bold text-slate-800 dark:text-white">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-12 text-center text-white shadow-lg">
          <TrendingUp className="mx-auto mb-3" size={32} />
          <h2 className="text-2xl font-extrabold sm:text-3xl">Ready to start your journey?</h2>
          <p className="mx-auto mt-2 max-w-xl text-brand-50">
            Get your personalized calorie and macro targets in under a minute.
          </p>
          <Link
            to="/calculator"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <Calculator size={18} /> Open the Calculator
          </Link>
        </div>
      </section>
    </div>
  )
}
