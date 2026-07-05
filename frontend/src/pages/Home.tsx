import { Link } from 'react-router-dom'

export function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-slate-900 dark:text-slate-100">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
            CKD Early Risk Assessment
          </p>
          <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">
            Rule-based Chronic Kidney Disease risk screening
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
            Complete a simple questionnaire and receive an instant CKD risk score, BMI evaluation, key risk factors, and tailored recommendations — no machine learning required.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/assessment"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Start assessment
            </Link>
            <Link
              to="/result"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              View latest result
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-700 p-8 text-slate-50 shadow-soft">
          <div className="space-y-6">
            <div className="rounded-3xl bg-slate-950/80 p-6 shadow-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Assessment highlights</p>
              <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-200">
                <li>• Rule-based scoring for demographics, lifestyle, diet, medical history, and symptoms.</li>
                <li>• Instant BI and risk classification in a clean dashboard.</li>
                <li>• Personalized guidance for low, moderate, high, or very high risk.</li>
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Health tool</p>
                <p className="mt-3 text-3xl font-semibold">CKD Screener</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Risk zones</p>
                <p className="mt-3 text-3xl font-semibold">Low to Very High</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
