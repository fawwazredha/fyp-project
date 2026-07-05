import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar as CalendarIcon, Clock, User, CheckCircle2,
  MapPin, Search, ArrowLeft, Building2, Stethoscope,
  ChevronLeft, ChevronRight, Navigation
} from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../services/api';
import { CLINICS_DATA, type Clinic } from '../data/clinicsData';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface AvailabilitySlot { id: number; date: string; time_slot: string; is_booked: boolean; }
interface Doctor { id: number; name: string; specialty: string; availability: AvailabilitySlot[]; }

// ─────────────────────────────────────────────────────────────────────────────
// Malaysia states & districts data
// ─────────────────────────────────────────────────────────────────────────────
const MALAYSIA_STATES: Record<string, string[]> = {
  'Johor':           ['Johor Bahru','Muar','Batu Pahat','Kluang','Segamat','Kota Tinggi','Mersing','Pontian','Tangkak'],
  'Kedah':           ['Alor Setar','Sungai Petani','Kulim','Langkawi','Baling','Pendang','Kota Setar'],
  'Kelantan':        ['Kota Bharu','Pasir Mas','Tanah Merah','Machang','Kuala Krai','Jeli','Gua Musang'],
  'Kuala Lumpur':    ['Chow Kit','Bangsar','Cheras','Kepong','Setiawangsa','Titiwangsa','Lembah Pantai'],
  'Labuan':          ['Victoria'],
  'Melaka':          ['Melaka Tengah','Alor Gajah','Jasin'],
  'Negeri Sembilan': ['Seremban','Port Dickson','Nilai','Rembau','Jempol','Tampin','Jelebu'],
  'Pahang':          ['Kuantan','Temerloh','Bentong','Raub','Jerantut','Pekan','Cameron Highlands'],
  'Penang':          ['Georgetown','Seberang Perai','Bayan Lepas','Balik Pulau','Butterworth','Bukit Mertajam'],
  'Perak':           ['Ipoh','Taiping','Teluk Intan','Lumut','Manjung','Kuala Kangsar','Sitiawan'],
  'Perlis':          ['Kangar','Arau','Padang Besar'],
  'Putrajaya':       ['Putrajaya'],
  'Sabah':           ['Kota Kinabalu','Sandakan','Tawau','Lahad Datu','Keningau','Semporna','Kudat'],
  'Sarawak':         ['Kuching','Miri','Sibu','Bintulu','Limbang','Sri Aman','Mukah'],
  'Selangor':        ['Shah Alam','Petaling Jaya','Klang','Subang Jaya','Kajang','Sepang','Hulu Langat'],
  'Terengganu':      ['Kuala Terengganu','Kemaman','Dungun','Besut','Marang','Setiu','Hulu Terengganu'],
};

// Clinic & hospital data is generated from OpenStreetMap (© OpenStreetMap
// contributors) via the Overpass API and imported from ../data/clinicsData.
// Regenerate the dataset with: python fetch_clinics.py

// ─────────────────────────────────────────────────────────────────────────────
// Mini calendar component
// ─────────────────────────────────────────────────────────────────────────────
function DateCalendar({
  availableDates,
  selectedDate,
  onSelect,
}: {
  availableDates: string[];
  selectedDate: string;
  onSelect: (d: string) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 select-none">
      {/* Nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-900 text-sm">{monthName}</span>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const dateStr  = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dateObj  = new Date(viewYear, viewMonth, day);
          const isPast   = dateObj < today;
          const isAvail  = availableDates.includes(dateStr);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              disabled={isPast || !isAvail}
              onClick={() => onSelect(dateStr)}
              className={`
                w-full aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                ${!isPast && !isAvail ? 'text-gray-400 cursor-not-allowed' : ''}
                ${isAvail && !isSelected ? 'bg-blue-50 text-[#3A86FF] hover:bg-blue-100 cursor-pointer' : ''}
                ${isSelected ? 'bg-[#3A86FF] text-white shadow-md' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-50 border border-[#3A86FF]" /> Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#3A86FF]" /> Selected</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Clinic finder (Leaflet map via CDN)
// ─────────────────────────────────────────────────────────────────────────────
function ClinicFinder({ onBack }: { onBack: () => void }) {
  const [selectedState, setSelectedState]       = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [clinics, setClinics]                   = useState<Clinic[]>([]);
  const [mapReady, setMapReady]                 = useState(false);
  const [searched, setSearched]                 = useState(false);
  const mapId = 'clinic-map';

  const districts = selectedState ? MALAYSIA_STATES[selectedState] ?? [] : [];

  const handleSearch = () => {
    if (!selectedState) { toast.error('Please select a state first'); return; }
    const all = CLINICS_DATA[selectedState] ?? [];
    const found = selectedDistrict
      ? all.filter((c) => c.district === selectedDistrict)
      : all;
    setClinics(found);
    setSearched(true);
    setMapReady(false);
    if (found.length > 0) setTimeout(() => initMap(found), 300);
  };

  const initMap = (clinicList: Clinic[]) => {
    // @ts-ignore
    if (typeof window.L === 'undefined') { setMapReady(false); return; }
    const container = document.getElementById(mapId);
    if (!container) return;

    // @ts-ignore
    if (container._leaflet_id) { container._leaflet_id = null; container.innerHTML = ''; }

    const center = clinicList[0];
    // @ts-ignore
    const map = window.L.map(mapId).setView([center.lat, center.lng], 12);
    // @ts-ignore
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    clinicList.forEach((c) => {
      // @ts-ignore
      const icon = window.L.divIcon({
        className: '',
        html: `<div style="
          background:${c.type === 'hospital' ? '#3A86FF' : '#2EC4B6'};
          color:white; border-radius:50%; width:28px; height:28px;
          display:flex; align-items:center; justify-content:center;
          font-size:14px; box-shadow:0 2px 8px rgba(0,0,0,.3)">
          ${c.type === 'hospital' ? '🏥' : '🏥'}
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      // @ts-ignore
      window.L.marker([c.lat, c.lng], { icon })
        .addTo(map)
        .bindPopup(`<strong>${c.name}</strong><br>${c.address}`);
    });
    setMapReady(true);
  };

  // Load Leaflet CSS + JS
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id   = 'leaflet-css';
      link.rel  = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script    = document.createElement('script');
      script.id       = 'leaflet-js';
      script.src      = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.async    = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-[#3A86FF] hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to appointment booking
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#3A86FF]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Find Nearby Clinics & Hospitals</h2>
            <p className="text-sm text-gray-500">Search by state and district across Malaysia</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); setClinics([]); setMapReady(false); setSearched(false); }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
            >
              <option value="">Select state...</option>
              {Object.keys(MALAYSIA_STATES).sort().map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">District (optional)</label>
            <select
              value={selectedDistrict}
              onChange={(e) => { setSelectedDistrict(e.target.value); setClinics([]); setMapReady(false); setSearched(false); }}
              disabled={!selectedState}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent disabled:opacity-50"
            >
              <option value="">All districts</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] text-white rounded-lg font-semibold hover:shadow-md transition-all"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        {/* Map */}
        {clinics.length > 0 && (
          <div id={mapId} className="w-full rounded-xl overflow-hidden border border-gray-200" style={{ height: 360 }} />
        )}

        {/* Clinic cards */}
        {clinics.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-gray-900">
              {clinics.length} locations found in {selectedState}
              {selectedDistrict ? ` · ${selectedDistrict}` : ''}
            </h3>
            {clinics.map((c, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  c.type === 'hospital' ? 'bg-blue-100' : 'bg-teal-100'
                }`}>
                  {c.type === 'hospital'
                    ? <Building2 className="w-5 h-5 text-[#3A86FF]" />
                    : <Stethoscope className="w-5 h-5 text-[#2EC4B6]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900">{c.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.type === 'hospital'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-teal-100 text-teal-700'
                    }`}>
                      {c.type === 'hospital' ? 'Hospital' : 'Clinic'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" /> {c.address}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#3A86FF] hover:underline shrink-0 mt-1"
                >
                  <Navigation className="w-3 h-3" />
                  Directions
                </a>
              </div>
            ))}
          </div>
        )}

        {clinics.length === 0 && searched && (
          <div className="mt-4 text-center py-8 text-gray-400">
            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              No clinics found in {selectedDistrict ? `${selectedDistrict}, ` : ''}{selectedState}.
              {selectedDistrict ? ' Try "All districts" to see every clinic in the state.' : ''}
            </p>
          </div>
        )}

        {clinics.length === 0 && !searched && selectedState && (
          <div className="mt-4 text-center py-8 text-gray-400">
            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Click Search to find clinics in {selectedState}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main BookAppointment component
// ─────────────────────────────────────────────────────────────────────────────
export function BookAppointment() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]     = useState<'choice' | 'clinic' | 'book'>('choice');
  const [doctors, setDoctors]     = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate]     = useState('');
  const [selectedTime, setSelectedTime]     = useState('');
  const [notes, setNotes]                   = useState('');
  const [step, setStep]                     = useState(1);
  const [confirmed, setConfirmed]           = useState(false);
  const [booking, setBooking]               = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchDoctors();
  }, [isAuthenticated]);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const doctorsList = await api.getDoctors();
      // Fetch availability for each doctor
      const doctorsWithAvailability = await Promise.all(
        doctorsList.map(async (doctor) => ({
          ...doctor,
          availability: await api.getDoctorAvailability(doctor.id),
        }))
      );
      setDoctors(doctorsWithAvailability as Doctor[]);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      toast.error('Could not load doctors. Is the server running?');
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Unique available dates for selected doctor
  const availableDates = useMemo(() => {
    if (!selectedDoctor) return [];
    return [...new Set(
      selectedDoctor.availability
        .filter((s) => !s.is_booked)
        .map((s) => s.date)
    )];
  }, [selectedDoctor]);

  // Available time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];
    return selectedDoctor.availability
      .filter((s) => s.date === selectedDate && !s.is_booked)
      .map((s) => s.time_slot);
  }, [selectedDoctor, selectedDate]);

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !user?.id) return;
    setBooking(true);
    try {
      const result = await api.bookAppointment(
        parseInt(user.id),
        selectedDoctor.id,
        selectedDate,
        selectedTime,
        notes
      );
      
      if (result.status !== 'success') {
        toast.error(result.message || 'Booking failed');
        setBooking(false);
        return;
      }
      
      // Emit event for real-time updates
      window.dispatchEvent(new Event('appointmentBooked'));
      
      setConfirmed(true);
      toast.success('Appointment booked!');
    } catch (error) {
      console.error('Failed to book appointment:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  // ── Mode choice screen ──────────────────────────────────────────────────
  if (mode === 'choice') {
    return (
      <div className="min-h-screen bg-gray-50 py-6 lg:py-8 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
            <p className="text-gray-500 mt-2">Are you visiting our clinic or looking for one near you?</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Our clinic */}
            <button
              onClick={() => setMode('book')}
              className="group bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-[#3A86FF] p-6 text-left transition-all hover:shadow-xl"
            >
              <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-200 rounded-2xl flex items-center justify-center mb-5 transition-colors">
                <Stethoscope className="w-7 h-7 text-[#3A86FF]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Book at Our Clinic</h2>
              <p className="text-gray-500 text-sm">
                Schedule an appointment with our specialist doctors. Select your preferred doctor, date, and time.
              </p>
              <div className="mt-4 text-[#3A86FF] text-sm font-semibold">Get started →</div>
            </button>

            {/* Other clinics */}
            <button
              onClick={() => setMode('clinic')}
              className="group bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-[#2EC4B6] p-6 text-left transition-all hover:shadow-xl"
            >
              <div className="w-14 h-14 bg-teal-100 group-hover:bg-teal-200 rounded-2xl flex items-center justify-center mb-5 transition-colors">
                <MapPin className="w-7 h-7 text-[#2EC4B6]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Find a Clinic Near You</h2>
              <p className="text-gray-500 text-sm">
                Browse clinics and hospitals across Malaysia by state and district, with map directions.
              </p>
              <div className="mt-4 text-[#2EC4B6] text-sm font-semibold">Explore map →</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Clinic finder mode ──────────────────────────────────────────────────
  if (mode === 'clinic') {
    return (
      <div className="min-h-screen bg-gray-50 py-6 lg:py-8">
        <div className="w-full px-4">
          <ClinicFinder onBack={() => setMode('choice')} />
        </div>
      </div>
    );
  }

  // ── Confirmed screen ────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 lg:py-8 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment Requested!</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-3">
              <div>
                <p className="text-xs text-gray-500">Doctor</p>
                <p className="font-semibold text-gray-900">{selectedDoctor?.name}</p>
                <p className="text-sm text-gray-500">{selectedDoctor?.specialty}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-MY', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })} at {selectedTime}
                </p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Your request is pending the doctor's confirmation. You'll be notified once confirmed.
            </p>
            <Link to="/patient-dashboard" className="block w-full py-3 bg-[#3A86FF] text-white rounded-lg hover:bg-[#2E6FD9] transition-colors text-center font-semibold">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Booking flow (3 steps) ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-6 lg:py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-2">
          <button onClick={() => setMode('choice')} className="flex items-center gap-2 text-[#3A86FF] hover:underline text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="text-gray-600 mt-1">Schedule a consultation with our specialists</p>
        </div>

        {/* Steps */}
        <div className="my-6 flex items-center justify-center gap-4">
          {[{ num: 1, label: 'Select Doctor' }, { num: 2, label: 'Date & Time' }, { num: 3, label: 'Confirm' }].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step >= s.num ? 'bg-[#3A86FF] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s.num}
                </div>
                <span className="text-xs mt-1 text-gray-600 whitespace-nowrap">{s.label}</span>
              </div>
              {idx < 2 && <div className={`w-16 h-1 mx-2 transition-colors ${step > s.num ? 'bg-[#3A86FF]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Doctor list */}
        {step === 1 && (
          <div>
            {loadingDoctors ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No doctors available yet. Admin needs to add doctors first.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {doctors.map((doctor) => {
                  const openSlots = doctor.availability.filter((s) => !s.is_booked).length;
                  return (
                    <div
                      key={doctor.id}
                      onClick={() => { setSelectedDoctor(doctor); setSelectedDate(''); setSelectedTime(''); setStep(2); }}
                      className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 ${
                        selectedDoctor?.id === doctor.id ? 'ring-4 ring-[#3A86FF]' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="h-36 bg-gradient-to-br from-[#3A86FF] to-[#2EC4B6] flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                          {doctor.name.charAt(0)}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{doctor.name}</h3>
                        <p className="text-[#3A86FF] text-sm mb-3">{doctor.specialty || 'General'}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{openSlots} slot{openSlots !== 1 ? 's' : ''} available</span>
                        </div>
                        {openSlots === 0 && (
                          <p className="mt-2 text-xs text-red-500 font-medium">No availability yet</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Calendar + time */}
        {step === 2 && selectedDoctor && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <button onClick={() => setStep(1)} className="text-[#3A86FF] hover:underline text-sm mb-6 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Change Doctor
            </button>

            {/* Doctor preview */}
            <div className="flex items-center gap-4 mb-8 p-4 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3A86FF] to-[#2EC4B6] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {selectedDoctor.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedDoctor.name}</h3>
                <p className="text-sm text-gray-500">{selectedDoctor.specialty || 'General'}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Calendar */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#3A86FF]" /> Select Date
                </h4>
                {availableDates.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                    <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">This doctor has no available dates yet.</p>
                  </div>
                ) : (
                  <DateCalendar
                    availableDates={availableDates}
                    selectedDate={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); setSelectedTime(''); }}
                  />
                )}
              </div>

              {/* Time slots */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#3A86FF]" /> Select Time
                </h4>
                {!selectedDate ? (
                  <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Select a date to see time slots</p>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No times available for this date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          selectedTime === time
                            ? 'border-[#3A86FF] bg-blue-50 text-[#3A86FF]'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}

                {/* Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent text-sm"
                    placeholder="Any concerns or information for the doctor..."
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!selectedDate || !selectedTime}
              className="mt-8 w-full py-3 bg-[#3A86FF] text-white rounded-lg hover:bg-[#2E6FD9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Continue to Confirmation
            </button>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Your Appointment</h2>

            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-[#3A86FF] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Doctor</p>
                  <p className="font-semibold text-gray-900">{selectedDoctor?.name}</p>
                  <p className="text-sm text-gray-500">{selectedDoctor?.specialty}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <CalendarIcon className="w-5 h-5 text-[#3A86FF] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-MY', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <Clock className="w-5 h-5 text-[#3A86FF] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="font-semibold text-gray-900">{selectedTime}</p>
                </div>
              </div>

              {notes && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Your Notes</p>
                  <p className="text-gray-900 text-sm">{notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Go Back
              </button>
              <button
                onClick={handleBookAppointment}
                disabled={booking}
                className="flex-1 py-3 bg-[#3A86FF] text-white rounded-xl hover:bg-[#2E6FD9] transition-colors font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {booking
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Booking...</>
                  : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}