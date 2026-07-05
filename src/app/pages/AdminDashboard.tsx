import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, Activity, Calendar, AlertTriangle, TrendingUp, BarChart3,
  Search, Filter, ChevronDown, ChevronRight, Eye, UserPlus, X,
  Lock, Mail, User, Stethoscope, ShieldCheck, Trash2, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { PatientRecord } from '../utils/mockData';
import { PatientDetailModal } from '../components/PatientDetailModal';
import { NotificationBell } from '../components/NotificationBell';
import { toast } from 'sonner';
import * as api from '../services/api';
import { DoctorAvailabilityModal } from '../components/DoctorAvailabilityModal';

// ─── Add Staff Modal ──────────────────────────────────────────────────────────
interface StaffForm {
  name: string;
  email: string;
  password: string;
  role: 'doctor' | 'admin';
}

function AddStaffModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm]                 = useState<StaffForm>({ name: '', email: '', password: '', role: 'doctor' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.createUser(form.name, form.email, form.password, form.role);
      if (result.status !== 'success') {
        setError(result.message || 'Failed to create account.');
        return;
      }
      toast.success(`${form.role === 'doctor' ? 'Doctor' : 'Admin'} account created for ${form.name}!`);
      onCreated();
      onClose();
    } catch {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-[#3A86FF]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Staff Account</h2>
            <p className="text-sm text-gray-500">Create a doctor or admin login</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {(['doctor', 'admin'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: r }))}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                form.role === r
                  ? r === 'doctor'
                    ? 'border-[#2EC4B6] bg-teal-50 text-[#2EC4B6]'
                    : 'border-[#3A86FF] bg-blue-50 text-[#3A86FF]'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {r === 'doctor' ? <Stethoscope className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              {r === 'doctor' ? 'Doctor' : 'Admin'}
            </button>
          ))}
        </div>
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent transition-all"
                placeholder={form.role === 'doctor' ? 'Dr. Sarah Johnson' : 'Admin Name'}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent transition-all"
                placeholder="staff@hospital.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="block w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent transition-all"
                placeholder="Set a secure password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#3A86FF] transition-colors"
                tabIndex={-1}
              >
                {showPassword
                  ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
              form.role === 'doctor'
                ? 'bg-gradient-to-r from-[#2EC4B6] to-[#3A86FF]'
                : 'bg-gradient-to-r from-[#3A86FF] to-purple-500'
            }`}
          >
            {loading
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <><UserPlus className="w-4 h-4" /> Create {form.role === 'doctor' ? 'Doctor' : 'Admin'} Account</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Staff List Panel ─────────────────────────────────────────────────────────
interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Appointment {
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

function StaffPanel({ refresh }: { refresh: number }) {
  const [staff, setStaff]         = useState<StaffUser[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const fetchStaff = async () => {
    try {
      const users = await api.getUsers();
      setStaff(users.filter((u) => u.role === 'doctor' || u.role === 'admin') as StaffUser[]);
    } catch (error) {
      console.error('Failed to fetch staff', error);
    }
  };

  useEffect(() => { fetchStaff(); }, [refresh]);

  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`Remove ${userName}'s account? This cannot be undone.`)) return;
    setLoadingId(userId);
    try {
      const result = await api.deleteUser(userId);
      if (result.status === 'success') {
        toast.success(`${userName}'s account removed.`);
        fetchStaff();
      } else {
        toast.error(result.message || 'Failed to delete account.');
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (staff.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No staff accounts yet. Add a doctor or admin above.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {staff.map((s) => (
        <div key={s.id} className="flex items-center justify-between py-3 px-1">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              s.role === 'doctor' ? 'bg-teal-100' : 'bg-blue-100'
            }`}>
              {s.role === 'doctor'
                ? <Stethoscope className="w-4 h-4 text-[#2EC4B6]" />
                : <ShieldCheck className="w-4 h-4 text-[#3A86FF]" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{s.name}</p>
              <p className="text-xs text-gray-500">{s.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
              s.role === 'doctor' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {s.role}
            </span>
            <button
              onClick={() => handleDelete(s.id, s.name)}
              disabled={loadingId === s.id}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
              title="Remove account"
            >
              {loadingId === s.id
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Trash2 className="w-4 h-4" />
              }
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Book-on-behalf Modal ─────────────────────────────────────────────────────
function BookForPatientModal({
  patient,
  onClose,
  onBooked,
}: {
  patient: PatientRecord;
  onClose: () => void;
  onBooked: () => void;
}) {
  const [doctors, setDoctors]                   = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate]         = useState<string>('');
  const [selectedSlot, setSelectedSlot]         = useState<string>('');
  const [notes, setNotes]                       = useState('');
  const [loadingDocs, setLoadingDocs]           = useState(true);
  const [booking, setBooking]                   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const docs = await api.getDoctorsWithAvailability();
        setDoctors(docs);
      } catch (e) {
        console.error('Failed to load doctors:', e);
      } finally {
        setLoadingDocs(false);
      }
    })();
  }, []);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const openSlots      = (selectedDoctor?.availability || []).filter((s: any) => !s.is_booked);

  const slotsByDate: Record<string, any[]> = {};
  openSlots.forEach((s: any) => { (slotsByDate[s.date] ||= []).push(s); });
  const dates = Object.keys(slotsByDate).sort();

  const handleBook = async () => {
    if (!selectedDoctorId || !selectedDate || !selectedSlot) {
      toast.error('Please select a doctor, date, and time slot.');
      return;
    }
    setBooking(true);
    try {
      const result = await api.bookAppointment(
        parseInt(patient.userId || patient.id),
        selectedDoctorId,
        selectedDate,
        selectedSlot,
        notes || `Booked by admin on behalf of ${patient.credentials.name}`,
      );
      if (result.status === 'success') {
        toast.success(`Appointment booked for ${patient.credentials.name}`);
        window.dispatchEvent(new Event('appointmentBooked'));
        onBooked();
        onClose();
      } else {
        toast.error(result.message || 'Failed to book appointment.');
      }
    } catch {
      toast.error('Network error while booking.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#3A86FF]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
            <p className="text-sm text-gray-500">On behalf of {patient.credentials.name}</p>
          </div>
        </div>

        {loadingDocs ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#3A86FF]" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Doctor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Doctor</label>
              <select
                value={selectedDoctorId ?? ''}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value ? parseInt(e.target.value) : null);
                  setSelectedDate('');
                  setSelectedSlot('');
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
              >
                <option value="">Choose a doctor…</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.specialty ? ` — ${d.specialty}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            {selectedDoctorId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Available Date</label>
                {dates.length === 0 ? (
                  <p className="text-sm text-gray-400 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 text-center">
                    This doctor has no open slots.
                  </p>
                ) : (
                  <select
                    value={selectedDate}
                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
                  >
                    <option value="">Choose a date…</option>
                    {dates.map((d) => (
                      <option key={d} value={d}>
                        {new Date(d + 'T00:00:00').toLocaleDateString('en-MY', {
                          weekday: 'short', month: 'short', day: 'numeric',
                        })}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Time slot */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Available Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {slotsByDate[selectedDate].map((s: any) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSlot(s.time_slot)}
                      className={`py-2 text-xs rounded-lg border transition-all ${
                        selectedSlot === s.time_slot
                          ? 'bg-[#3A86FF] text-white border-[#3A86FF]'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {s.time_slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
                placeholder="Reason for appointment…"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={booking}
                className="flex-1 py-2.5 bg-[#3A86FF] text-white rounded-xl text-sm font-semibold hover:bg-[#2E6FD9] transition-colors disabled:opacity-60 flex items-center justify-center gap-1"
              >
                {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                Book & Notify
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments]       = useState<Appointment[]>([]);
  const [patientRecords, setPatientRecords]   = useState<PatientRecord[]>([]);
  const [assessmentDates, setAssessmentDates] = useState<string[]>([]);
  const [allUsers, setAllUsers]               = useState<StaffUser[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen]   = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [bookForPatient, setBookForPatient]   = useState<PatientRecord | null>(null);
  const [staffRefresh, setStaffRefresh]       = useState(0);
  const [expandedRow, setExpandedRow]         = useState<string | null>(null);
  const [filterRisk, setFilterRisk]           = useState<string>('all');
  const [filterAppointment, setFilterAppointment] = useState<string>('all');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm]           = useState('');

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const appointmentsData = await api.getAppointments();
        setAppointments(appointmentsData as any);

        const patientsWithAssessments = await api.getPatientsWithAssessments();

        const records: PatientRecord[] = patientsWithAssessments.map(pa => ({
          id:     String(pa.user.id),
          userId: String(pa.user.id),
          credentials: {
            name:             pa.user.name             || 'Unknown',
            email:            pa.user.email            || 'No Email',
            phone:            pa.user.phone            || 'Not provided',
            address:          pa.user.address          || 'Not provided',
            dateOfBirth:      pa.user.dateOfBirth      || '',
            emergencyContact: pa.user.emergencyContact || 'Not provided',
          },
          assessmentData: pa.assessment?.assessment_data || {
            ageGroup: 'below30',
            gender:   'Unknown',
            bmi:      0,
          },
          assessmentResult: pa.assessment?.assessment_result || {
            riskLevel:       'low' as const,
            riskPercentage:  0,
            explanation:     'No assessment data available.',
            recommendations: [],
            date:            new Date().toISOString(),
          },
          isUrgent:        (pa.user as any).is_urgent || false,
          urgentNotes:     (pa.user as any).urgent_notes || undefined,
          flaggedByDoctor: (pa.user as any).flagged_by || undefined,
          createdAt:       pa.user.created_at,
          updatedAt:       pa.user.created_at,
        }));

        setPatientRecords(records);

        // Collect ALL assessment dates — logged-in AND anonymous (guest) users.
        const allAssessments = await api.getAssessments();
        const dates = allAssessments
          .map((a: any) => a.created_at || a.assessment_result?.date)
          .filter((d: any): d is string => !!d);
        setAssessmentDates(dates);

        // All registered accounts (patients + staff), for the Registered Users card.
        const users = await api.getUsers();
        setAllUsers(users as StaffUser[]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load patient and appointment data');
      }
    };

    fetchData();

    const handleAppointmentRefresh = () => { fetchData(); };
    window.addEventListener('appointmentStatusChanged', handleAppointmentRefresh);
    window.addEventListener('appointmentBooked', handleAppointmentRefresh);
    const pollInterval = setInterval(fetchData, 30000);

    return () => {
      window.removeEventListener('appointmentStatusChanged', handleAppointmentRefresh);
      window.removeEventListener('appointmentBooked', handleAppointmentRefresh);
      clearInterval(pollInterval);
    };
  }, [isAuthenticated, user, navigate, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredPatients = patientRecords.filter(patient => {
    const matchesSearch =
      patient.credentials.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.credentials.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || patient.assessmentResult.riskLevel === filterRisk;
    const hasAppointment = appointments.some(apt => String(apt.patient_id) === String(patient.userId));
    const matchesAppointment =
      filterAppointment === 'all' ||
      (filterAppointment === 'with'    && hasAppointment) ||
      (filterAppointment === 'without' && !hasAppointment);
    return matchesSearch && matchesRisk && matchesAppointment;
  });

  // ─── Derived real-data metrics ──────────────────────────────────────────────
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Monthly Assessments: last 6 months ending at the current month, counted from real dates.
  const assessmentData = (() => {
    const months: { key: string; month: string; assessments: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: d.toLocaleString('en-US', { month: 'short' }),
        assessments: 0,
      });
    }
    assessmentDates.forEach((raw) => {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = months.find((m) => m.key === key);
      if (bucket) bucket.assessments += 1;
    });
    return months;
  })();

  const totalRegisteredUsers = allUsers.length;

  const newUsersThisWeek = allUsers.filter((u) => {
    const d = new Date(u.created_at);
    return !isNaN(d.getTime()) && d >= oneWeekAgo;
  }).length;

  const assessmentsThisWeek = assessmentDates.filter((raw) => {
    const d = new Date(raw);
    return !isNaN(d.getTime()) && d >= oneWeekAgo;
  }).length;

  const riskDistribution = [
    { name: 'Low Risk',      value: patientRecords.filter(p => p.assessmentResult.riskLevel === 'low').length,      color: '#10B981' },
    { name: 'Moderate Risk', value: patientRecords.filter(p => p.assessmentResult.riskLevel === 'moderate').length, color: '#F59E0B' },
    { name: 'High Risk',     value: patientRecords.filter(p => p.assessmentResult.riskLevel === 'high').length,     color: '#EF4444' },
  ];

  const stats = {
    totalUsers:          patientRecords.length,
    totalAssessments:    assessmentDates.length,
    totalAppointments:   appointments.length,
    highRiskCases:       patientRecords.filter(p => p.assessmentResult.riskLevel === 'high').length,
    urgentCases:         patientRecords.filter(p => p.isUrgent).length,
    newUsersThisWeek,
    assessmentsThisWeek,
    totalRegisteredUsers,
  };

  const getPatientName = (patientId: string | number) =>
    patientRecords.find(p => String(p.userId || p.id) === String(patientId))?.credentials.name || 'Unknown Patient';

  const getAppointmentStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed':        return 'bg-green-100 text-green-800';
      case 'pending':          return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':        return 'bg-red-100 text-red-800';
      case 'rescheduled':      return 'bg-blue-100 text-blue-800';
      case 'patient_proposed': return 'bg-indigo-100 text-indigo-800';
      default:                 return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentNotes = (appt: Appointment) => {
    if ((appt.status === 'rescheduled' || appt.status === 'patient_proposed') && appt.new_date && appt.new_time) {
      const label = appt.status === 'rescheduled' ? 'Doctor proposed' : 'Patient proposed';
      return `${label}: ${appt.new_date} at ${appt.new_time}${appt.reject_reason ? ` — ${appt.reject_reason}` : ''}`;
    }
    if (appt.reject_reason) return appt.reject_reason;
    return appt.notes || '—';
  };

  const filteredAppointments = appointmentStatusFilter === 'all'
    ? appointments
    : appointments.filter(appt => appt.status === appointmentStatusFilter);

  const getRiskBadgeClass = (level: string) => {
    switch (level) {
      case 'low':      return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':     return 'bg-red-100 text-red-800 border-red-300';
      default:         return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 lg:py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive patient data and system management</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={() => setIsAvailabilityOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#3A86FF] text-[#3A86FF] rounded-xl font-semibold hover:bg-blue-50 transition-all"
            >
              <Calendar className="w-4 h-4" />
              Set Doctor Hours
            </button>
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Add Staff
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">+{stats.newUsersThisWeek} this week</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-[#3A86FF]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssessments}</p>
                <p className="text-xs text-green-600 mt-0.5">+{stats.assessmentsThisWeek} this week</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
                <p className="text-xs text-gray-500 mt-0.5">All time</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#2EC4B6]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">High Risk Cases</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRiskCases}</p>
                <p className="text-xs text-gray-500 mt-0.5">Requires attention</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-red-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Urgent Cases</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgentCases}</p>
                <p className="text-xs text-red-500 mt-0.5">Immediate attention</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts + Staff Panel */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-[#3A86FF]" />
              <h2 className="text-base font-semibold text-gray-900">Monthly Assessments</h2>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={assessmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="assessments" fill="#3A86FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#3A86FF]" />
              <h2 className="text-base font-semibold text-gray-900">Risk Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {riskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#3A86FF]" />
                <h2 className="text-lg font-semibold text-gray-900">Staff Accounts</h2>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(true)}
                className="flex items-center gap-1 text-xs font-medium text-[#3A86FF] hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <StaffPanel refresh={staffRefresh} />
          </div>
        </div>

        {/* Appointment Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#3A86FF]" />
                <h2 className="text-xl font-semibold text-gray-900">Appointment Records</h2>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm text-gray-500">Filter status:</span>
                <select
                  value={appointmentStatusFilter}
                  onChange={(e) => setAppointmentStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="patient_proposed">Proposed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">
                      No appointments match the selected status.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt, index) => (
                    <tr key={`${appt.id}-${appt.patient_id}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-700">{getPatientName(appt.patient_id)}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{appt.doctor_name || 'Unknown'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{appt.date}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{appt.time_slot}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getAppointmentStatusClass(appt.status)}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{getAppointmentNotes(appt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#3A86FF]" />
                Patient Records
              </h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="moderate">Moderate Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>
              <select
                value={filterAppointment}
                onChange={(e) => setFilterAppointment(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
              >
                <option value="all">All Patients</option>
                <option value="with">With Appointments</option>
                <option value="without">Without Appointments</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8"></th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Level</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Score</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assessment Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => (
                  <>
                    <tr key={patient.id} className={`hover:bg-gray-50 transition-colors ${patient.isUrgent ? 'bg-red-50' : ''}`}>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setExpandedRow(expandedRow === patient.id ? null : patient.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedRow === patient.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900 text-sm">{patient.credentials.name}</p>
                        <p className="text-xs text-gray-500">{patient.credentials.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border capitalize ${getRiskBadgeClass(patient.assessmentResult.riskLevel)}`}>
                          {patient.assessmentResult.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-full rounded-full ${
                                patient.assessmentResult.riskLevel === 'low' ? 'bg-green-500' :
                                patient.assessmentResult.riskLevel === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${patient.assessmentResult.riskPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{patient.assessmentResult.riskPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(patient.assessmentResult.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {patient.isUrgent
                          ? <span className="flex items-center gap-1 text-xs text-red-700 font-semibold"><AlertTriangle className="w-3 h-3" /> Urgent</span>
                          : <span className="text-xs text-gray-500">Normal</span>
                        }
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setSelectedPatient(patient); setIsModalOpen(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[#3A86FF] hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                          <button
                            onClick={() => setBookForPatient(patient)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[#2EC4B6] hover:bg-teal-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Calendar className="w-4 h-4" /> Book
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === patient.id && (
                      <tr>
                        <td colSpan={7} className="bg-gray-50 px-4 py-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Quick Stats</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600">Age:</span><span className="font-semibold">{patient.assessmentData.age ? `${patient.assessmentData.age} years` : patient.assessmentData.ageGroup || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">BMI:</span><span className="font-semibold">{patient.assessmentData.bmi ?? 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Diabetes:</span><span className={(patient.assessmentData.hasDiabetes ?? patient.assessmentData.diabetes) ? 'text-red-600 font-semibold' : 'text-green-600'}>{(patient.assessmentData.hasDiabetes ?? patient.assessmentData.diabetes) ? 'Yes' : 'No'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">High BP:</span><span className={(patient.assessmentData.hasHighBP ?? patient.assessmentData.hypertension) ? 'text-red-600 font-semibold' : 'text-green-600'}>{(patient.assessmentData.hasHighBP ?? patient.assessmentData.hypertension) ? 'Yes' : 'No'}</span></div>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Biomarkers</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600">Creatinine:</span><span className={`font-semibold ${patient.assessmentData.creatinine && patient.assessmentData.creatinine > 1.2 ? 'text-red-600' : 'text-green-600'}`}>{patient.assessmentData.creatinine ?? 'N/A'} mg/dL</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Glucose:</span><span className={`font-semibold ${patient.assessmentData.glucose && patient.assessmentData.glucose > 100 ? 'text-red-600' : 'text-green-600'}`}>{patient.assessmentData.glucose ?? 'N/A'} mg/dL</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">BP:</span><span className="font-semibold">{patient.assessmentData.systolicBP ?? 'N/A'}/{patient.assessmentData.diastolicBP ?? 'N/A'}</span></div>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Additional Info</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600">Family History:</span><span className={patient.assessmentData.familyHistory ? 'text-red-600' : 'text-green-600'}>{patient.assessmentData.familyHistory ? 'Yes' : 'No'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Smoking:</span><span className={patient.assessmentData.smoking ? 'text-red-600' : 'text-green-600'}>{patient.assessmentData.smoking ? 'Yes' : 'No'}</span></div>
                                {patient.flaggedByDoctor && (
                                  <div className="pt-2 border-t border-gray-200">
                                    <p className="text-xs text-red-700"><strong>Flagged by:</strong> {patient.flaggedByDoctor}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {patient.urgentNotes && (
                            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-sm text-red-900"><strong>Urgent Notes:</strong> {patient.urgentNotes}</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            {filteredPatients.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No patients found matching your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              <h3 className="font-semibold text-gray-900">System Status</h3>
            </div>
            <p className="text-sm text-gray-700">All systems operational</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-[#3A86FF]" />
              <h3 className="font-semibold text-gray-900">Database</h3>
            </div>
            <p className="text-sm text-gray-700">Connected & synchronized</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Registered Users</h3>
            </div>
            <p className="text-sm text-gray-700">{stats.totalRegisteredUsers} total accounts</p>
          </div>
        </div>
      </div>

      {isAddStaffOpen && (
        <AddStaffModal
          onClose={() => setIsAddStaffOpen(false)}
          onCreated={() => setStaffRefresh((n) => n + 1)}
        />
      )}

      {isAvailabilityOpen && (
        <DoctorAvailabilityModal onClose={() => setIsAvailabilityOpen(false)} />
      )}

      {bookForPatient && (
        <BookForPatientModal
          patient={bookForPatient}
          onClose={() => setBookForPatient(null)}
          onBooked={() => window.dispatchEvent(new Event('appointmentBooked'))}
        />
      )}

      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedPatient(null); }}
          userRole="admin"
        />
      )}
    </div>
  );
}