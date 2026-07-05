// src/app/components/DoctorAvailabilityModal.tsx
import { useEffect, useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Calendar, Plus,
  Loader2, Trash2, Stethoscope, CalendarClock,
} from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface DoctorUser {
  id: number;
  name: string;
  email: string;
  role: string;
  specialty?: string;
}

interface AvailabilitySlot {
  id: number;
  date: string;
  time_slot: string;
  is_booked: boolean;
}

// Same slot set the doctor uses, so admin-set and doctor-set hours stay consistent
const ALL_TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
];

// ─────────────────────────────────────────────────────────────────────────────
// Mini calendar — pick a date, then toggle the time slots for it
// ─────────────────────────────────────────────────────────────────────────────
function AvailabilityCalendar({
  existingSlots,
  onAddSlots,
  onDeleteSlot,
}: {
  existingSlots: AvailabilitySlot[];
  onAddSlots: (date: string, slots: string[]) => Promise<void>;
  onDeleteSlot: (slotId: number) => Promise<void>;
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

    // Remove any slots the admin unticked (only if not already booked)
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
// Main modal — admin picks a doctor, then sets that doctor's hours
// ─────────────────────────────────────────────────────────────────────────────
export function DoctorAvailabilityModal({ onClose }: { onClose: () => void }) {
  const [doctors, setDoctors]                 = useState<DoctorUser[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [availability, setAvailability]       = useState<AvailabilitySlot[]>([]);
  const [loadingDoctors, setLoadingDoctors]   = useState(true);
  const [loadingSlots, setLoadingSlots]       = useState(false);

  // Load the list of doctors once
  useEffect(() => {
    (async () => {
      try {
        const users = await api.getUsers();
        setDoctors((users as DoctorUser[]).filter((u) => u.role === 'doctor'));
      } catch (err) {
        console.error('Failed to load doctors', err);
        toast.error('Failed to load doctors');
      } finally {
        setLoadingDoctors(false);
      }
    })();
  }, []);

  const loadAvailability = async (doctorId: number) => {
    setLoadingSlots(true);
    try {
      const data = await api.getDoctorAvailability(doctorId);
      setAvailability(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load availability', err);
      toast.error('Failed to load availability');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectDoctor = (id: number) => {
    setSelectedDoctorId(id);
    if (id) loadAvailability(id);
    else setAvailability([]);
  };

  const handleAddSlots = async (date: string, slots: string[]) => {
    if (!selectedDoctorId) return;
    await api.addDoctorAvailability(selectedDoctorId, date, slots);
    await loadAvailability(selectedDoctorId);
  };

  const handleDeleteSlot = async (slotId: number) => {
    await api.deleteAvailabilitySlot(slotId);
    if (selectedDoctorId) await loadAvailability(selectedDoctorId);
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-[#3A86FF]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Set Doctor Availability</h2>
            <p className="text-sm text-gray-500">
              Choose a doctor and open the time slots patients can book.
            </p>
          </div>
        </div>

        {/* Doctor picker */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Doctor</label>
          {loadingDoctors ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading doctors...
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-3">
              No doctor accounts yet. Add one from "Add Staff" first.
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Stethoscope className="h-4 w-4 text-[#2EC4B6]" />
              </div>
              <select
                value={selectedDoctorId ?? ''}
                onChange={(e) => handleSelectDoctor(Number(e.target.value))}
                className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent transition-all"
              >
                <option value="">— Choose a doctor —</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.specialty ? ` · ${d.specialty}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Calendar + slot list */}
        {!selectedDoctorId ? (
          <div className="text-center py-14 text-gray-400 border border-dashed border-gray-200 rounded-xl">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a doctor above to manage their available slots.</p>
          </div>
        ) : loadingSlots ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#3A86FF]" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Calendar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#3A86FF]" />
                Set Slots for {selectedDoctor?.name}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Click a date to add or remove time slots. Green dates already have slots.
                Locked slots (🔒) are already booked by patients and can't be removed.
              </p>
              <AvailabilityCalendar
                existingSlots={availability}
                onAddSlots={handleAddSlots}
                onDeleteSlot={handleDeleteSlot}
              />
            </div>

            {/* Upcoming slots */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#3A86FF]" /> Upcoming Slots
              </h3>
              {availability.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No slots added yet.</p>
                  <p className="text-xs mt-1">Use the calendar to add availability.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
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
    </div>
  );
}