import { motion } from 'framer-motion'
import { HeartPulse, Flame, Zap, Target, Salad, Info } from 'lucide-react'

// Beginner explanations for each metric FitFuel calculates.
const concepts = [
  {
    icon: HeartPulse,
    title: 'BMI (Body Mass Index)',
    text: 'A quick ratio of your weight to height. It gives a rough idea of whether you are under, at, or over a healthy weight. It does not measure muscle, so athletes may read high.',
    formula: 'BMI = weight (kg) ÷ height (m)²',
  },
  {
    icon: Flame,
    title: 'BMR (Basal Metabolic Rate)',
    text: 'The calories your body burns at complete rest just to keep you alive — breathing, pumping blood, and so on. We use the trusted Mifflin-St Jeor formula.',
    formula: 'Male: 10·kg + 6.25·cm − 5·age + 5  |  Female: −161 instead of +5',
  },
  {
    icon: Zap,
    title: 'TDEE (Maintenance Calories)',
    text: 'Your BMR multiplied by an activity factor. This is roughly how many calories you burn in a full day. Eat this amount to stay the same weight.',
    formula: 'TDEE = BMR × activity multiplier (1.2 – 1.9)',
  },
  {
    icon: Target,
    title: 'Goal Calories',
    text: 'We adjust your TDEE based on your goal. A surplus builds muscle/weight; a deficit burns fat. Small changes are easier to stick to.',
    formula: 'Lean bulk +250 · Bulk +500 · Cut −500 · Maintain +0',
  },
  {
    icon: Salad,
    title: 'Macronutrients',
    text: 'Calories come from protein, carbs and fat. Protein repairs muscle, carbs fuel workouts, and fats support hormones. We set protein & fat by bodyweight, then fill the rest with carbs.',
    formula: 'Protein 2.0 g/kg · Fat 0.8 g/kg · Carbs = remaining calories',
  },
]

// About page: explains the science in beginner-friendly terms.
export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">
          The science, made simple
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
          FitFuel turns proven nutrition formulas into a plan anyone can follow. Here's what each
          number means and how we calculate it.
        </p>
      </div>

      <div className="mt-10 space-y-5">
        {concepts.map((c, i) => (
          <motion.div
            key={c.title}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                <c.icon size={22} />
              </span>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.text}</p>
                <code className="mt-3 inline-block rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {c.formula}
                </code>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        <Info size={20} className="flex-shrink-0" />
        <p>
          <strong>Remember:</strong> these are estimates to get you started. Your real needs depend
          on genetics, sleep, stress and more. Track your progress for 2–3 weeks and adjust. For
          medical concerns, talk to a healthcare professional.
        </p>
      </div>
    </div>
  )
}
