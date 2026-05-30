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
