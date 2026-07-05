import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, Users, CheckCircle, X, FileText, Clock, Eye,
  AlertTriangle, Plus, Trash2, ChevronLeft, ChevronRight,
  Loader2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { PatientRecord, updatePatientUrgentStatus } from '../utils/mockData';
import { PatientDetailModal } from '../components/PatientDetailModal';
import { NotificationBell } from '../components/NotificationBell';
import * as api from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Appointment {
  id: number;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  date: string;
  time_slot: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled';
  reject_reason?: string;
  new_date?: string;
  new_time?: string;
  created_at: string;
}

interface AvailabilitySlot {
  id: number;
  date: string;
  time_slot: string;
  is_booked: boolean;
}

const ALL_TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
];

// ─────────────────────────────────────────────────────────────────────────────
// Mini calendar for availability management
// ─────────────────────────────────────────────────────────────────────────────
function AvailabilityCalendar({
  existingSlots,
  onAddSlots,
  onDeleteSlot,
}: {
  existingSlots: AvailabilitySlot[];
  onAddSlots: (date: string, slots: string[]) => void;
  onDeleteSlot: (slotId: number) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear]       = useState(today.getFullYear());
  const [viewMonth, setViewMonth]     = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [pickedTimes, setPickedTimes] = useState<string[]>([]);
  const [saving, setSaving]           = useState(false);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const dateHasSlots = (dateStr: string) =>
    existingSlots.some((s) => s.date === dateStr);

  const handleDayClick = (dateStr: string) => {
    setSelectedDay(dateStr);
    const already = existingSlots
      .filter((s) => s.date === dateStr)
      .map((s) => s.time_slot);
    setPickedTimes(already);
  };

  const toggleTime = (t: string) => {
    setPickedTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleSave = async () => {
    if (!selectedDay || pickedTimes.length === 0) return;
    setSaving(true);
    const existing = existingSlots
      .filter((s) => s.date === selectedDay)
      .map((s) => s.time_slot);
    const newTimes = pickedTimes.filter((t) => !existing.includes(t));
    const removed  = existing.filter((t) => !pickedTimes.includes(t));

    for (const t of removed) {
      const slot = existingSlots.find(
        (s) => s.date === selectedDay && s.time_slot === t && !s.is_booked
      );
      if (slot) await onDeleteSlot(slot.id);
    }

    if (newTimes.length > 0) await onAddSlots(selectedDay, newTimes);
    setSaving(false);
    setSelectedDay(null);
    toast.success('Availability updated!');
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 hover:bg-white rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900 text-sm">{monthName}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-white rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dateObj = new Date(viewYear, viewMonth, day);
            const isPast     = dateObj < today;
            const hasSlot    = dateHasSlots(dateStr);
            const isSelected = selectedDay === dateStr;

            return (
              <button
                key={dateStr}
                disabled={isPast}
                onClick={() => handleDayClick(dateStr)}
                className={`
                  w-full aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all relative
                  ${isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-white'}
                  ${isSelected ? 'bg-[#3A86FF] text-white shadow-md' : ''}
                  ${!isSelected && hasSlot ? 'bg-green-100 text-green-800' : ''}
                `}
              >
                {day}
                {hasSlot && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-MY', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {ALL_TIME_SLOTS.map((t) => {
              const isBooked = existingSlots.some(
                (s) => s.date === selectedDay && s.time_slot === t && s.is_booked
              );
              return (
                <button
                  key={t}
                  disabled={isBooked}
                  onClick={() => toggleTime(t)}
                  className={`py-2 text-xs rounded-lg border transition-all ${
                    isBooked
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                      : pickedTimes.includes(t)
                      ? 'bg-[#3A86FF] text-white border-[#3A86FF]'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {isBooked ? `${t} 🔒` : t}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDay(null)}
              className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 bg-[#3A86FF] text-white rounded-lg text-sm font-semibold hover:bg-[#2E6FD9] transition-colors disabled:opacity-60 flex items-center justify-center gap-1"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reschedule modal
// ─────────────────────────────────────────────────────────────────────────────
function RescheduleModal({
  appointment,
  onClose,
  onDone,
}: {
  appointment: Appointment;
  onClose: () => void;
  onDone: () => void;
}) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason]   = useState('');
  const [saving, setSaving]   = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async () => {
    if (!newDate || !newTime) { toast.error('Please select a new date and time'); return; }
    setSaving(true);
    try {
      const result = await api.rescheduleAppointment(appointment.id, newDate, newTime, reason);
      if (result.status === 'success') {
        toast.success('Appointment rescheduled — patient notified');
        window.dispatchEvent(new Event('appointmentStatusChanged'));
        onDone();
        onClose();
      } else {
        toast.error('Failed to reschedule');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#3A86FF]" /> Reschedule Appointment
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
          <p><strong>Patient:</strong> {appointment.patient_name}</p>
          <p><strong>Original:</strong> {appointment.date} at {appointment.time_slot}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Date</label>
            <input
              type="date"
              min={today}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Time</label>
            <div className="grid grid-cols-3 gap-2">
              {ALL_TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  onClick={() => setNewTime(t)}
                  className={`py-2 text-xs rounded-lg border transition-all ${
                    newTime === t
                      ? 'bg-[#3A86FF] text-white border-[#3A86FF]'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
              placeholder="e.g. Emergency case, public holiday..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 bg-[#3A86FF] text-white rounded-xl text-sm font-semibold hover:bg-[#2E6FD9] transition-colors disabled:opacity-60 flex items-center justify-center gap-1"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Reschedule & Notify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancel modal
// ─────────────────────────────────────────────────────────────────────────────
function CancelModal({
  appointment,
  onClose,
  onDone,
}: {
  appointment: Appointment;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const result = await api.cancelAppointment(appointment.id, reason || 'No reason provided');
      if (result.status === 'success') {
        toast.success('Appointment cancelled — patient notified');
        window.dispatchEvent(new Event('appointmentStatusChanged'));
        onDone();
        onClose();
      } else {
        toast.error('Failed to cancel');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <X className="w-5 h-5 text-red-500" /> Cancel Appointment
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-gray-600">
          <p><strong>Patient:</strong> {appointment.patient_name}</p>
          <p><strong>Date:</strong> {appointment.date} at {appointment.time_slot}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for cancellation</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent"
              placeholder="e.g. Doctor unavailable, emergency..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              Cancel & Notify Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main DoctorDashboard
// ─────────────────────────────────────────────────────────────────────────────
export function DoctorDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments]         = useState<Appointment[]>([]);
  const [availability, setAvailability]         = useState<AvailabilitySlot[]>([]);
  const [loadingAppts, setLoadingAppts]         = useState(false);
  const [filter, setFilter]                     = useState<'all' | 'pending' | 'confirmed'>('all');
  const [patientRecords, setPatientRecords]     = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient]   = useState<PatientRecord | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [urgentFilter, setUrgentFilter]         = useState<'all' | 'urgent'>('all');
  const [activeTab, setActiveTab]               = useState<'appointments' | 'availability'>('appointments');
  const [rescheduleAppt, setRescheduleAppt]     = useState<Appointment | null>(null);
  const [cancelAppt, setCancelAppt]             = useState<Appointment | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== 'doctor') { navigate('/login'); return; }
    loadAll();
  }, [isAuthenticated, user, navigate, loading]);

  const loadAll = () => {
    loadAppointments();
    loadAvailability();
    loadPatientRecords();
  };

  // ── KEY FIX: use getPatientsWithAssessments so profile fields are included ─
  const loadPatientRecords = async () => {
    try {
      const patientsWithAssessments = await api.getPatientsWithAssessments();

      const records: PatientRecord[] = patientsWithAssessments.map((pa) => ({
        id:     String(pa.user.id),
        userId: String(pa.user.id),
        credentials: {
          name:             pa.user.name             || 'Unknown',
          email:            pa.user.email            || 'No Email',
          // ── Real profile data from the database ──────────────────────────
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
    } catch (error) {
      console.error('Failed to load patient records:', error);
      toast.error('Failed to load patient records');
    }
  };

  const loadAppointments = async () => {
    if (!user?.id) return;
    setLoadingAppts(true);
    try {
      const data = await api.getDoctorAppointments(parseInt(user.id));
      setAppointments(Array.isArray(data) ? (data as any) : []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoadingAppts(false);
    }
  };

  const loadAvailability = async () => {
    if (!user?.id) return;
    try {
      const data = await api.getDoctorAvailability(parseInt(user.id));
      setAvailability(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load availability:', error);
    }
  };

  const handleAddSlots = async (date: string, slots: string[]) => {
    if (!user?.id) return;
    await api.addDoctorAvailability(parseInt(user.id), date, slots);
    await loadAvailability();
  };

  const handleDeleteSlot = async (slotId: number) => {
    try {
      await api.deleteAvailabilitySlot(slotId);
      await loadAvailability();
    } catch (error) {
      console.error('Failed to delete slot:', error);
    }
  };

  const handleConfirm = async (apptId: number) => {
    try {
      const result = await api.confirmAppointment(apptId);
      if (result.status === 'success') {
        toast.success('Appointment confirmed — patient notified');
        loadAppointments();
        window.dispatchEvent(new Event('appointmentStatusChanged'));
      } else {
        toast.error(result.message || 'Failed to confirm');
      }
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
      toast.error('Failed to confirm appointment');
    }
  };

  const handleMarkUrgent = async (patientId: string, notes: string) => {
    const result = await api.setPatientUrgent(parseInt(patientId), true, notes, user?.name);
    if (result.status === 'success') {
      await loadPatientRecords();
      toast.success('Patient marked as urgent');
      setIsPatientModalOpen(false);
    } else {
      toast.error(result.message || 'Failed to mark urgent');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredAppointments = appointments.filter((a) =>
    filter === 'all' ? true : a.status === filter
  );

  const filteredPatients = patientRecords.filter((p) =>
    urgentFilter === 'urgent' ? p.isUrgent : true
  );

  const stats = {
    total:     appointments.length,
    pending:   appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    today:     appointments.filter((a) => {
      const t = new Date().toISOString().split('T')[0];
      return a.date === t && a.status === 'confirmed';
    }).length,
    urgent:   patientRecords.filter((p) => p.isUrgent).length,
    highRisk: patientRecords.filter((p) => p.assessmentResult.riskLevel === 'high').length,
  };

  const STATUS_BADGE: Record<string, string> = {
    pending:          'bg-yellow-100 text-yellow-800',
    confirmed:        'bg-green-100 text-green-800',
    cancelled:        'bg-red-100 text-red-800',
    rescheduled:      'bg-blue-100 text-blue-700',
    patient_proposed: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 lg:py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user?.name}</p>
          </div>
          <NotificationBell />
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Appointments', value: stats.total,     color: 'blue',   Icon: Calendar },
            { label: 'Pending',            value: stats.pending,   color: 'yellow', Icon: Clock },
            { label: 'Confirmed',          value: stats.confirmed, color: 'green',  Icon: CheckCircle },
            { label: "Today's Patients",   value: stats.today,     color: 'purple', Icon: Users },
            { label: 'Urgent Cases',       value: stats.urgent,    color: 'red',    Icon: AlertTriangle, urgent: true },
          ].map(({ label, value, color, Icon, urgent }) => (
            <div key={label} className={`bg-white rounded-xl shadow-lg p-3 ${urgent ? 'border-2 border-red-300' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">{label}</p>
                  <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
                </div>
                <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center ${urgent ? 'animate-pulse' : ''}`}>
                  <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {[
            { key: 'appointments', label: 'Appointments' },
            { key: 'availability', label: 'My Availability' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-[#3A86FF] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
              {tab.key === 'appointments' && stats.pending > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── APPOINTMENTS TAB ── */}
        {activeTab === 'appointments' && (
          <div className="grid lg:grid-cols-2 gap-4">

            {/* Appointment list */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#3A86FF]" /> Appointment Requests
                </h2>
                <div className="flex gap-2">
                  {(['all', 'pending', 'confirmed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                        filter === f
                          ? 'bg-[#3A86FF] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {loadingAppts ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-[#3A86FF]" />
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-14 text-gray-400">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No {filter === 'all' ? '' : filter} appointments</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredAppointments.map((appt) => (
                    <div key={appt.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">

                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3A86FF] to-[#2EC4B6] rounded-full flex items-center justify-center text-white font-bold shrink-0">
                          {appt.patient_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{appt.patient_name}</p>
                          <p className="text-xs text-gray-500">{appt.date} · {appt.time_slot}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE[appt.status] || 'bg-gray-100 text-gray-800'}`}>
                          {appt.status}
                        </span>
                      </div>

                      {appt.notes && (
                        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-2.5 mb-3">
                          <FileText className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-blue-800">{appt.notes}</p>
                        </div>
                      )}

                      {appt.status === 'rescheduled' && (
                        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-100 rounded-lg p-2.5 mb-3">
                          <RefreshCw className="w-3.5 h-3.5 text-yellow-600 mt-0.5 shrink-0" />
                          <p className="text-xs text-yellow-800">
                            Rescheduled to {appt.new_date} at {appt.new_time}
                            {appt.reject_reason ? ` · ${appt.reject_reason}` : ''}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {appt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirm(appt.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Confirm
                            </button>
                            <button
                              onClick={() => setRescheduleAppt(appt)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-[#3A86FF] rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                            </button>
                            <button
                              onClick={() => setCancelAppt(appt)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </>
                        )}
                        {appt.status === 'confirmed' && (
                          <button
                            onClick={() => setRescheduleAppt(appt)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-[#3A86FF] rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Patient risk overview */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#3A86FF]" /> Patient Risk Overview
                </h2>
                <button
                  onClick={() => setUrgentFilter((v) => v === 'all' ? 'urgent' : 'all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    urgentFilter === 'urgent'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {urgentFilter === 'urgent' ? 'Urgent only' : 'All'}
                </button>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-14 text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No patients found</p>
                  </div>
                ) : (
                  filteredPatients.slice(0, 10).map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => { setSelectedPatient(patient); setIsPatientModalOpen(true); }}
                      className={`border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer ${
                        patient.isUrgent ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-[#3A86FF] to-[#2EC4B6] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {patient.credentials.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{patient.credentials.name}</p>
                            <p className="text-xs text-gray-500">{patient.credentials.email}</p>
                          </div>
                        </div>
                        {patient.isUrgent && (
                          <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> URGENT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          patient.assessmentResult.riskLevel === 'high'     ? 'bg-red-100 text-red-800' :
                          patient.assessmentResult.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {patient.assessmentResult.riskLevel.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-600 font-bold">
                          {patient.assessmentResult.riskPercentage}%
                        </span>
                        <span className="ml-auto text-[#3A86FF] text-xs flex items-center gap-1">
                          <Eye className="w-3 h-3" /> View
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── AVAILABILITY TAB ── */}
        {activeTab === 'availability' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#3A86FF]" /> Set My Available Slots
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Click on a date to add or remove time slots. Green dates already have slots.
                Locked slots (🔒) are already booked by patients.
              </p>
              <AvailabilityCalendar
                existingSlots={availability}
                onAddSlots={handleAddSlots}
                onDeleteSlot={handleDeleteSlot}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#3A86FF]" /> Upcoming Slots
              </h2>
              {availability.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No slots added yet.</p>
                  <p className="text-xs mt-1">Use the calendar to add your availability.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {[...new Set(availability.map((s) => s.date))]
                    .sort()
                    .map((date) => {
                      const slots = availability.filter((s) => s.date === date);
                      return (
                        <div key={date} className="border border-gray-200 rounded-xl p-3">
                          <p className="text-sm font-semibold text-gray-900 mb-2">
                            {new Date(date + 'T00:00:00').toLocaleDateString('en-MY', {
                              weekday: 'short', month: 'short', day: 'numeric',
                            })}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {slots.map((s) => (
                              <div
                                key={s.id}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                  s.is_booked
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {s.time_slot}
                                {s.is_booked ? ' 🔒' : (
                                  <button
                                    onClick={() => handleDeleteSlot(s.id)}
                                    className="ml-1 text-green-600 hover:text-red-500 transition-colors"
                                    title="Remove slot"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {rescheduleAppt && (
        <RescheduleModal
          appointment={rescheduleAppt}
          onClose={() => setRescheduleAppt(null)}
          onDone={loadAppointments}
        />
      )}
      {cancelAppt && (
        <CancelModal
          appointment={cancelAppt}
          onClose={() => setCancelAppt(null)}
          onDone={loadAppointments}
        />
      )}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          isOpen={isPatientModalOpen}
          onClose={() => { setIsPatientModalOpen(false); setSelectedPatient(null); }}
          userRole="doctor"
          onMarkUrgent={handleMarkUrgent}
          onRequestAppointment={async (patientId: string) => {
              const result = await api.requestAppointment(
                parseInt(patientId),
                user?.name ? `Dr. ${user.name}` : 'A doctor',
              );
              if (result.status === 'success') {
              toast.success('Request sent to admin');
              setIsPatientModalOpen(false);
              } else {
                toast.error(result.message || 'Failed to send request');
              }
          }}
        />
      )}
    </div>
  );
}