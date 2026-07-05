import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Home } from './pages/Home'
import { Assessment } from './pages/Assessment'
import { Result } from './pages/Result'

function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('ckd-dark-mode')
    const initial = stored ? stored === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(initial)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    window.localStorage.setItem('ckd-dark-mode', String(darkMode))
  }, [darkMode])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <div>
              <NavLink to="/" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                CKD Risk Assessment
              </NavLink>
              <p className="text-sm text-slate-500 dark:text-slate-400">Rule-based questionnaire system</p>
            </div>
            <div className="flex items-center gap-3">
              <NavLink
                to="/"
                className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}
              >
                Home
              </NavLink>
              <NavLink
                to="/assessment"
                className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'}`}
              >
                Assessment
              </NavLink>
              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {darkMode ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/result" element={<Result />} />
          <Route
            path="*"
            element={
              <main className="mx-auto max-w-4xl px-6 py-16 text-slate-900 dark:text-slate-100">
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-soft dark:border-slate-800 dark:bg-slate-900/80">
                  <h2 className="text-3xl font-semibold">Page not found</h2>
                  <p className="mt-4 text-slate-600 dark:text-slate-400">The page you requested does not exist.</p>
                  <NavLink to="/" className="mt-8 inline-flex rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500">
                    Back to home
                  </NavLink>
                </div>
              </main>
            }
          />
        </Routes>

        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  )
}

export default App
