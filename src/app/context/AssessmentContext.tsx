import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { savePatientRecord } from '../utils/mockData';
import * as api from '../services/api';
import { toast } from 'sonner';

export interface AssessmentData {
  // Step 1 — Demographics
  ageGroup?: 'below30' | '30to45' | '46to60' | 'above60';
  gender?:   'Male' | 'Female' | 'Unknown';
  height?:   number;
  weight?:   number;
  bmi?:      number;

  // Step 2 — Lifestyle
  smoking?:  boolean;
  alcohol?:  boolean;
  exercise?: 'rarely' | 'sometimes' | 'frequent';
  water?:    'low' | 'medium' | 'high';

  // Step 3 — Dietary
  saltyFoods?:   boolean;
  fastFood?:     boolean;
  sugaryDrinks?: boolean;
  fruits?:       'rarely' | 'sometimes' | 'daily';

  // Step 4 — Medical History & Symptoms
  diabetes?:          boolean;
  hypertension?:      boolean;
  familyHistory?:     boolean;
  painkillers?:       boolean;
  kidneyIssues?:      boolean;
  swelling?:          boolean;
  foamyUrine?:        boolean;
  fatigue?:           boolean;
  frequentUrination?: boolean;

  // Aliases for PatientDetailModal compatibility
  hasDiabetes?: boolean;
  hasHighBP?:   boolean;
  age?:         number;
}

export interface AssessmentResult {
  id?:             string;
  userId?:         string;
  riskLevel:       'low' | 'moderate' | 'high';
  riskPercentage:  number;
  explanation:     string;
  recommendations: string[];
  date:            string;
  bmi?:            number;
}

interface AssessmentContextType {
  assessmentData:       AssessmentData;
  updateAssessmentData: (data: Partial<AssessmentData>) => void;
  latestResult:         AssessmentResult | null;
  setLatestResult:      (result: AssessmentResult) => void;
  calculateRisk:        (data: AssessmentData) => AssessmentResult;
  allResults:           AssessmentResult[];
  saveResult:           (result: AssessmentResult) => Promise<void>;
  fetchUserResults:     (userId: string) => Promise<void>;
  clearResults:         () => void;
  isLoading:            boolean;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({});
  const [latestResult, setLatestResult]     = useState<AssessmentResult | null>(null);
  const [allResults, setAllResults]         = useState<AssessmentResult[]>([]);
  const [isLoading, setIsLoading]           = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserAssessmentsFromStorage(user.id);
    } else {
      setAllResults([]);
    }
  }, [user?.id]);

  const loadUserAssessmentsFromStorage = (userId: string) => {
    try {
      const stored = localStorage.getItem(`assessmentResults_${userId}`);
      if (stored) {
        const results = JSON.parse(stored);
        setAllResults(Array.isArray(results) ? results : []);
      } else {
        setAllResults([]);
      }
    } catch {
      setAllResults([]);
    }
  };

  const persistResultsToStorage = (userId: string, results: AssessmentResult[]) => {
    try {
      localStorage.setItem(`assessmentResults_${userId}`, JSON.stringify(results));
    } catch (error) {
      console.error('Failed to save assessments to storage:', error);
    }
  };

  const updateAssessmentData = (data: Partial<AssessmentData>) => {
    setAssessmentData(prev => ({ ...prev, ...data }));
  };

  const calculateRisk = (data: AssessmentData): AssessmentResult => {
    let riskScore = 0;
    let bmi: number | undefined;

    // ── BMI = weight(kg) / height(m)² ───────────────────────────────────────
    // Example: 70kg, 170cm → 70 / (1.70 × 1.70) = 70 / 2.89 = 24.2
    if (data.height && data.weight && data.height > 0 && data.weight > 0) {
      const heightInMeters = data.height / 100;           // cm → m
      const heightSquared  = heightInMeters * heightInMeters; // m²
      bmi = parseFloat((data.weight / heightSquared).toFixed(1));

      // WHO BMI categories
      if      (bmi >= 30) riskScore += 12; // Obese
      else if (bmi >= 25) riskScore += 7;  // Overweight
      else if (bmi >= 18.5) riskScore += 0; // Normal
      else                  riskScore += 5; // Underweight
    }

    // ── Step 1 — Demographics ────────────────────────────────────────────────
    if      (data.ageGroup === 'above60') riskScore += 24;
    else if (data.ageGroup === '46to60')  riskScore += 16;
    else if (data.ageGroup === '30to45')  riskScore += 8;
    if (data.gender === 'Male') riskScore += 2;

    // ── Step 2 — Lifestyle ───────────────────────────────────────────────────
    if (data.smoking)                        riskScore += 11;
    if (data.alcohol)                        riskScore += 6;
    if      (data.exercise === 'rarely')     riskScore += 8;
    else if (data.exercise === 'sometimes')  riskScore += 4;
    if      (data.water === 'low')           riskScore += 8;
    else if (data.water === 'medium')        riskScore += 3;

    // ── Step 3 — Dietary ─────────────────────────────────────────────────────
    if (data.saltyFoods)                    riskScore += 7;
    if (data.fastFood)                      riskScore += 6;
    if (data.sugaryDrinks)                  riskScore += 5;
    if      (data.fruits === 'rarely')      riskScore += 6;
    else if (data.fruits === 'sometimes')   riskScore += 3;

    // ── Step 4 — Medical History & Symptoms ─────────────────────────────────
    if (data.diabetes)          riskScore += 22;
    if (data.hypertension)      riskScore += 18;
    if (data.familyHistory)     riskScore += 10;
    if (data.painkillers)       riskScore += 6;
    if (data.kidneyIssues)      riskScore += 10;
    if (data.swelling)          riskScore += 8;
    if (data.foamyUrine)        riskScore += 7;
    if (data.fatigue)           riskScore += 5;
    if (data.frequentUrination) riskScore += 5;

    if (riskScore > 100) riskScore = 100;

    const riskLevel: 'low' | 'moderate' | 'high' =
      riskScore < 30 ? 'low' : riskScore < 60 ? 'moderate' : 'high';

    let explanation: string;
    let recommendations: string[];

    if (riskLevel === 'low') {
      explanation = 'Your current health indicators suggest a low risk for Chronic Kidney Disease. Keep maintaining healthy habits and monitor your kidney function regularly.';
      recommendations = [
        'Maintain a balanced diet with limited salt and processed foods',
        'Stay hydrated by drinking adequate water daily',
        'Exercise regularly (at least 30 minutes, 5 days a week)',
        'Get annual health check-ups to monitor kidney function',
        'Avoid excessive use of NSAIDs (pain medications)',
      ];
    } else if (riskLevel === 'moderate') {
      explanation = 'Your assessment indicates a moderate risk for CKD. You should take steps to control blood pressure, blood sugar, and kidney stress factors.';
      recommendations = [
        'Schedule a consultation with your doctor within the next month',
        'Get kidney function tests such as GFR and creatinine',
        'Monitor and control blood pressure and blood sugar levels',
        'Follow a kidney-friendly diet (low sodium, limited protein)',
        'Maintain a healthy weight through diet and exercise',
        'Avoid smoking and limit alcohol consumption',
      ];
    } else {
      explanation = 'Your assessment indicates a high risk for getting Chronic Kidney Disease. Please consult a healthcare professional for evaluation and lab tests.';
      recommendations = [
        'URGENT: Schedule an appointment with a nephrologist immediately',
        'Get comprehensive kidney function tests as soon as possible',
        'Monitor blood pressure and blood sugar levels daily',
        'Follow strict dietary guidelines for kidney health',
        'Avoid nephrotoxic medications unless prescribed',
        'Bring your assessment results to your doctor appointment',
      ];
    }

    // ── Write BMI back into assessmentData so saveResult includes it ─────────
    if (bmi !== undefined) {
      setAssessmentData(prev => ({ ...prev, bmi }));
    }

    return {
      riskLevel,
      riskPercentage: riskScore,
      explanation,
      recommendations,
      date:   new Date().toISOString(),
      bmi,
      userId: user?.id,
    };
  };

  const fetchUserResults = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await api.getPatientAssessments(parseInt(userId));
      if (response && Array.isArray(response)) {
        const formattedResults: AssessmentResult[] = response.map((item: any) => ({
          id:              item.id?.toString(),
          userId:          item.patient_id?.toString() || userId,
          riskLevel:       item.assessment_result?.riskLevel       || 'low',
          riskPercentage:  item.assessment_result?.riskPercentage  || 0,
          explanation:     item.assessment_result?.explanation     || '',
          recommendations: item.assessment_result?.recommendations || [],
          date:            item.created_at || item.assessment_result?.date || new Date().toISOString(),
          bmi:             item.assessment_data?.bmi,
        }));
        setAllResults(formattedResults);
        persistResultsToStorage(userId, formattedResults);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Failed to fetch assessments from API:', error);
    }
    loadUserAssessmentsFromStorage(userId);
    setIsLoading(false);
  };

  const saveResult = async (result: AssessmentResult) => {
    // BMI is in assessmentData because calculateRisk wrote it back
    const dataToSave: AssessmentData = {
      ...assessmentData,
      bmi:         result.bmi,
      hasDiabetes: assessmentData.diabetes,
      hasHighBP:   assessmentData.hypertension,
    };

    const resultPayload = {
      riskLevel:       result.riskLevel,
      riskPercentage:  result.riskPercentage,
      explanation:     result.explanation,
      recommendations: result.recommendations,
      date:            result.date,
      bmi:             result.bmi,
    };

    // ── Guest (not logged in): save to DB with no patient_id ────────────────
    if (!user?.id) {
      try {
        await api.createAssessment(
          dataToSave as any,
          resultPayload as any,
          undefined,          // patientId omitted → backend stores patient_id = NULL
          'Guest User',       // guestName
          undefined,          // guestEmail
        );
      } catch (error) {
        console.error('Failed to save guest assessment:', error);
      }
      return;
    }

    // ── Logged-in user: existing behaviour ──────────────────────────────────
    const resultWithUserId: AssessmentResult = {
      ...result,
      userId: user.id,
      id:     result.id || `${user.id}_${Date.now()}`,
    };

    const updatedResults = [resultWithUserId, ...allResults];
    setAllResults(updatedResults);
    persistResultsToStorage(user.id, updatedResults);

    try {
      const response = await api.createAssessment(
        dataToSave as any,
        resultPayload as any,
        parseInt(user.id),  // patientId
        user.name,          // guestName (backend overwrites with patient.name anyway)
        user.email,         // guestEmail
      );

      if (response?.status === 'success') {
        toast.success('Assessment saved successfully');
        await fetchUserResults(user.id);
      } else {
        throw new Error('Server rejected assessment');
      }
    } catch (error) {
      console.error('Failed to save assessment to API:', error);
      toast.warning('Assessment saved locally only');

      savePatientRecord({
        id:     resultWithUserId.id || `guest_${Date.now()}`,
        userId: user.id,
        credentials: {
          name:             user.name  || 'Unknown',
          email:            user.email || 'unknown@email.com',
          phone:            '',
          address:          '',
          dateOfBirth:      '',
          emergencyContact: '',
        },
        assessmentData:   dataToSave,
        assessmentResult: resultWithUserId,
        isUrgent:         resultWithUserId.riskLevel === 'high',
        createdAt:        resultWithUserId.date,
        updatedAt:        resultWithUserId.date,
      });
    }
  };
  
  const clearResults = () => {
    setAllResults([]);
    if (user?.id) {
      localStorage.removeItem(`assessmentResults_${user.id}`);
    }
  };

  return (
    <AssessmentContext.Provider value={{
      assessmentData,
      updateAssessmentData,
      latestResult,
      setLatestResult,
      calculateRisk,
      allResults,
      saveResult,
      fetchUserResults,
      clearResults,
      isLoading,
    }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}