import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { AssessmentFormData } from '../types'

interface QuestionnaireFormProps {
  onSubmit: (values: AssessmentFormData) => void
  loading: boolean
  savedDraft: AssessmentFormData | null
}

const defaultValues: AssessmentFormData = {
  age: 30,
  gender: 'female',
  height_cm: 165,
  weight_kg: 70,
  smoking: 'no',
  alcohol: 'no',
  exercise_frequency: '>=3 times/week',
  water_intake: '1-2L/day',
  salty_food: 'no',
  fast_food: 'no',
  sugary_drinks: 'no',
  fruit_veg: 'Daily',
  diabetes: 'no',
  hypertension: 'no',
  family_history: 'no',
  nsaid_usage: 'no',
  stones_history: 'no',
  swelling: 'no',
  foamy_urine: 'no',
  fatigue: 'no',
  nighttime_urination: 'no',
}

const STORAGE_KEY = 'ckd-assessment-draft'

export function QuestionnaireForm({ onSubmit, loading, savedDraft }: QuestionnaireFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssessmentFormData>({ defaultValues, mode: 'onTouched' })

  useEffect(() => {
    if (savedDraft) {
      reset(savedDraft)
    }
  }, [savedDraft, reset])

  const watched = watch()

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watched))
  }, [watched])

  const progressValue = Math.round(
    (Object.values(watched).filter((value) => value !== '' && value !== undefined).length / Object.keys(defaultValues).length) * 100,
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Section A — Demographics</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Age, gender, height, and weight are used to calculate BMI and demographic risk.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Progress: {progressValue}%
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Age</span>
            <input
              type="number"
              min={1}
              {...register('age', { required: 'Please enter your age', min: { value: 1, message: 'Age must be positive' } })}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            {errors.age && <span className="text-sm text-rose-600">{errors.age.message}</span>}
          </label>

          <fieldset className="space-y-3 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
            <legend className="px-2 text-sm font-medium">Gender</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['female', 'male'] as const).map((value) => (
                <label key={value} className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 text-sm transition hover:border-emerald-500 dark:border-slate-700 dark:hover:border-emerald-400">
                  <input {...register('gender', { required: true })} type="radio" value={value} className="h-4 w-4 text-emerald-600" />
                  <span className="capitalize">{value}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="space-y-2">
            <span className="text-sm font-medium">Height (cm)</span>
            <input
              type="number"
              min={90}
              step={0.1}
              {...register('height_cm', { required: 'Please enter your height', min: { value: 90, message: 'Please enter a valid height' } })}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            {errors.height_cm && <span className="text-sm text-rose-600">{errors.height_cm.message}</span>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Weight (kg)</span>
            <input
              type="number"
              min={30}
              step={0.1}
              {...register('weight_kg', { required: 'Please enter your weight', min: { value: 30, message: 'Please enter a valid weight' } })}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            {errors.weight_kg && <span className="text-sm text-rose-600">{errors.weight_kg.message}</span>}
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950/95">
        <h3 className="text-xl font-semibold">Section B — Lifestyle</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Assess your daily habits and hydration patterns.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <fieldset className="space-y-3 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
            <legend className="px-2 text-sm font-medium">Smoking</legend>
            {(['yes', 'no'] as const).map((value) => (
              <label key={value} className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 text-sm transition hover:border-emerald-500 dark:border-slate-700 dark:hover:border-emerald-400">
                <input {...register('smoking', { required: true })} type="radio" value={value} className="h-4 w-4 text-emerald-600" />
                <span className="capitalize">{value}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="space-y-3 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
            <legend className="px-2 text-sm font-medium">Frequent alcohol consumption</legend>
            {(['yes', 'no'] as const).map((value) => (
              <label key={value} className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 text-sm transition hover:border-emerald-500 dark:border-slate-700 dark:hover:border-emerald-400">
                <input {...register('alcohol', { required: true })} type="radio" value={value} className="h-4 w-4 text-emerald-600" />
                <span className="capitalize">{value}</span>
              </label>
            ))}
          </fieldset>

          <label className="space-y-2">
            <span className="text-sm font-medium">Exercise frequency</span>
            <select
              {...register('exercise_frequency', { required: 'Please select your exercise frequency' })}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option>Rarely/Never</option>
              <option>1-2 times/week</option>
              <option>{'>=3 times/week'}</option>
            </select>
            {errors.exercise_frequency && <span className="text-sm text-rose-600">{errors.exercise_frequency.message}</span>}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Water intake</span>
            <select
              {...register('water_intake', { required: 'Please select your water intake' })}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option>Less than 1L/day</option>
              <option>1-2L/day</option>
              <option>More than 2L/day</option>
            </select>
            {errors.water_intake && <span className="text-sm text-rose-600">{errors.water_intake.message}</span>}
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950/95">
        <h3 className="text-xl font-semibold">Section C — Diet</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Share your eating habits for dietary risk assessment.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {(['salty_food', 'fast_food', 'sugary_drinks'] as const).map((field) => {
            const label = field === 'salty_food' ? 'Frequently eats salty food' : field === 'fast_food' ? 'Frequently eats fast food/processed food' : 'Frequently drinks sugary beverages'
            return (
              <fieldset key={field} className="space-y-3 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <legend className="px-2 text-sm font-medium">{label}</legend>
                {(['yes', 'no'] as const).map((value) => (
                  <label key={value} className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 text-sm transition hover:border-emerald-500 dark:border-slate-700 dark:hover:border-emerald-400">
                    <input {...register(field, { required: true })} type="radio" value={value} className="h-4 w-4 text-emerald-600" />
                    <span className="capitalize">{value}</span>
                  </label>
                ))}
              </fieldset>
            )
          })}

          <label className="space-y-2">
            <span className="text-sm font-medium">Fruit and vegetable intake</span>
            <select
              {...register('fruit_veg', { required: 'Please select fruit and vegetable intake' })}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option>Rarely</option>
              <option>Sometimes</option>
              <option>Daily</option>
            </select>
            {errors.fruit_veg && <span className="text-sm text-rose-600">{errors.fruit_veg.message}</span>}
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950/95">
        <h3 className="text-xl font-semibold">Section D — Medical History</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Record key medical conditions that affect kidney risk.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {(['diabetes', 'hypertension', 'family_history', 'nsaid_usage', 'stones_history'] as const).map((field) => {
            const labels: Record<typeof field, string> = {
              diabetes: 'Diabetes',
              hypertension: 'Hypertension',
              family_history: 'Family history of kidney disease',
              nsaid_usage: 'Long-term NSAID/painkiller usage',
              stones_history: 'Kidney stones or UTI history',
            }
            return (
              <fieldset key={field} className="space-y-3 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <legend className="px-2 text-sm font-medium">{labels[field]}</legend>
                {(['yes', 'no'] as const).map((value) => (
                  <label key={value} className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 text-sm transition hover:border-emerald-500 dark:border-slate-700 dark:hover:border-emerald-400">
                    <input {...register(field, { required: true })} type="radio" value={value} className="h-4 w-4 text-emerald-600" />
                    <span className="capitalize">{value}</span>
                  </label>
                ))}
              </fieldset>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950/95">
        <h3 className="text-xl font-semibold">Section E — Symptoms</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Symptom reports help identify signs of kidney stress.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {(['swelling', 'foamy_urine', 'fatigue', 'nighttime_urination'] as const).map((field) => {
            const labels: Record<typeof field, string> = {
              swelling: 'Swelling in legs/feet/ankles',
              foamy_urine: 'Foamy urine',
              fatigue: 'Fatigue/tiredness',
              nighttime_urination: 'Frequent urination, especially at night',
            }
            return (
              <fieldset key={field} className="space-y-3 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <legend className="px-2 text-sm font-medium">{labels[field]}</legend>
                {(['yes', 'no'] as const).map((value) => (
                  <label key={value} className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 px-4 py-3 text-sm transition hover:border-emerald-500 dark:border-slate-700 dark:hover:border-emerald-400">
                    <input {...register(field, { required: true })} type="radio" value={value} className="h-4 w-4 text-emerald-600" />
                    <span className="capitalize">{value}</span>
                  </label>
                ))}
              </fieldset>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/95 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Ready to submit?</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Your assessment will generate a risk profile and recommendations.</p>
        </div>
        <button
          type="submit"
          disabled={loading || isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? 'Submitting...' : 'Submit assessment'}
        </button>
      </div>
    </form>
  )
}
