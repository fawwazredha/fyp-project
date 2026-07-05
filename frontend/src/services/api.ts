import axios from 'axios'
import type { AssessmentFormData, RiskResult } from '../types'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── your existing function — NOT touched ──────────────────────────────────────
export const submitAssessment = async (payload: AssessmentFormData): Promise<RiskResult> => {
  const response = await client.post<RiskResult>('/predict-risk', payload)
  return response.data
}

// ── ADD everything below this line ────────────────────────────────────────────

export interface PatientUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
}

export interface AssessmentResult {
  riskLevel: 'low' | 'moderate' | 'high';
  riskPercentage: number;
  explanation: string;
  recommendations: string[];
  date: string;
}

export interface AssessmentRecord {
  id: number;
  patient_id: number | null;
  guest_name: string | null;
  guest_email: string | null;
  assessment_data: Record<string, any>;
  assessment_result: AssessmentResult;
  created_at: string;
  updated_at: string;
  patient_name: string | null;
  patient_email: string | null;
}

export interface PatientWithAssessment {
  user: PatientUser;
  assessment: AssessmentRecord | null;
}

export interface AppointmentRecord {
  id: number;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  doctor_name: string;
  doctor_specialty: string;
  date: string;
  time_slot: string;
  notes?: string;
  status: string;
  reject_reason?: string;
  new_date?: string;
  new_time?: string;
  created_at: string;
}

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  specialty: string | null;
  created_at: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
}

export interface DoctorRecord extends UserRecord {
  availability: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  id: number;
  doctor_id: number;
  date: string;
  time_slot: string;
  is_booked: boolean;
}

export interface NotificationRecord {
  id: number;
  user_id: number;
  appointment_id: number | null;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const loginUser = async (email: string, password: string) => {
  const res = await client.post('/login', { email, password })
  return res.data
}

export const signupUser = async (name: string, email: string, password: string) => {
  const res = await client.post('/signup', { name, email, password })
  return res.data
}

export const getUsers = async (): Promise<UserRecord[]> => {
  const res = await client.get('/users')
  return res.data
}

export const createUser = async (
  name: string,
  email: string,
  password: string,
  role: 'doctor' | 'admin',
  specialty?: string
) => {
  const res = await client.post('/users/create', { name, email, password, role, specialty })
  return res.data
}

export const deleteUser = async (userId: number) => {
  const res = await client.delete(`/users/${userId}`)
  return res.data
}

export const getProfile = async (userId: number) => {
  const res = await client.get(`/profile/${userId}`)
  return res.data
}

export const updateProfile = async (
  userId: number,
  data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    emergencyContact: string;
  }
) => {
  const res = await client.put(`/profile/${userId}`, data)
  return res.data
}

export const getDoctors = async (): Promise<DoctorRecord[]> => {
  const res = await client.get('/doctors')
  return res.data
}

export const getDoctorAvailability = async (doctorId: number): Promise<AvailabilitySlot[]> => {
  const res = await client.get(`/doctors/${doctorId}/availability`)
  return res.data
}

export const addDoctorAvailability = async (
  doctorId: number,
  date: string,
  timeSlots: string[]
) => {
  const res = await client.post(`/doctors/${doctorId}/availability`, {
    date,
    time_slots: timeSlots,
  })
  return res.data
}

export const deleteAvailabilitySlot = async (slotId: number) => {
  const res = await client.delete(`/doctors/availability/${slotId}`)
  return res.data
}

export const bookAppointment = async (data: {
  patient_id: number;
  doctor_id: number;
  date: string;
  time_slot: string;
  notes?: string;
}) => {
  const res = await client.post('/appointments', data)
  return res.data
}

export const getAppointments = async (): Promise<AppointmentRecord[]> => {
  const res = await client.get('/appointments')
  return res.data
}

export const getPatientAppointments = async (patientId: number): Promise<AppointmentRecord[]> => {
  const res = await client.get(`/appointments/patient/${patientId}`)
  return res.data
}

export const getDoctorAppointments = async (doctorId: number): Promise<AppointmentRecord[]> => {
  const res = await client.get(`/appointments/doctor/${doctorId}`)
  return res.data
}

export const confirmAppointment = async (apptId: number) => {
  const res = await client.patch(`/appointments/${apptId}/confirm`)
  return res.data
}

export const cancelAppointment = async (apptId: number, reason: string) => {
  const res = await client.patch(`/appointments/${apptId}/cancel`, { reason })
  return res.data
}

export const rescheduleAppointment = async (
  apptId: number,
  newDate: string,
  newTime: string,
  reason?: string
) => {
  const res = await client.patch(`/appointments/${apptId}/reschedule`, {
    new_date: newDate,
    new_time: newTime,
    reason,
  })
  return res.data
}

export const acceptAppointment = async (apptId: number) => {
  const res = await client.patch(`/appointments/${apptId}/accept`)
  return res.data
}

export const proposeAppointment = async (
  apptId: number,
  newDate: string,
  newTime: string,
  reason?: string
) => {
  const res = await client.patch(`/appointments/${apptId}/propose`, {
    new_date: newDate,
    new_time: newTime,
    reason,
  })
  return res.data
}

export const getAssessments = async (): Promise<AssessmentRecord[]> => {
  const res = await client.get('/assessments')
  return res.data
}

export const getPatientAssessments = async (patientId: number): Promise<AssessmentRecord[]> => {
  const res = await client.get(`/assessments/patient/${patientId}`)
  return res.data
}

export const predictRisk = async (data: Record<string, any>) => {
  const res = await client.post('/predict-risk', data)
  return res.data
}

export const getPatientsWithAssessments = async (): Promise<PatientWithAssessment[]> => {
  const res = await client.get('/patients-with-assessments')
  return res.data
}

export const getNotifications = async (userId: number): Promise<NotificationRecord[]> => {
  const res = await client.get(`/notifications/${userId}`)
  return res.data
}

export const markNotificationRead = async (notifId: number) => {
  const res = await client.patch(`/notifications/${notifId}/read`)
  return res.data
}

export const markAllNotificationsRead = async (userId: number) => {
  const res = await client.patch(`/notifications/read-all/${userId}`)
  return res.data
}