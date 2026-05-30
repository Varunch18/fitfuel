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

## Formulas used

| Metric | Formula |
|---|---|
| BMI | `weight / (height_m)²` |
| BMR (male) | `10·kg + 6.25·cm − 5·age + 5` |
| BMR (female) | `10·kg + 6.25·cm − 5·age − 161` |
| TDEE | `BMR × activity multiplier (1.2–1.9)` |
| Goal calories | `TDEE + (lean bulk +250 / bulk +500 / cut −500 / maintain 0)` |
| Protein | `2.0 g/kg bodyweight` |
| Fat | `0.8 g/kg bodyweight` |
| Carbs | remaining calories after protein & fat |

## Project structure

```
fitfuel/
├── index.html
├── src/
│   ├── main.jsx              # app entry + providers
│   ├── App.jsx               # layout + routes
│   ├── index.css             # Tailwind + component classes
│   ├── context/              # ThemeContext, UserDataContext
│   ├── utils/                # calculations.js, foodData.js
│   ├── components/           # Navbar, Footer, StatCard, MacroBar, CalorieGauge, FoodList, ThemeToggle
│   └── pages/                # Home, Calculator, Results, About
└── tailwind.config.js
```

> FitFuel gives general estimates for education only — not medical advice.
