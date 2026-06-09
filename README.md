# FitFuel

A modern, responsive fitness-nutrition web app that helps beginners calculate **BMI, BMR, maintenance (TDEE), goal calories, and macronutrients** — then suggests easy foods to hit those targets.

## Tech stack

- **React 18** + **Vite** (JavaScript)
- **Tailwind CSS** (dark/light mode via class strategy)
- **React Router** for pages
- **Framer Motion** for animations
- **lucide-react** icons
- **localStorage** to save your data between visits

## Pages

- **Home** — intro, features, how it works
- **Calculator** — collects your details and goal
- **Dashboard** — BMI/BMR/TDEE stats, calorie gauge, macro bars, food lists
- **About** — beginner-friendly explanation of every formula

## Getting started

```bash
cd fitfuel
npm install
npm run dev        # http://localhost:5174
```

Build for production:

```bash
npm run build
npm run preview
```

## Deployment (GitHub Pages)

This repo auto-deploys to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.

**One-time setup:** on GitHub go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

Live URL: **https://Varunch18.github.io/fitfuel/**

Notes:
- `vite.config.js` sets `base: '/fitfuel/'` for production so assets resolve under the project subpath (dev stays at `/`).
- The router uses `basename={import.meta.env.BASE_URL}` and the workflow copies `index.html` → `404.html` so client-side routes work on refresh/deep-link.

## Formulas & science

| Metric | Formula / basis | Source |
|---|---|---|
| BMI | `weight / (height_m)²` | WHO |
| BMR (male) | `10·kg + 6.25·cm − 5·age + 5` | Mifflin-St Jeor (1990) |
| BMR (female) | `10·kg + 6.25·cm − 5·age − 161` | Mifflin-St Jeor (1990) |
| TDEE | `BMR × PAL`, where PAL is built from occupation + daily steps + weekly gym/cardio (~1.2–2.2) | FAO/WHO/UNU (2004) |
| Goal calories | `TDEE + (lean bulk +250 / bulk +500 / cut −500 / maintain 0)` | — |
| Body fat (waist) | RFM: `64 − 20·(height/waist)` (men), `76 − …` (women) | Woolcott & Bergman (2018) |
| Body fat (no waist) | Deurenberg: `1.2·BMI + 0.23·age − 10.8·sex − 5.4` | Deurenberg (1991) |
| Lean body mass | `weight × (1 − bodyFat%)` | — |
| Protein | cut `2.0–2.4`, maintain `1.6–2.0`, bulk `1.6–2.2` g/kg (adjusted bodyweight if overweight) | Morton (2018), ISSN (2017) |
| Fat | `≥0.8 g/kg` and `≥20%` of calories | — |
| Carbs | remaining calories after protein & fat | — |
| TDEE (cardio) | `BMR × occupation/step/gym multiplier + avg daily cardio kcal` | — |
| Cardio burn | `MET × bodyweight(kg) × hours`; incline walk MET via ACSM equation | Compendium / ACSM |
| Weekly change | `(goalCalories − TDEE) × 7 / 7700`, **TDEE recomputed each week** (non-linear) | — |

## What's new in the engine

- **Step-based TDEE** (`utils/activity.js`): occupation multiplier + daily steps + gym sessions, with MET cardio added on top.
- **Cardio / walking tracker** (`utils/cardio.js`): MET-based burn for walk/incline/run/cycle (incline uses the ACSM walking equation), folded into TDEE.
- **Adaptive calorie coach** (`utils/coach.js`): tells you when to hold, reduce, or raise calories based on weekly rate.
- **Monthly milestones** (`buildMonthlyMilestones` in `utils/projection.js`): month-by-month timeline on top of the weekly table.
- **Body-composition support** (`utils/bodyComposition.js`): body fat (measured / RFM / Deurenberg) + lean mass.
- **Evidence-based protein & healthy target ranges** (`utils/goals.js`).
- **Non-linear weight projection** with estimate ranges (`utils/projection.js`).
- **Smart deficit safety** (`utils/feedback.js`): warns below BMR, >25% deficit, >1%/week loss, unrealistic targets.
- **Progress-tracking foundation** (`utils/progress.js`): weight/step/cardio logs + trend analysis, ready for a future Progress page.
- Calculation modules carry JSDoc `@typedef` typings for editor type-safety (project is JS/JSX, not TS).

## Project structure

```
fitfuel/
├── index.html
├── src/
│   ├── main.jsx              # app entry + providers
│   ├── App.jsx               # layout + routes
│   ├── index.css             # Tailwind + component classes
│   ├── context/              # ThemeContext, UserDataContext
│   ├── utils/                # calculations (orchestrator) + bmi, activity,
│   │                         #   cardio, bodyComposition, goals, projection,
│   │                         #   coach, feedback, progress, foodData
│   ├── components/           # Navbar, Footer, StatCard, MacroBar, CalorieGauge,
│   │                         #   FoodList, WeeklyPlan, FeedbackList, AdaptiveCoach,
│   │                         #   MonthlyMilestones, ThemeToggle
│   └── pages/                # Home, Calculator, Results, About
└── tailwind.config.js
```

> FitFuel gives general estimates for education only — not medical advice.
