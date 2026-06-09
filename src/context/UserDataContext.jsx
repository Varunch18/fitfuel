import { createContext, useContext, useEffect, useState } from 'react'

const UserDataContext = createContext()

const STORAGE_KEY = 'fitfuel-user-data'

// Default form values shown when no saved data exists.
export const DEFAULT_DATA = {
  name: '',
  age: '',
  gender: 'male',
  height: '',
  weight: '',
  targetWeight: '', // optional goal weight for the week-by-week plan

  // Activity-scoring inputs (replace the old single "activity" multiplier).
  occupation: 'sedentary', // 'sedentary' | 'light' | 'moderate' | 'heavy'
  gymSessions: '', // resistance sessions per week
  cardioSessions: '', // cardio sessions per week
  dailySteps: '', // average steps per day

  // Optional body-composition inputs.
  bodyFat: '', // measured body fat % (optional)
  waist: '', // waist circumference in cm (optional)

  goal: 'maintain',
  diet: 'veg', // food recommendation preference: 'veg' | 'nonveg' | 'mix'
}

// Read previously saved user data from localStorage (if any).
function loadData() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    // Merge over defaults so records saved by older versions gain any new
    // fields (e.g. activity-scoring / body-composition inputs).
    return { ...DEFAULT_DATA, ...JSON.parse(raw) }
  } catch {
    return null
  }
}

/**
 * Stores the user's input data and persists it to localStorage so results
 * survive page reloads. `saveData` overwrites, `clearData` resets everything.
 */
export function UserDataProvider({ children }) {
  const [userData, setUserData] = useState(() => loadData())

  useEffect(() => {
    if (userData) localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  }, [userData])

  const saveData = (data) => setUserData(data)

  const clearData = () => {
    setUserData(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <UserDataContext.Provider value={{ userData, saveData, clearData }}>
      {children}
    </UserDataContext.Provider>
  )
}

// Convenience hook to consume the user data context.
export function useUserData() {
  const ctx = useContext(UserDataContext)
  if (!ctx) throw new Error('useUserData must be used within a UserDataProvider')
  return ctx
}
