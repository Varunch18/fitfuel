import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Beef,
  CalendarCheck,
  Drumstick,
  Flame,
  Gauge,
  HeartPulse,
  Leaf,
  Nut,
  Pencil,
  Percent,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wheat,
  Zap,
} from 'lucide-react'
import { useUserData } from '../context/UserDataContext.jsx'
import { computeResults } from '../utils/calculations.js'
import {
  HEALTHY_CARBS,
  HEALTHY_FATS,
  NONVEG_PROTEIN,
  VEG_PROTEIN,
} from '../utils/foodData.js'
import StatCard from '../components/StatCard.jsx'
import CalorieGauge from '../components/CalorieGauge.jsx'
import MacroBar from '../components/MacroBar.jsx'
import FoodList from '../components/FoodList.jsx'
import WeeklyPlan from '../components/WeeklyPlan.jsx'
import FeedbackList from '../components/FeedbackList.jsx'

// Friendly labels for how body fat was derived.
const BF_METHOD_LABEL = {
  measured: 'your measured %',
  rfm: 'estimated from waist',
  bmi: 'estimated from BMI',
}

// Formats an approximate completion date N weeks from now.
function weeksFromNowLabel(weeks) {
  const d = new Date()
  d.setDate(d.getDate() + weeks * 7)
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

// Empty state shown when there's no saved data yet.
function NoData() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-900/40">
        <Flame size={28} />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-white">No results yet</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Fill in the calculator first and we'll build your personalized dashboard.
      </p>
      <Link to="/calculator" className="btn-primary mt-6">
        Go to Calculator
      </Link>
    </div>
  )
}

// Results dashboard: BMI/BMR/TDEE stats, calorie gauge, macros, and foods.
export default function Results() {
  const { userData, clearData } = useUserData()

  if (!userData) return <NoData />

  const r = computeResults(userData)
  const goal = r.goal

  // Percentage of total calories that each macro contributes (for the bars).
  const total = r.goalCalories || 1
  const macroPercent = {
    protein: (r.macros.protein.cals / total) * 100,
    carbs: (r.macros.carbs.cals / total) * 100,
    fat: (r.macros.fat.cals / total) * 100,
  }

  // Non-linear week-by-week projection toward the (optional) target weight.
  const startWeight = Number(userData.weight)
  const healthyRange = r.healthyRange
  const projection = r.projection

  // Calorie deficit/surplus presentation.
  const deficit = r.dailyDelta
  const deficitTone = deficit < 0 ? 'rose' : deficit > 0 ? 'brand' : 'sky'

  // Goal completion estimate.
  const hasTarget = !!projection.targetWeight
  const etaValue = hasTarget
    ? projection.reachesTarget
      ? `${projection.weeksToTarget} wks`
      : '16+ wks'
    : '—'
  const etaHint = hasTarget
    ? projection.reachesTarget
      ? `~${weeksFromNowLabel(projection.weeksToTarget)} to ${projection.targetWeight} kg`
      : 'Target not reached in 16 weeks'
    : 'Set a target weight'

  // Build the protein cards based on diet preference.
  // 'mix' shows both veg and non-veg sources side by side.
  const proteinCards =
    userData.diet === 'mix'
      ? [
          { title: 'Protein (Veg)', items: VEG_PROTEIN, icon: Leaf, tone: 'brand' },
          { title: 'Protein (Non-Veg)', items: NONVEG_PROTEIN, icon: Drumstick, tone: 'rose' },
        ]
      : userData.diet === 'nonveg'
        ? [
            { title: 'Protein (Non-Veg)', items: NONVEG_PROTEIN, icon: Drumstick, tone: 'brand' },
            { title: 'More Veg Protein', items: VEG_PROTEIN, icon: Leaf, tone: 'rose' },
          ]
        : [
            { title: 'Protein (Veg)', items: VEG_PROTEIN, icon: Leaf, tone: 'brand' },
            { title: 'Non-Veg Protein', items: NONVEG_PROTEIN, icon: Beef, tone: 'rose' },
          ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {userData.name ? `${userData.name}'s` : 'Your'} Dashboard
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Goal: <span className="font-semibold text-brand-600">{goal.label}</span> ·{' '}
            {r.activity.label} (factor {r.activity.multiplier})
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/calculator" className="btn-ghost">
            <Pencil size={16} /> Edit
          </Link>
          <button
            onClick={clearData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
          >
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={HeartPulse}
          title="BMI"
          value={r.bmi}
          hint={`${r.bmiCategory.label} (${r.bmiCategory.range})`}
          tone={r.bmiCategory.color}
        />
        <StatCard
          icon={Flame}
          title="BMR (at rest)"
          value={r.bmr.toLocaleString()}
          unit="kcal"
          hint="Calories burned doing nothing"
          tone="amber"
        />
        <StatCard
          icon={Zap}
          title="Maintenance (TDEE)"
          value={r.tdee.toLocaleString()}
          unit="kcal"
          hint="Calories to stay the same weight"
          tone="sky"
        />
      </div>

      {/* Body composition & goal stats */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Scale}
          title="Lean Body Mass"
          value={r.leanBodyMass}
          unit="kg"
          hint="Fat-free mass (muscle, bone, organs)"
          tone="brand"
        />
        <StatCard
          icon={Percent}
          title="Body Fat (est.)"
          value={`${r.bodyFat.percent}%`}
          hint={`${r.bodyFat.category.label} · ${BF_METHOD_LABEL[r.bodyFat.method]}`}
          tone={r.bodyFat.category.color}
        />
        <StatCard
          icon={deficit < 0 ? TrendingDown : TrendingUp}
          title={deficit < 0 ? 'Daily Deficit' : deficit > 0 ? 'Daily Surplus' : 'Energy Balance'}
          value={`${deficit > 0 ? '+' : ''}${deficit.toLocaleString()}`}
          unit="kcal"
          hint={deficit === 0 ? 'At maintenance' : `${deficit < 0 ? 'Below' : 'Above'} maintenance`}
          tone={deficitTone}
        />
        <StatCard
          icon={hasTarget ? CalendarCheck : Gauge}
          title="Goal Completion"
          value={etaValue}
          hint={etaHint}
          tone="sky"
        />
      </div>

      {/* Calorie gauge + macros */}
      <div className="mt-8 grid gap-5 lg:grid-cols-5">
        <motion.div
          className="card flex flex-col items-center justify-center lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CalorieGauge calories={r.goalCalories} label={goal.label} />
          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            {goal.adjustment === 0
              ? 'Eat this to maintain your current weight.'
              : `That's ${Math.abs(goal.adjustment)} kcal ${
                  goal.adjustment > 0 ? 'above' : 'below'
                } maintenance.`}
          </p>
        </motion.div>

        <div className="card lg:col-span-3">
          <h2 className="mb-5 text-lg font-bold text-slate-800 dark:text-white">
            Daily Macronutrients
          </h2>
          <div className="space-y-5">
            <MacroBar
              label="Protein"
              grams={r.macros.protein.grams}
              cals={r.macros.protein.cals}
              percent={macroPercent.protein}
              color="brand"
            />
            <MacroBar
              label="Carbs"
              grams={r.macros.carbs.grams}
              cals={r.macros.carbs.cals}
              percent={macroPercent.carbs}
              color="sky"
            />
            <MacroBar
              label="Fat"
              grams={r.macros.fat.grams}
              cals={r.macros.fat.cals}
              percent={macroPercent.fat}
              color="amber"
            />
          </div>
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <span className="font-semibold">Protein target:</span> {r.protein.grams} g/day
            (recommended {r.protein.minGrams}–{r.protein.maxGrams} g, ~{r.protein.perKg} g/kg for a{' '}
            {goal.label.toLowerCase()}). Hit this first — it preserves muscle and keeps you full.
          </div>
        </div>
      </div>

      {/* Smart feedback / safety guidance */}
      <FeedbackList messages={r.feedback} />

      {/* Week-by-week cut / bulk / maintain plan */}
      <WeeklyPlan
        projection={projection}
        startWeight={startWeight}
        goalLabel={goal.label}
        healthyRange={healthyRange}
      />

      {/* Food recommendations */}
      <div className="mt-12">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Recommended Foods
        </h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Easy, accessible options to hit your macros.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {proteinCards.map((card) => (
            <FoodList
              key={card.title}
              icon={card.icon}
              title={card.title}
              items={card.items}
              tone={card.tone}
            />
          ))}
          <FoodList icon={Wheat} title="Healthy Carbs" items={HEALTHY_CARBS} tone="sky" />
          <FoodList icon={Nut} title="Healthy Fats" items={HEALTHY_FATS} tone="amber" />
        </div>
      </div>
    </div>
  )
}
