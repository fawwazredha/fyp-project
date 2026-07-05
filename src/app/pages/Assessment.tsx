import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, HeartPulse } from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import { toast } from 'sonner';
import * as Progress from '@radix-ui/react-progress';

const steps = [
  { id: 1, title: 'Demographic Information' },
  { id: 2, title: 'Lifestyle Factors' },
  { id: 3, title: 'Dietary Habits' },
  { id: 4, title: 'Medical History & Symptoms' },
];

export function Assessment() {
  const [currentStep, setCurrentStep] = useState(1);

  const {
    assessmentData,
    updateAssessmentData,
    calculateRisk,
    setLatestResult,
    saveResult,
  } = useAssessment();

  const navigate  = useNavigate();
  const progress  = (currentStep / steps.length) * 100;

  // ── Per-step completeness check ───────────────────────────────────────────
  // Yes/No answers use `!== undefined` because a valid "No" is `false`,
  // which would be wrongly rejected by a truthy check.
  const isStepComplete = (step: number): boolean => {
    const d = assessmentData;
    switch (step) {
      case 1:
        return !!d.ageGroup
            && !!d.gender
            && d.height !== undefined && d.height >= 100 && d.height <= 250
            && d.weight !== undefined && d.weight >= 20  && d.weight <= 300;
      case 2:
        return d.smoking !== undefined
            && d.alcohol !== undefined
            && !!d.exercise
            && !!d.water;
      case 3:
        return d.saltyFoods !== undefined
            && d.fastFood !== undefined
            && d.sugaryDrinks !== undefined
            && !!d.fruits;
      case 4:
        return d.diabetes !== undefined
            && d.hypertension !== undefined
            && d.familyHistory !== undefined
            && d.painkillers !== undefined
            && d.kidneyIssues !== undefined
            && d.swelling !== undefined
            && d.foamyUrine !== undefined
            && d.fatigue !== undefined
            && d.frequentUrination !== undefined;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!isStepComplete(currentStep)) {
      toast.error('Please answer all questions before continuing.');
      return;
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      const result = calculateRisk(assessmentData);
      setLatestResult(result);
      saveResult(result);
      navigate('/assessment/result');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 lg:py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-[#3A86FF]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CKD Risk Assessment</h1>
              <p className="text-gray-600 mt-1">
                Complete this questionnaire to estimate your Chronic Kidney Disease risk level
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`text-xs sm:text-sm ${
                    step.id <= currentStep ? 'text-[#3A86FF] font-semibold' : 'text-gray-400'
                  }`}
                >
                  Step {step.id}
                </div>
              ))}
            </div>
            <Progress.Root
              value={progress}
              className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
            >
              <Progress.Indicator
                className="h-full bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </Progress.Root>
            <p className="text-sm text-gray-500 mt-2">{steps[currentStep - 1].title}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          {currentStep === 1 && <Step1 data={assessmentData} updateData={updateAssessmentData} />}
          {currentStep === 2 && <Step2 data={assessmentData} updateData={updateAssessmentData} />}
          {currentStep === 3 && <Step3 data={assessmentData} updateData={updateAssessmentData} />}
          {currentStep === 4 && <Step4 data={assessmentData} updateData={updateAssessmentData} />}

          {/* Helper text when step incomplete */}
          {!isStepComplete(currentStep) && (
            <p className="mt-6 text-sm text-gray-400 text-center">
              Please answer all questions in this step to continue.
            </p>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-4 pt-5 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!isStepComplete(currentStep)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3A86FF] text-white hover:bg-[#2E6FD9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === steps.length ? 'Get Results' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({ data, updateData }: any) {

  // Live BMI preview — weight(kg) / height(m)²
  const computedBMI = (() => {
    if (data.height && data.weight && data.height > 0 && data.weight > 0) {
      const hm  = data.height / 100;
      const bmi = data.weight / (hm * hm);
      return parseFloat(bmi.toFixed(1));
    }
    return null;
  })();

  const bmiCategory = (() => {
    if (computedBMI === null) return null;
    if (computedBMI < 18.5) return { label: 'Underweight', color: 'text-blue-600'   };
    if (computedBMI < 25)   return { label: 'Normal',      color: 'text-green-600'  };
    if (computedBMI < 30)   return { label: 'Overweight',  color: 'text-yellow-600' };
    return                         { label: 'Obese',        color: 'text-red-600'    };
  })();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Demographic Information</h2>

      {/* Age Group */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What is your age?</label>
        <select
          value={data.ageGroup || ''}
          onChange={(e) => updateData({ ageGroup: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3A86FF]"
        >
          <option value="">Select age range</option>
          <option value="below30">Below 30</option>
          <option value="30to45">30–45</option>
          <option value="46to60">46–60</option>
          <option value="above60">Above 60</option>
        </select>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
        <div className="grid grid-cols-2 gap-4">
          {['Male', 'Female'].map((gender) => (
            <button
              key={gender}
              onClick={() => updateData({ gender })}
              className={`p-4 rounded-xl border-2 transition-all ${
                data.gender === gender
                  ? 'border-[#3A86FF] bg-blue-50 text-[#3A86FF]'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      {/* Height + Weight side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
          <input
            type="number"
            value={data.height || ''}
            onChange={(e) => updateData({ height: parseFloat(e.target.value) || undefined })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3A86FF]"
            placeholder="e.g. 170"
            min={100}
            max={250}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
          <input
            type="number"
            value={data.weight || ''}
            onChange={(e) => updateData({ weight: parseFloat(e.target.value) || undefined })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3A86FF]"
            placeholder="e.g. 70"
            min={20}
            max={300}
          />
        </div>
      </div>

      {/* Live BMI display */}
      {computedBMI !== null && bmiCategory !== null ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-600 mb-1">
            Calculated BMI
            <span className="text-xs text-gray-400 ml-2">
              = {data.weight} kg ÷ ({(data.height / 100).toFixed(2)} m)² 
            </span>
          </p>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-gray-900">{computedBMI}</span>
            <div>
              <span className={`text-lg font-semibold ${bmiCategory.color}`}>
                {bmiCategory.label}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                {computedBMI < 18.5
                  ? 'Below 18.5'
                  : computedBMI < 25
                  ? '18.5 – 24.9'
                  : computedBMI < 30
                  ? '25 – 29.9'
                  : '30 and above'}
              </p>
            </div>
          </div>
          {/* BMI scale bar */}
          <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500 relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-800 rounded-full shadow"
              style={{
                left: `${Math.min(Math.max(((computedBMI - 15) / 25) * 100, 0), 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>40</span>
          </div>
        </div>
      ) : (
        data.height || data.weight ? (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center text-sm text-gray-400">
            Enter both height and weight to see your BMI
          </div>
        ) : null
      )}
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({ data, updateData }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Lifestyle Factors</h2>

      <Question question="Do you smoke?"                      field="smoking" data={data} updateData={updateData} />
      <Question question="Do you consume alcohol frequently?" field="alcohol" data={data} updateData={updateData} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">How often do you exercise?</label>
        <select
          value={data.exercise || ''}
          onChange={(e) => updateData({ exercise: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
        >
          <option value="">Select</option>
          <option value="rarely">Rarely/Never</option>
          <option value="sometimes">1–2 times/week</option>
          <option value="frequent">3 or more times/week</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">How much water do you drink daily?</label>
        <select
          value={data.water || ''}
          onChange={(e) => updateData({ water: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
        >
          <option value="">Select</option>
          <option value="low">Less than 1 liter</option>
          <option value="medium">1–2 liters</option>
          <option value="high">More than 2 liters</option>
        </select>
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
function Step3({ data, updateData }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Dietary Habits</h2>

      <Question question="Do you frequently eat salty foods?"                     field="saltyFoods"   data={data} updateData={updateData} />
      <Question question="Do you frequently consume fast food or processed food?" field="fastFood"     data={data} updateData={updateData} />
      <Question question="Do you frequently drink sugary beverages?"              field="sugaryDrinks" data={data} updateData={updateData} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">How often do you eat fruits and vegetables?</label>
        <select
          value={data.fruits || ''}
          onChange={(e) => updateData({ fruits: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
        >
          <option value="">Select</option>
          <option value="rarely">Rarely</option>
          <option value="sometimes">Sometimes</option>
          <option value="daily">Daily</option>
        </select>
      </div>
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────
function Step4({ data, updateData }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Medical History & Symptoms</h2>

      <Question question="Have you ever been diagnosed with diabetes?"                     field="diabetes"          data={data} updateData={updateData} />
      <Question question="Have you ever been diagnosed with hypertension?"                 field="hypertension"      data={data} updateData={updateData} />
      <Question question="Do you have a family history of kidney disease?"                 field="familyHistory"     data={data} updateData={updateData} />
      <Question question="Do you frequently use painkillers (NSAIDs)?"                     field="painkillers"       data={data} updateData={updateData} />
      <Question question="Have you ever had kidney stones or urinary tract infections?"    field="kidneyIssues"      data={data} updateData={updateData} />
      <Question question="Do you experience swelling in your legs, feet, or ankles?"      field="swelling"          data={data} updateData={updateData} />
      <Question question="Do you notice foamy urine?"                                      field="foamyUrine"        data={data} updateData={updateData} />
      <Question question="Do you often feel fatigued or tired?"                            field="fatigue"           data={data} updateData={updateData} />
      <Question question="Do you urinate more frequently than usual, especially at night?" field="frequentUrination" data={data} updateData={updateData} />
    </div>
  );
}

// ─── Reusable Yes/No Question ─────────────────────────────────────────────────
function Question({ question, field, data, updateData }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">{question}</label>
      <div className="grid grid-cols-2 gap-4">
        {[{ value: true, label: 'Yes' }, { value: false, label: 'No' }].map((option) => (
          <button
            key={option.label}
            onClick={() => updateData({ [field]: option.value })}
            className={`p-4 rounded-xl border-2 transition-all ${
              data[field] === option.value
                ? 'border-[#3A86FF] bg-blue-50 text-[#3A86FF]'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}