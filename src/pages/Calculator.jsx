import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, ArrowRight, Gauge, RotateCcw, Sparkles, User } from 'lucide-react'
import { useUserData, DEFAULT_DATA } from '../context/UserDataContext.jsx'
import { GOALS, calculateBMI, validateUserData } from '../utils/calculations.js'
import { OCCUPATION_LEVELS, computeActivityMultiplier } from '../utils/activity.js'
import { recommendTargetRange } from '../utils/goals.js'
import { estimateBodyFat, calculateLeanBodyMass } from '../utils/bodyComposition.js'

// Calculator form: collects user inputs, validates, saves, then routes to results.
export default function Calculator() {
  const navigate = useNavigate()
  const { userData, saveData } = useUserData()
  const [form, setForm] = useState(userData ?? DEFAULT_DATA)
  const [errors, setErrors] = useState({})

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateUserData(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    saveData(form)
    navigate('/results')
  }

  const resetForm = () => {
    setForm(DEFAULT_DATA)
    setErrors({})
  }

  // Live, personalized estimates shown as the user fills the form.
  const heightN = Number(form.height)
  const weightN = Number(form.weight)
  const ageN = Number(form.age) || 25
  const gender = form.gender === 'female' ? 'female' : 'male'
  const canSuggest = heightN >= 100 && heightN <= 250 && weightN >= 30 && weightN <= 300

  // Live activity factor preview from the lifestyle inputs.
  const activityPreview = computeActivityMultiplier(form)

  // Recommended healthy target-weight *range* (replaces the old fixed number).
  let targetRange = null
  if (canSuggest) {
    const bmi = calculateBMI(weightN, heightN)
    const bf = estimateBodyFat({
      bmi,
      age: ageN,
      gender,
      heightCm: heightN,
      bodyFat: form.bodyFat,
      waist: form.waist,
    })
    const lbm = calculateLeanBodyMass(weightN, bf.percent)
    targetRange = recommendTargetRange({
      weightKg: weightN,
      heightCm: heightN,
      goalKey: form.goal,
      leanBodyMass: lbm,
      gender,
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Nutrition Calculator</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Fill in your details — every field helps us personalize your plan.
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="card space-y-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Name */}
        <div>
          <label className="field-label">Your Name</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. Alex"
              className="field-input pl-10"
            />
          </div>
          {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name}</p>}
        </div>

        {/* Age + Gender */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label">Age (years)</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => update('age', e.target.value)}
              placeholder="e.g. 25"
              className="field-input"
            />
            {errors.age && <p className="mt-1 text-sm text-rose-500">{errors.age}</p>}
          </div>
          <div>
            <label className="field-label">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {['male', 'female'].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => update('gender', g)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition ${
                    form.gender === g
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                      : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Height + Weight */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label">Height (cm)</label>
            <input
              type="number"
              value={form.height}
              onChange={(e) => update('height', e.target.value)}
              placeholder="e.g. 175"
              className="field-input"
            />
            {errors.height && <p className="mt-1 text-sm text-rose-500">{errors.height}</p>}
          </div>
          <div>
            <label className="field-label">Weight (kg)</label>
            <input
              type="number"
              value={form.weight}
              onChange={(e) => update('weight', e.target.value)}
              placeholder="e.g. 70"
              className="field-input"
            />
            {errors.weight && <p className="mt-1 text-sm text-rose-500">{errors.weight}</p>}
          </div>
        </div>

        {/* Activity scoring — personalized instead of one static multiplier */}
        <div className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-brand-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Activity &amp; Lifestyle
            </span>
          </div>

          <div>
            <label className="field-label">Occupation</label>
            <select
              value={form.occupation}
              onChange={(e) => update('occupation', e.target.value)}
              className="field-input"
            >
              {Object.entries(OCCUPATION_LEVELS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label} — {val.hint}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="field-label">Gym / week</label>
              <input
                type="number"
                min="0"
                value={form.gymSessions}
                onChange={(e) => update('gymSessions', e.target.value)}
                placeholder="e.g. 4"
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Cardio / week</label>
              <input
                type="number"
                min="0"
                value={form.cardioSessions}
                onChange={(e) => update('cardioSessions', e.target.value)}
                placeholder="e.g. 2"
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Daily steps</label>
              <input
                type="number"
                min="0"
                value={form.dailySteps}
                onChange={(e) => update('dailySteps', e.target.value)}
                placeholder="e.g. 8000"
                className="field-input"
              />
              {errors.dailySteps && (
                <p className="mt-1 text-sm text-rose-500">{errors.dailySteps}</p>
              )}
            </div>
          </div>

          {/* Live estimated activity factor */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <Gauge size={15} className="text-brand-500" />
            Estimated activity factor:{' '}
            <strong className="text-brand-700 dark:text-brand-300">
              {activityPreview.multiplier}
            </strong>
            <span className="text-slate-400">· {activityPreview.label}</span>
          </div>
        </div>

        {/* Optional body composition */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label">
              Body Fat % <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              type="number"
              min="3"
              max="60"
              value={form.bodyFat}
              onChange={(e) => update('bodyFat', e.target.value)}
              placeholder="e.g. 18"
              className="field-input"
            />
            {errors.bodyFat && <p className="mt-1 text-sm text-rose-500">{errors.bodyFat}</p>}
          </div>
          <div>
            <label className="field-label">
              Waist (cm) <span className="font-normal text-slate-400">— optional</span>
            </label>
            <input
              type="number"
              min="40"
              max="200"
              value={form.waist}
              onChange={(e) => update('waist', e.target.value)}
              placeholder="e.g. 82"
              className="field-input"
            />
            {errors.waist && <p className="mt-1 text-sm text-rose-500">{errors.waist}</p>}
          </div>
          <p className="text-xs text-slate-400 sm:col-span-2">
            Leave these blank and we'll estimate your body fat from your BMI, age &amp; height.
            Adding waist (or a measured %) makes it more accurate.
          </p>
        </div>

        {/* Goal */}
        <div>
          <label className="field-label">Your Goal</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(GOALS).map(([key, val]) => (
              <button
                type="button"
                key={key}
                onClick={() => update('goal', key)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  form.goal === key
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/40'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                <span className="block text-sm font-semibold text-slate-800 dark:text-white">
                  {val.label}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{val.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Optional target weight - drives the week-by-week plan */}
        <div>
          <label className="field-label">
            Target Weight (kg) <span className="font-normal text-slate-400">— optional</span>
          </label>
          <input
            type="number"
            value={form.targetWeight}
            onChange={(e) => update('targetWeight', e.target.value)}
            placeholder="e.g. 65 — leave blank for a 12-week projection"
            className="field-input"
          />

          {/* Recommended healthy target *range* based on BMI, body fat & goal. */}
          {targetRange ? (
            <div className="mt-2 flex flex-col gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-brand-800 dark:bg-brand-900/30">
              <span className="flex flex-col gap-0.5 text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <Sparkles size={15} className="text-brand-500" />
                  Recommended range:{' '}
                  <strong className="text-brand-700 dark:text-brand-300">
                    {targetRange.min}–{targetRange.max} kg
                  </strong>
                </span>
                <span className="text-xs text-slate-400">{targetRange.note}</span>
              </span>
              <button
                type="button"
                onClick={() => update('targetWeight', String(targetRange.recommended))}
                className="shrink-0 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600"
              >
                Use {targetRange.recommended} kg
              </button>
            </div>
          ) : (
            <p className="mt-1 text-xs text-slate-400">
              Enter your height &amp; weight above and we'll recommend a healthy target range for your goal.
            </p>
          )}
        </div>

        {/* Diet preference for food suggestions */}
        <div>
          <label className="field-label">Food Preference (for suggestions)</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'veg', label: 'Veg' },
              { key: 'nonveg', label: 'Non-Veg' },
              { key: 'mix', label: 'Mixed' },
            ].map((d) => (
              <button
                type="button"
                key={d.key}
                onClick={() => update('diet', d.key)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  form.diet === d.key
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                    : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button type="submit" className="btn-primary flex-1">
            Calculate My Plan <ArrowRight size={18} />
          </button>
          <button type="button" onClick={resetForm} className="btn-ghost">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </motion.form>
    </div>
  )
}
