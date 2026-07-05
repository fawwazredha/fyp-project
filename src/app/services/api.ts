/**
 * API Service - Centralized API communication for the healthcare application
 */

const API_BASE = 'http://localhost:5000/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  specialty?: string;
  created_at: string;
  is_urgent?: boolean;      // ← add
  urgent_notes?: string;    // ← add
  flagged_by?: string;      // ← add
}

export interface Appointment {
  id: number;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  doctor_specialty?: string;
  date: string;
  time_slot: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled' | 'patient_proposed';
  reject_reason?: string;
  new_date?: string;
  new_time?: string;
  created_at: string;
}

export interface AssessmentData {
  age?: number;
  ageGroup?: string;
  gender?: string;
  bmi?: number;
  hasDiabetes?: boolean;
  hasHighBP?: boolean;
  systolicBP?: number;
  diastolicBP?: number;
  creatinine?: number;
  glucose?: number;
  familyHistory?: boolean;
  smoking?: boolean;
  [key: string]: any;
}

export interface AssessmentResult {
  riskLevel: 'low' | 'moderate' | 'high';
  riskPercentage: number;
  explanation: string;
  recommendations: string[];
  date: string;
}

export interface Assessment {
  id: number;
  patient_id?: number;
  patient_name?: string;
  patient_email?: string;
  guest_name?: string;
  guest_email?: string;
  assessment_data: AssessmentData;
  assessment_result: AssessmentResult;
  created_at: string;
  updated_at: string;
}

export interface PatientWithAssessment {
  user: User;
  assessment?: Assessment;
}

export interface DoctorAvailability {
  id: number;
  doctor_id: number;
  date: string;
  time_slot: string;
  is_booked: boolean;
}

// ─── User APIs ───────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

export async function getPatients(): Promise<User[]> {
  try {
    const users = await getUsers();
    return users.filter(u => u.role === 'patient');
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    return [];
  }
}
export async function setPatientUrgent(
  userId: number,
  isUrgent: boolean,
  notes?: string,
  flaggedBy?: string
): Promise<{ status: string; user?: User; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/urgent`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_urgent: isUrgent, notes, flagged_by: flaggedBy }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to set urgent status:', error);
    return { status: 'error', message: 'Network error' };
  }
}

export async function getDoctors(): Promise<User[]> {
  try {
    const users = await getUsers();
    return users.filter(u => u.role === 'doctor');
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    return [];
  }
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: 'doctor' | 'admin',
  specialty?: string
): Promise<{ status: string; user?: User; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/users/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, specialty }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to create user:', error);
    return { status: 'error', message: 'Network error' };
  }
}

export async function deleteUser(userId: number): Promise<{ status: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE' });
    return await res.json();
  } catch (error) {
    console.error('Failed to delete user:', error);
    return { status: 'error', message: 'Network error' };
  }
}

// ─── Assessment APIs ──────────────────────────────────────────────────────────

export async function getAssessments(): Promise<Assessment[]> {
  try {
    const res = await fetch(`${API_BASE}/assessments`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch assessments:', error);
    return [];
  }
}

export async function getPatientAssessments(patientId: number): Promise<Assessment[]> {
  try {
    const res = await fetch(`${API_BASE}/assessments/patient/${patientId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch patient assessments:', error);
    return [];
  }
}

export async function createAssessment(
  assessmentData: AssessmentData,
  assessmentResult: AssessmentResult,
  patientId?: number,
  guestName?: string,
  guestEmail?: string
): Promise<{ status: string; assessment?: Assessment; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: patientId,
        guest_name: guestName,
        guest_email: guestEmail,
        assessment_data: assessmentData,
        assessment_result: assessmentResult,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to create assessment:', error);
    return { status: 'error', message: 'Network error' };
  }
}

// ─── Appointment APIs ─────────────────────────────────────────────────────────

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const res = await fetch(`${API_BASE}/appointments`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return [];
  }
}

export async function getPatientAppointments(patientId: number): Promise<Appointment[]> {
  try {
    const res = await fetch(`${API_BASE}/appointments/patient/${patientId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch patient appointments:', error);
    return [];
  }
}

export async function getDoctorAppointments(doctorId: number): Promise<Appointment[]> {
  try {
    const res = await fetch(`${API_BASE}/appointments/doctor/${doctorId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch doctor appointments:', error);
    return [];
  }
}

export async function bookAppointment(
  patientId: number,
  doctorId: number,
  date: string,
  timeSlot: string,
  notes?: string
): Promise<{ status: string; appointment?: Appointment; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: patientId,
        doctor_id: doctorId,
        date,
        time_slot: timeSlot,
        notes,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to book appointment:', error);
    return { status: 'error', message: 'Network error' };
  }
}

export async function confirmAppointment(
  appointmentId: number
): Promise<{ status: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/appointments/${appointmentId}/confirm`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to confirm appointment:', error);
    return { status: 'error', message: 'Network error' };
  }
}

export async function requestAppointment(
  patientId: number,
  requestedBy: string
): Promise<{ status: string; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/appointments/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: patientId, requested_by: requestedBy }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to request appointment:', error);
    return { status: 'error', message: 'Network error' };
  }
}
// ─── Doctor Availability APIs ─────────────────────────────────────────────────

export async function getDoctorAvailability(doctorId: number): Promise<DoctorAvailability[]> {
  try {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}/availability`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch doctor availability:', error);
    return [];
  }
}

export async function addDoctorAvailability(
  doctorId: number,
  date: string,
  timeSlots: string[]
): Promise<{ status: string; added?: string[]; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time_slots: timeSlots }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to add doctor availability:', error);
    return { status: 'error', message: 'Network error' };
  }
}

// ─── Combined/Helper APIs ────────────────────────────────────────────────────

/**
 * Get all patients with their latest assessment
 */
export async function getPatientsWithAssessments(): Promise<PatientWithAssessment[]> {
  try {
    const [patients, assessments] = await Promise.all([getPatients(), getAssessments()]);

    return patients.map(patient => {
      const assessment = assessments.find(a => a.patient_id === patient.id);
      return {
        user: patient,
        assessment,
      };
    });
  } catch (error) {
    console.error('Failed to fetch patients with assessments:', error);
    return [];
  }
}

/**
 * Get all doctors with their availability
 */
export async function getDoctorsWithAvailability() {
  try {
    const doctors = await getDoctors();
    const doctorsWithAvailability = await Promise.all(
      doctors.map(async doc => ({
        ...doc,
        availability: await getDoctorAvailability(doc.id),
      }))
    );
    return doctorsWithAvailability;
  } catch (error) {
    console.error('Failed to fetch doctors with availability:', error);
    return [];
  }
}
