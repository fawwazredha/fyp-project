import { AssessmentData, AssessmentResult } from '../context/AssessmentContext';

export interface PatientCredentials {
  name: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
}

export interface PatientRecord {
  id: string;
  userId: string;
  credentials: PatientCredentials;
  assessmentData: AssessmentData;
  assessmentResult: AssessmentResult;
  isUrgent: boolean;
  flaggedByDoctor?: string;
  urgentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequest {
  id: string;
  type: 'patient_booking' | 'doctor_request';
  requestedBy: string; // userId or doctorId
  status: 'pending' | 'confirmed' | 'cancelled';
  priority: 'normal' | 'urgent';
  createdAt: string;
}

// Initialize mock patient data
export function initializeMockData() {
  const mockPatients: PatientRecord[] = [
    {
      id: 'pat_001',
      userId: 'user_001',
      credentials: {
        name: 'John Anderson',
        email: 'john.anderson@email.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, Boston, MA 02101',
        dateOfBirth: '1965-03-15',
        emergencyContact: '+1 (555) 987-6543'
      },
      assessmentData: {
        age: 59,
        gender: 'Male',
        bmi: 28.5,
        hasDiabetes: true,
        hasHighBP: true,
        systolicBP: 145,
        diastolicBP: 92,
        creatinine: 1.6,
        glucose: 145,
        familyHistory: true,
        smoking: false
      },
      assessmentResult: {
        riskLevel: 'high',
        riskPercentage: 78,
        explanation: 'Your assessment indicates a high risk for Chronic Kidney Disease. It is important that you consult with a healthcare professional as soon as possible for proper evaluation and guidance.',
        recommendations: [
          'URGENT: Schedule an appointment with a nephrologist (kidney specialist) immediately',
          'Get comprehensive kidney function tests as soon as possible',
          'Monitor blood pressure and blood sugar levels daily'
        ],
        date: '2026-04-10T10:30:00.000Z'
      },
      isUrgent: true,
      flaggedByDoctor: 'Dr. Sarah Johnson',
      urgentNotes: 'Patient shows multiple high-risk indicators. Requires immediate specialist consultation.',
      createdAt: '2026-04-10T10:30:00.000Z',
      updatedAt: '2026-04-12T14:20:00.000Z'
    },
    {
      id: 'pat_002',
      userId: 'user_002',
      credentials: {
        name: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '+1 (555) 234-5678',
        address: '456 Oak Ave, Cambridge, MA 02138',
        dateOfBirth: '1978-07-22',
        emergencyContact: '+1 (555) 876-5432'
      },
      assessmentData: {
        age: 47,
        gender: 'Female',
        bmi: 26.2,
        hasDiabetes: false,
        hasHighBP: true,
        systolicBP: 138,
        diastolicBP: 88,
        creatinine: 1.1,
        glucose: 95,
        familyHistory: false,
        smoking: false
      },
      assessmentResult: {
        riskLevel: 'moderate',
        riskPercentage: 42,
        explanation: 'Your assessment indicates a moderate risk for developing Chronic Kidney Disease. This means you should take preventive measures and monitor your health more closely.',
        recommendations: [
          'Schedule a consultation with your doctor within the next month',
          'Get comprehensive kidney function tests',
          'Monitor and control blood pressure levels'
        ],
        date: '2026-04-11T14:15:00.000Z'
      },
      isUrgent: false,
      createdAt: '2026-04-11T14:15:00.000Z',
      updatedAt: '2026-04-11T14:15:00.000Z'
    },
    {
      id: 'pat_003',
      userId: 'user_003',
      credentials: {
        name: 'Robert Chen',
        email: 'robert.chen@email.com',
        phone: '+1 (555) 345-6789',
        address: '789 Elm St, Somerville, MA 02144',
        dateOfBirth: '1990-11-08',
        emergencyContact: '+1 (555) 765-4321'
      },
      assessmentData: {
        age: 35,
        gender: 'Male',
        bmi: 23.1,
        hasDiabetes: false,
        hasHighBP: false,
        systolicBP: 118,
        diastolicBP: 76,
        creatinine: 0.9,
        glucose: 88,
        familyHistory: false,
        smoking: false
      },
      assessmentResult: {
        riskLevel: 'low',
        riskPercentage: 15,
        explanation: 'Your current health indicators suggest a low risk for Chronic Kidney Disease. This is good news! However, maintaining a healthy lifestyle is important for prevention.',
        recommendations: [
          'Maintain a balanced diet with limited salt and processed foods',
          'Stay hydrated by drinking adequate water daily',
          'Exercise regularly (at least 30 minutes, 5 days a week)'
        ],
        date: '2026-04-12T09:45:00.000Z'
      },
      isUrgent: false,
      createdAt: '2026-04-12T09:45:00.000Z',
      updatedAt: '2026-04-12T09:45:00.000Z'
    },
    {
      id: 'pat_004',
      userId: 'user_004',
      credentials: {
        name: 'Sarah Williams',
        email: 'sarah.williams@email.com',
        phone: '+1 (555) 456-7890',
        address: '321 Pine Rd, Brookline, MA 02445',
        dateOfBirth: '1955-05-30',
        emergencyContact: '+1 (555) 654-3210'
      },
      assessmentData: {
        age: 70,
        gender: 'Female',
        bmi: 31.5,
        hasDiabetes: true,
        hasHighBP: true,
        systolicBP: 152,
        diastolicBP: 95,
        creatinine: 1.8,
        glucose: 160,
        familyHistory: true,
        smoking: true
      },
      assessmentResult: {
        riskLevel: 'high',
        riskPercentage: 92,
        explanation: 'Your assessment indicates a high risk for Chronic Kidney Disease. It is important that you consult with a healthcare professional as soon as possible for proper evaluation and guidance.',
        recommendations: [
          'URGENT: Schedule an appointment with a nephrologist (kidney specialist) immediately',
          'Get comprehensive kidney function tests as soon as possible',
          'Bring your assessment results to your doctor appointment',
          'Monitor blood pressure and blood sugar levels daily'
        ],
        date: '2026-04-13T11:00:00.000Z'
      },
      isUrgent: true,
      flaggedByDoctor: 'Dr. Michael Chen',
      urgentNotes: 'Critical case - multiple severe risk factors including age, diabetes, high BP, elevated creatinine. Smoking cessation counseling needed urgently.',
      createdAt: '2026-04-13T11:00:00.000Z',
      updatedAt: '2026-04-14T08:30:00.000Z'
    },
    {
      id: 'pat_005',
      userId: 'user_005',
      credentials: {
        name: 'James Rodriguez',
        email: 'james.rodriguez@email.com',
        phone: '+1 (555) 567-8901',
        address: '654 Maple Dr, Newton, MA 02458',
        dateOfBirth: '1982-09-12',
        emergencyContact: '+1 (555) 543-2109'
      },
      assessmentData: {
        age: 43,
        gender: 'Male',
        bmi: 27.8,
        hasDiabetes: true,
        hasHighBP: false,
        systolicBP: 128,
        diastolicBP: 82,
        creatinine: 1.3,
        glucose: 135,
        familyHistory: false,
        smoking: false
      },
      assessmentResult: {
        riskLevel: 'moderate',
        riskPercentage: 48,
        explanation: 'Your assessment indicates a moderate risk for developing Chronic Kidney Disease. This means you should take preventive measures and monitor your health more closely.',
        recommendations: [
          'Schedule a consultation with your doctor within the next month',
          'Get comprehensive kidney function tests (GFR, creatinine, urine analysis)',
          'Monitor blood sugar levels closely',
          'Follow a kidney-friendly diet (low sodium, limited protein)'
        ],
        date: '2026-04-14T15:30:00.000Z'
      },
      isUrgent: false,
      createdAt: '2026-04-14T15:30:00.000Z',
      updatedAt: '2026-04-14T15:30:00.000Z'
    }
  ];

  // Save to localStorage if not already present
  const existing = localStorage.getItem('patientRecords');
  if (!existing) {
    localStorage.setItem('patientRecords', JSON.stringify(mockPatients));
  }

  return mockPatients;
}

// Helper functions
export function getPatientRecords(): PatientRecord[] {
  const stored = localStorage.getItem('patientRecords');
  if (!stored) {
    return initializeMockData();
  }
  return JSON.parse(stored);
}

export function savePatientRecord(record: PatientRecord) {
  const records = getPatientRecords();
  const index = records.findIndex(r => r.id === record.id);
  
  if (index >= 0) {
    records[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    records.push(record);
  }
  
  localStorage.setItem('patientRecords', JSON.stringify(records));
}

export function updatePatientUrgentStatus(patientId: string, isUrgent: boolean, doctorName?: string, notes?: string) {
  const records = getPatientRecords();
  const record = records.find(r => r.id === patientId);
  
  if (record) {
    record.isUrgent = isUrgent;
    if (doctorName) record.flaggedByDoctor = doctorName;
    if (notes) record.urgentNotes = notes;
    record.updatedAt = new Date().toISOString();
    savePatientRecord(record);
  }
}
