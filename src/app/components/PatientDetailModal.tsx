import { X, User, Phone, Mail, MapPin, Calendar, AlertTriangle, Activity, FileText } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { PatientRecord } from '../utils/mockData';

interface PatientDetailModalProps {
  patient: PatientRecord;
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'admin' | 'doctor';
  onMarkUrgent?: (patientId: string, notes: string) => void;
  onRequestAppointment?: (patientId: string) => void;
}

export function PatientDetailModal({
  patient,
  isOpen,
  onClose,
  userRole,
  onMarkUrgent,
  onRequestAppointment,
}: PatientDetailModalProps) {

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':      return 'text-green-600 bg-green-100 border-green-300';
      case 'moderate': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'high':     return 'text-red-600 bg-red-100 border-red-300';
      default:         return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'Not provided') return 'Not provided';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  };

  const d = patient.assessmentData;

  // ── BMI recalculated from raw height/weight so it's always accurate ───────
  const displayBMI = (() => {
    if (d.bmi) return d.bmi;
    if (d.height && d.weight && d.height > 0 && d.weight > 0) {
      const hm = d.height / 100;
      return parseFloat((d.weight / (hm * hm)).toFixed(1));
    }
    return null;
  })();

  const bmiCategory = (() => {
    if (displayBMI === null) return null;
    if (displayBMI < 18.5) return 'Underweight';
    if (displayBMI < 25)   return 'Normal';
    if (displayBMI < 30)   return 'Overweight';
    return 'Obese';
  })();

  const ageGroupLabel: Record<string, string> = {
    below30:  'Below 30',
    '30to45': '30–45',
    '46to60': '46–60',
    above60:  'Above 60',
  };

  const exerciseLabel: Record<string, string> = {
    rarely:    'Rarely / Never',
    sometimes: '1–2 times / week',
    frequent:  '3+ times / week',
  };

  const waterLabel: Record<string, string> = {
    low:    'Less than 1 litre',
    medium: '1–2 litres',
    high:   'More than 2 litres',
  };

  const fruitsLabel: Record<string, string> = {
    rarely:    'Rarely',
    sometimes: 'Sometimes',
    daily:     'Daily',
  };

  const yesNo = (val: boolean | undefined) =>
    val === true ? 'Yes' : val === false ? 'No' : 'Not answered';

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden z-50">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] p-4 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-bold">
                    {patient.credentials.name}
                  </Dialog.Title>
                  <p className="text-xs text-white/90">Patient ID: {patient.id}</p>
                </div>
              </div>
              <Dialog.Close className="text-white/80 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </Dialog.Close>
            </div>
            {patient.isUrgent && (
              <div className="mt-3 bg-red-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold text-xs">URGENT CASE</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs.Root defaultValue="results" className="flex flex-col h-[calc(90vh-200px)]">
            <Tabs.List className="flex border-b border-gray-200 px-6 bg-gray-50">
              <Tabs.Trigger
                value="results"
                className="px-6 py-4 text-gray-600 border-b-2 border-transparent data-[state=active]:border-[#3A86FF] data-[state=active]:text-[#3A86FF] transition-colors"
              >
                <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Results</div>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="questionnaire"
                className="px-6 py-4 text-gray-600 border-b-2 border-transparent data-[state=active]:border-[#3A86FF] data-[state=active]:text-[#3A86FF] transition-colors"
              >
                <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Questionnaire</div>
              </Tabs.Trigger>
              <Tabs.Trigger
                value="info"
                className="px-6 py-4 text-gray-600 border-b-2 border-transparent data-[state=active]:border-[#3A86FF] data-[state=active]:text-[#3A86FF] transition-colors"
              >
                <div className="flex items-center gap-2"><User className="w-4 h-4" /> Patient Info</div>
              </Tabs.Trigger>
            </Tabs.List>

            <div className="flex-1 overflow-y-auto">

              {/* ── Results Tab ───────────────────────────────────────────── */}
              <Tabs.Content value="results" className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3">CKD Risk Assessment</h3>
                    <div className={`border-2 rounded-xl p-4 ${getRiskColor(patient.assessmentResult.riskLevel)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold capitalize">{patient.assessmentResult.riskLevel} Risk</span>
                        <span className="text-3xl font-bold">{patient.assessmentResult.riskPercentage}%</span>
                      </div>
                      <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${
                            patient.assessmentResult.riskLevel === 'low'      ? 'bg-green-600' :
                            patient.assessmentResult.riskLevel === 'moderate' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${patient.assessmentResult.riskPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Explanation</h4>
                    <p className="text-gray-700">{patient.assessmentResult.explanation}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {patient.assessmentResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex gap-3">
                          <div className="w-6 h-6 bg-[#3A86FF] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {patient.isUrgent && patient.urgentNotes && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-red-900 mb-1">Doctor's Urgent Notes</h4>
                          <p className="text-red-800 mb-2">{patient.urgentNotes}</p>
                          {patient.flaggedByDoctor && (
                            <p className="text-sm text-red-700">Flagged by: {patient.flaggedByDoctor}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Tabs.Content>

              {/* ── Questionnaire Tab ─────────────────────────────────────── */}
              <Tabs.Content value="questionnaire" className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Assessment Answers</h3>

                {/* Step 1 */}
                <Section title="Step 1 — Demographic Information">
                  <Row label="Age Group" value={ageGroupLabel[d.ageGroup ?? ''] || 'Not answered'} />
                  <Row label="Gender"    value={d.gender || 'Not answered'} />
                  <Row label="Height"    value={d.height ? `${d.height} cm` : 'Not answered'} />
                  <Row label="Weight"    value={d.weight ? `${d.weight} kg` : 'Not answered'} />

                  {/* BMI shown with formula breakdown */}
                  <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          BMI — Body Mass Index
                        </p>
                        {d.height && d.weight ? (
                          <p className="text-xs text-blue-600 mt-0.5">
                            {d.weight} kg ÷ ({(d.height / 100).toFixed(2)} m)²
                            {' = '}
                            {d.weight} ÷ {((d.height / 100) * (d.height / 100)).toFixed(4)}
                          </p>
                        ) : (
                          <p className="text-xs text-blue-500 mt-0.5">Height and weight not recorded</p>
                        )}
                      </div>
                      <div className="text-right">
                        {displayBMI !== null ? (
                          <>
                            <span className="text-3xl font-bold text-blue-900">{displayBMI}</span>
                            <p className={`text-sm font-semibold mt-0.5 ${
                              bmiCategory === 'Obese'       ? 'text-red-600'    :
                              bmiCategory === 'Overweight'  ? 'text-yellow-600' :
                              bmiCategory === 'Underweight' ? 'text-blue-600'   :
                                                              'text-green-600'
                            }`}>
                              {bmiCategory}
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">Not calculated</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Step 2 */}
                <Section title="Step 2 — Lifestyle Factors">
                  <Row label="Smoking"           value={yesNo(d.smoking)}  highlight={d.smoking  ? 'red' : d.smoking  === false ? 'green' : undefined} />
                  <Row label="Alcohol"            value={yesNo(d.alcohol)}  highlight={d.alcohol  ? 'red' : d.alcohol  === false ? 'green' : undefined} />
                  <Row label="Exercise frequency" value={exerciseLabel[d.exercise ?? ''] || 'Not answered'} highlight={d.exercise === 'rarely' ? 'red' : d.exercise === 'frequent' ? 'green' : undefined} />
                  <Row label="Daily water intake" value={waterLabel[d.water ?? ''] || 'Not answered'}       highlight={d.water === 'low' ? 'red' : d.water === 'high' ? 'green' : undefined} />
                </Section>

                {/* Step 3 */}
                <Section title="Step 3 — Dietary Habits">
                  <Row label="Salty foods"        value={yesNo(d.saltyFoods)}   highlight={d.saltyFoods   ? 'red' : d.saltyFoods   === false ? 'green' : undefined} />
                  <Row label="Fast food"           value={yesNo(d.fastFood)}     highlight={d.fastFood     ? 'red' : d.fastFood     === false ? 'green' : undefined} />
                  <Row label="Sugary drinks"       value={yesNo(d.sugaryDrinks)} highlight={d.sugaryDrinks ? 'red' : d.sugaryDrinks === false ? 'green' : undefined} />
                  <Row label="Fruits & vegetables" value={fruitsLabel[d.fruits ?? ''] || 'Not answered'} highlight={d.fruits === 'rarely' ? 'red' : d.fruits === 'daily' ? 'green' : undefined} />
                </Section>

                {/* Step 4 */}
                <Section title="Step 4 — Medical History & Symptoms">
                  <Row label="Diabetes"                         value={yesNo(d.diabetes ?? d.hasDiabetes)}   highlight={(d.diabetes ?? d.hasDiabetes)   ? 'red' : (d.diabetes ?? d.hasDiabetes)   === false ? 'green' : undefined} />
                  <Row label="Hypertension"                     value={yesNo(d.hypertension ?? d.hasHighBP)} highlight={(d.hypertension ?? d.hasHighBP) ? 'red' : (d.hypertension ?? d.hasHighBP) === false ? 'green' : undefined} />
                  <Row label="Family history of kidney disease" value={yesNo(d.familyHistory)}     highlight={d.familyHistory     ? 'red' : d.familyHistory     === false ? 'green' : undefined} />
                  <Row label="Frequent painkiller use"          value={yesNo(d.painkillers)}        highlight={d.painkillers        ? 'red' : d.painkillers        === false ? 'green' : undefined} />
                  <Row label="Kidney stones / UTIs"             value={yesNo(d.kidneyIssues)}       highlight={d.kidneyIssues       ? 'red' : d.kidneyIssues       === false ? 'green' : undefined} />
                  <Row label="Swelling (legs/feet/ankles)"      value={yesNo(d.swelling)}           highlight={d.swelling           ? 'red' : d.swelling           === false ? 'green' : undefined} />
                  <Row label="Foamy urine"                      value={yesNo(d.foamyUrine)}         highlight={d.foamyUrine         ? 'red' : d.foamyUrine         === false ? 'green' : undefined} />
                  <Row label="Fatigue"                          value={yesNo(d.fatigue)}            highlight={d.fatigue            ? 'red' : d.fatigue            === false ? 'green' : undefined} />
                  <Row label="Frequent urination at night"      value={yesNo(d.frequentUrination)}  highlight={d.frequentUrination  ? 'red' : d.frequentUrination  === false ? 'green' : undefined} />
                </Section>
              </Tabs.Content>

              {/* ── Patient Info Tab ──────────────────────────────────────── */}
              <Tabs.Content value="info" className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-[#3A86FF] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900">{patient.credentials.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-[#3A86FF] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-900">{patient.credentials.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-[#3A86FF] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="font-semibold text-gray-900">{patient.credentials.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-[#3A86FF] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="font-semibold text-gray-900">{patient.credentials.address || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-[#3A86FF] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                      <p className="font-semibold text-gray-900">
                        {patient.credentials.dateOfBirth
                          ? formatDate(patient.credentials.dateOfBirth)
                          : 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-[#3A86FF] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Emergency Contact</p>
                      <p className="font-semibold text-gray-900">{patient.credentials.emergencyContact || 'Not provided'}</p>
                    </div>
                  </div>

                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Assessment Date:</strong>{' '}
                    {new Date(patient.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  {patient.updatedAt !== patient.createdAt && (
                    <p className="text-sm text-blue-900 mt-1">
                      <strong>Last Updated:</strong>{' '}
                      {new Date(patient.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </Tabs.Content>

            </div>
          </Tabs.Root>

          {/* Footer */}
          {userRole && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex gap-3 justify-end">
                {userRole === 'doctor' && !patient.isUrgent && onMarkUrgent && (
                  <button
                    onClick={() => {
                      const notes = prompt('Enter urgent notes:');
                      if (notes) onMarkUrgent(patient.id, notes);
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Mark as Urgent
                  </button>
                )}
                {userRole === 'doctor' && onRequestAppointment && (
                  <button
                    onClick={() => onRequestAppointment(patient.id)}
                    className="px-6 py-2 bg-[#3A86FF] text-white rounded-lg hover:bg-[#2E6FD9] transition-colors"
                  >
                    Request Admin: Create Appointment
                  </button>
                )}
              </div>
            </div>
          )}

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 pb-1 border-b border-gray-200">
        {title}
      </h4>
      <div className="grid md:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label:      string;
  value:      string;
  highlight?: 'red' | 'yellow' | 'green';
}) {
  const valueClass =
    highlight === 'red'    ? 'text-red-600 font-semibold'    :
    highlight === 'yellow' ? 'text-yellow-600 font-semibold' :
    highlight === 'green'  ? 'text-green-600 font-semibold'  :
                             'text-gray-900 font-semibold';
  return (
    <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center gap-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}