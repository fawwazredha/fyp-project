import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { QuestionnaireForm } from '../components/QuestionnaireForm'
import { submitAssessment } from '../services/api'
import type { AssessmentFormData, RiskResult } from '../types'

const STORAGE_KEY = 'ckd-assessment-draft'

export function Assessment() {
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState<AssessmentFormData | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setDraft(JSON.parse(raw) as AssessmentFormData)
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const handleSubmit = async (values: AssessmentFormData) => {
    setLoading(true)
    try {
      const result = await submitAssessment(values)
      window.localStorage.setItem('ckd-assessment-result', JSON.stringify(result))
      window.localStorage.removeItem(STORAGE_KEY)
      toast.success('Assessment completed successfully')
      navigate('/result', { state: result })
    } catch (error) {
      toast.error('Unable to submit assessment. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-slate-900 dark:text-slate-100">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-300">CKD Questionnaire</p>
          <h2 className="mt-4 text-3xl font-semibold">Complete the questionnaire</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Answer each section to calculate your CKD risk score, BMI, and contributing risk factors.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sections</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">Demographics, Lifestyle, Diet, Medical history, Symptoms.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-950">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Autosave</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">Your answers are saved locally while you complete the assessment.</p>
          </div>
        </div>
      </div>

      <QuestionnaireForm onSubmit={handleSubmit} loading={loading} savedDraft={draft} />
    </main>
  )
}
