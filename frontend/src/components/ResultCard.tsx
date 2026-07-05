import type { RiskResult } from '../types'

interface ResultCardProps {
  result: RiskResult
}

const badgeStyles: Record<string, string> = {
  'Low Risk': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-200',
  'Moderate Risk': 'bg-amber-100 text-amber-700 dark:bg-amber-900/70 dark:text-amber-200',
  'High Risk': 'bg-orange-100 text-orange-700 dark:bg-orange-900/70 dark:text-orange-200',
  'Very High Risk': 'bg-rose-100 text-rose-700 dark:bg-rose-900/70 dark:text-rose-200',
}

export function ResultCard({ result }: ResultCardProps) {
  const riskColor = badgeStyles[result.risk_level] ?? badgeStyles['Low Risk']

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${riskColor}`}>
              {result.risk_level}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Score {result.total_score}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">BMI</p>
              <p className="mt-3 text-3xl font-semibold">{result.bmi}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Risk level</p>
              <p className="mt-3 text-3xl font-semibold">{result.risk_level}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Advice</p>
              <p className="mt-3 text-3xl font-semibold">{result.recommendation.split('.')[0]}</p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-100 p-6 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <h3 className="text-lg font-semibold">How to interpret your score</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              A higher total score means a stronger rule-based indication of chronic kidney disease risk. Use this as a screening tool and follow medical advice for any concerning results.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950/95">
          <h3 className="text-xl font-semibold">Contributing factors</h3>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {result.contributing_factors.map((factor) => (
              <li key={factor} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                • {factor}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-emerald-50/80 p-8 shadow-soft dark:border-slate-800 dark:bg-emerald-900/20">
          <h3 className="text-xl font-semibold">Recommendation</h3>
          <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-200">
            {result.recommendation}
          </p>
        </div>
      </div>
    </div>
  )
}
