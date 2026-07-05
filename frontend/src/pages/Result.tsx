import { Link, useLocation } from 'react-router-dom'
import { ResultCard } from '../components/ResultCard'
import type { RiskResult } from '../types'

export function Result() {
  const location = useLocation()
  const result = (location.state as RiskResult | null) ||
    (() => {
      const raw = window.localStorage.getItem('ckd-assessment-result')
      if (!raw) return null
      try {
        return JSON.parse(raw) as RiskResult
      } catch {
        return null
      }
    })()

  if (!result) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-slate-900 dark:text-slate-100">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900/80">
          <h2 className="text-3xl font-semibold">No result available yet</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Please complete the CKD questionnaire to generate a personalized risk report.</p>
          <Link
            to="/assessment"
            className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Start assessment
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-slate-900 dark:text-slate-100">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-300">Assessment result</p>
          <h2 className="mt-4 text-3xl font-semibold">Your CKD risk dashboard</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Review your BMI, total score, risk classification, and medical recommendations.</p>
        </div>
      </div>
      <ResultCard result={result} />
    </main>
  )
}
