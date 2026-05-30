import { Flame } from 'lucide-react'

// Simple site footer with a friendly disclaimer.
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 py-8 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
          <Flame size={16} className="text-brand-500" />
          Fit<span className="text-brand-500">Fuel</span>
        </div>
        <p className="max-w-md">
          FitFuel provides general estimates for education only. It is not medical advice.
          Consult a doctor or dietitian before making big changes.
        </p>
        <p>&copy; {new Date().getFullYear()} FitFuel. Built for beginners. By Varun.</p>
      </div>
    </footer>
  )
}
