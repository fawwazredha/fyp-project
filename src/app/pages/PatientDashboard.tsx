import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAssessment } from '../context/AssessmentContext';
import { NotificationBell } from '../components/NotificationBell';
import { toast } from 'sonner';
import {
  Calendar,
  Activity,
  Clock,
  AlertCircle,
  FileText,
  Plus,
  User,
  X,
  RefreshCw,
} from 'lucide-react';
import * as api from '../services/api';

interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'cancelled'
    | 'rescheduled'
    | 'patient_proposed';
  notes?: string;
  newDate?: string;
  newTime?: string;
  proposalReason?: string;
}

export function PatientDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { allResults, fetchUserResults, isLoading: assessmentsLoading } = useAssessment();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalDate, setProposalDate] = useState('');
  const [proposalTime, setProposalTime] = useState('');
  const [proposalReason, setProposalReason] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Filter assessments for current user (safety measure)
  const userAssessments = allResults.filter(
    assessment => assessment.userId === user?.id
  );

  // Fetch appointments
  const fetchAppointmentsFromAPI = async (userId: string) => {
    try {
      setAppointmentsLoading(true);
      const appointmentsData = await api.getPatientAppointments(parseInt(userId));
      const formattedAppointments = appointmentsData.map((apt) => ({
        id: apt.id?.toString() || '',
        doctorName: apt.doctor_name || 'Unknown Doctor',
        doctorSpecialty: apt.doctor_specialty || '',
        date: apt.date || '',
        time: apt.time_slot || '',
        status: apt.status || 'pending',
        notes: apt.notes || undefined,
        newDate: apt.new_date || undefined,
        newTime: apt.new_time || undefined,
        proposalReason: apt.reject_reason || undefined,
      }));

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Failed to fetch appointments from API:', error);
      
      // fallback localStorage
      const storedAppointments = JSON.parse(
        localStorage.getItem('appointments') || '[]'
      );

      const userAppointments = storedAppointments.filter(
        (apt: any) => apt.patientId === userId
      );

      setAppointments(userAppointments);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Load all data
  const loadAllData = async () => {
    if (!user?.id) return;
    
    console.log('Loading data for user:', user.id);
    await Promise.all([
      fetchUserResults(user.id),
      fetchAppointmentsFromAPI(user.id)
    ]);
    setDataLoaded(true);
  };

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== 'patient') {
      navigate('/login');
      return;
    }

    loadAllData();

    const handleAppointmentBooked = () => {
      fetchAppointmentsFromAPI(user.id);
    };

    const handleStatusChanged = () => {
      fetchAppointmentsFromAPI(user.id);
    };

    window.addEventListener('appointmentBooked', handleAppointmentBooked);
    window.addEventListener('appointmentStatusChanged', handleStatusChanged);

    const pollInterval = setInterval(() => {
      if (user?.id) {
        fetchAppointmentsFromAPI(user.id);
      }
    }, 60000); // Increased to 30 seconds

    return () => {
      window.removeEventListener('appointmentBooked', handleAppointmentBooked);
      window.removeEventListener('appointmentStatusChanged', handleStatusChanged);
      clearInterval(pollInterval);
    };
  }, [isAuthenticated, user, navigate, authLoading]);

  // Loading screen
  if (authLoading || !dataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rescheduled':
        return 'bg-blue-100 text-blue-800';
      case 'patient_proposed':
        return 'bg-indigo-100 text-indigo-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const acceptAppointment = async (appointmentId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/${appointmentId}/accept`,
        {
          method: 'PATCH',
        }
      );

      if (res.ok) {
        toast.success('Appointment accepted — doctor and admin notified');
        fetchAppointmentsFromAPI(user?.id || '');
        window.dispatchEvent(new Event('appointmentStatusChanged'));
      } else {
        toast.error('Unable to accept appointment');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
  };

  const openProposalModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setProposalDate(appointment.newDate || '');
    setProposalTime(appointment.newTime || '');
    setProposalReason('');
    setIsProposalModalOpen(true);
  };

  const closeProposalModal = () => {
    setIsProposalModalOpen(false);
    setSelectedAppointment(null);
    setProposalDate('');
    setProposalTime('');
    setProposalReason('');
  };

  const submitProposal = async () => {
    if (!selectedAppointment) return;

    if (!proposalDate || !proposalTime) {
      toast.error('Select a new date and time');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/${selectedAppointment.id}/propose`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            new_date: proposalDate,
            new_time: proposalTime,
            reason: proposalReason,
          }),
        }
      );

      if (res.ok) {
        toast.success('New time proposed — doctor and admin notified');
        fetchAppointmentsFromAPI(user?.id || '');
        window.dispatchEvent(new Event('appointmentStatusChanged'));
        closeProposalModal();
      } else {
        toast.error('Failed to propose a new time');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
  };

  const refreshAssessments = async () => {
    if (user?.id) {
      toast.info('Refreshing assessments...');
      await fetchUserResults(user.id);
      toast.success('Assessments refreshed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 lg:py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {/* HEADER + QUICK ACTIONS */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-6">

          {/* LEFT SIDE */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>

            <p className="text-gray-600 mt-2">
              Manage your health assessments and appointments
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col items-end gap-3">

            {/* Notification */}
            <NotificationBell />

            {/* SMALL QUICK ACTIONS */}
            <div className="flex flex-wrap gap-2 justify-end">

              <Link
                to="/assessment"
                className="flex items-center gap-2 px-3 py-2 bg-[#3A86FF] text-white rounded-xl text-sm hover:bg-[#2E6FD9] transition-colors shadow-sm"
              >
                <Activity className="w-4 h-4" />
                Assessment
              </Link>

              <Link
                to="/book-appointment"
                className="flex items-center gap-2 px-3 py-2 bg-[#2EC4B6] text-white rounded-xl text-sm hover:opacity-90 transition-colors shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                Appointment
              </Link>

              <Link
                to="/patient-profile"
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 transition-colors shadow-sm"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>

            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Total Assessments
                </p>

                <p className="text-3xl font-bold text-gray-900">
                  {assessmentsLoading ? '...' : userAssessments.length}
                </p>
              </div>

              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#3A86FF]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Upcoming Appointments
                </p>

                <p className="text-3xl font-bold text-gray-900">
                  {appointmentsLoading ? '...' : appointments.filter((a) => a.status !== 'cancelled').length}
                </p>
              </div>

              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#2EC4B6]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Latest Risk Level
                </p>

                <p
                  className={`text-2xl font-bold capitalize ${
                    userAssessments.length > 0
                      ? getRiskColor(userAssessments[0].riskLevel)
                      : 'text-gray-400'
                  }`}
                >
                  {userAssessments.length > 0
                    ? userAssessments[0].riskLevel
                    : 'No data'}
                </p>
              </div>

              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid lg:grid-cols-2 gap-4">

          {/* Appointments Container */}
          <div className="bg-white rounded-2xl shadow-lg p-4">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#3A86FF]" />
                Upcoming Appointments
              </h2>

              <Link
                to="/book-appointment"
                className="flex items-center gap-1 text-[#3A86FF] hover:underline text-sm"
              >
                <Plus className="w-4 h-4" />
                Book New
              </Link>
            </div>

            {appointmentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No appointments scheduled
                </p>
                <Link
                  to="/book-appointment"
                  className="inline-block px-6 py-3 bg-[#3A86FF] text-white rounded-lg hover:bg-[#2E6FD9] transition-colors"
                >
                  Book Your First Appointment
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {appointment.doctorName}
                        </h3>

                        <p className="text-sm text-gray-600">
                          {appointment.doctorSpecialty}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>

                    {/* Original Appointment */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {appointment.time}
                      </div>
                    </div>

                    {/* Doctor Rescheduled */}
                    {appointment.status === 'rescheduled' &&
                      appointment.newDate &&
                      appointment.newTime && (
                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <RefreshCw className="w-4 h-4 text-blue-600" />

                            <span className="font-semibold text-blue-700">
                              Doctor proposed a new appointment time
                            </span>
                          </div>

                          <div className="text-sm text-blue-700 space-y-1">
                            <p>
                              <strong>New Date:</strong>{' '}
                              {new Date(
                                appointment.newDate
                              ).toLocaleDateString()}
                            </p>

                            <p>
                              <strong>New Time:</strong>{' '}
                              {appointment.newTime}
                            </p>

                            {appointment.proposalReason && (
                              <p>
                                <strong>Reason:</strong>{' '}
                                {appointment.proposalReason}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Patient Proposed */}
                    {appointment.status === 'patient_proposed' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() =>
                            acceptAppointment(appointment.id)
                          }
                          className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
                        >
                          Accept Proposed Time
                        </button>
                      </div>
                    )}

                    {/* Doctor Proposed New Time */}
                    {appointment.status === 'rescheduled' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() =>
                            acceptAppointment(appointment.id)
                          }
                          className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
                        >
                          Accept New Time
                        </button>

                        <button
                          onClick={() =>
                            openProposalModal(appointment)
                          }
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600"
                        >
                          Suggest Another Time
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assessment History */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#3A86FF]" />
                Assessment History
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={refreshAssessments}
                  className="flex items-center gap-1 text-[#3A86FF] hover:underline text-sm"
                  disabled={assessmentsLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${assessmentsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <Link
                  to="/assessment"
                  className="flex items-center gap-1 text-[#3A86FF] hover:underline text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Assessment
                </Link>
              </div>
            </div>

            {assessmentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : userAssessments.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No assessments completed yet
                </p>
                <Link
                  to="/assessment"
                  className="inline-block px-6 py-3 bg-[#3A86FF] text-white rounded-lg hover:bg-[#2E6FD9] transition-colors"
                >
                  Take Your First Assessment
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {userAssessments.slice(0, 5).map((result, index) => (
                  <div
                    key={result.id || index}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle
                          className={`w-5 h-5 ${getRiskColor(result.riskLevel)}`}
                        />
                        <span className="font-semibold text-gray-900 capitalize">
                          {result.riskLevel} Risk
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(result.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            result.riskLevel === 'low'
                              ? 'bg-green-500'
                              : result.riskLevel === 'moderate'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${result.riskPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {result.riskPercentage}%
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {result.explanation}
                    </p>

                    {result.bmi && (
                      <p className="text-xs text-gray-500 mt-2">
                        BMI: {result.bmi}
                      </p>
                    )}
                  </div>
                ))}

                {userAssessments.length > 5 && (
                  <button
                    onClick={() => navigate('/assessment-history')}
                    className="w-full text-center text-sm text-[#3A86FF] hover:underline py-2"
                  >
                    View all {userAssessments.length} assessments →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isProposalModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Propose a New Time
                </h2>
                <p className="text-sm text-gray-500">
                  Suggested time for {selectedAppointment.doctorName}
                </p>
              </div>
              <button
                onClick={closeProposalModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={proposalDate}
                  onChange={(e) => setProposalDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Time
                </label>
                <input
                  type="time"
                  value={proposalTime}
                  onChange={(e) => setProposalTime(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reason (optional)
                </label>
                <textarea
                  value={proposalReason}
                  onChange={(e) => setProposalReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
                  placeholder="Why this new time works better for you"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeProposalModal}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitProposal}
                  className="flex-1 py-2.5 bg-[#3A86FF] text-white rounded-xl text-sm font-semibold hover:bg-[#2E6FD9] transition-colors"
                >
                  Submit Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}