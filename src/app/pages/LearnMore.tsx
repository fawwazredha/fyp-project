import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  Droplet,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

/* ------------------------------------------------------------------ */
/*  Small reusable helpers (kept in-file so this stays a drop-in page) */
/* ------------------------------------------------------------------ */

// Fires once when an element scrolls into view.
function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// Wraps any block so it fades + slides up the first time it enters the viewport.
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'reveal-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Counts a number up from 0 when it first appears (used for the awareness stats).
function CountUp({
  end,
  duration = 1500,
  decimals = 0,
  suffix = '',
  prefix = '',
}: {
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    let raf = 0;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setVal(end * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

// NOTE: These awareness stats are for the public-facing page only.
// Confirm the exact figures against your cited sources before the viva
// (e.g. Malaysian prevalence from NHMS / Saminathan et al.; global figures from ISN/CDC).
const heroStats = [
  { value: 10, decimals: 0, suffix: '%', label: 'of adults worldwide live with CKD' },
  { value: 90, decimals: 0, suffix: '%', label: 'are unaware of it in the early stages' },
  { value: 15.5, decimals: 1, suffix: '%', label: 'estimated CKD prevalence in Malaysia' },
];

const stages = [
  {
    id: 1,
    name: 'Stage 1',
    gfr: '90+',
    fnPct: 100,
    severity: 'low' as const,
    title: 'Normal or high filtration',
    detail:
      'The kidneys still filter normally, but there are early signs of damage such as protein in the urine. Usually no symptoms — picked up only through testing.',
  },
  {
    id: 2,
    name: 'Stage 2',
    gfr: '60–89',
    fnPct: 75,
    severity: 'low' as const,
    title: 'Mild loss of function',
    detail:
      'A mild drop in filtering ability alongside kidney damage. Still often symptom-free — this is where controlling blood pressure and blood sugar matters most.',
  },
  {
    id: 3,
    name: 'Stage 3',
    gfr: '30–59',
    fnPct: 45,
    severity: 'moderate' as const,
    title: 'Moderate loss of function',
    detail:
      'Waste starts to build up. Early symptoms like tiredness, swelling, or changes in urination may appear. This is often the stage where CKD is first noticed.',
  },
  {
    id: 4,
    name: 'Stage 4',
    gfr: '15–29',
    fnPct: 22,
    severity: 'high' as const,
    title: 'Severe loss of function',
    detail:
      'The kidneys are badly damaged. Symptoms are usually clear, and it becomes time to plan ahead for treatment such as dialysis or a transplant.',
  },
  {
    id: 5,
    name: 'Stage 5',
    gfr: '<15',
    fnPct: 8,
    severity: 'high' as const,
    title: 'Kidney failure',
    detail:
      'The kidneys have largely stopped working. Dialysis or a transplant is needed to stay healthy. This is also called end-stage kidney disease.',
  },
];

// Severity → colour tokens (kept inline so no Tailwind config changes are needed).
const severityTone = {
  low: { text: 'text-green-700', bg: 'bg-green-500', soft: 'bg-green-50', ring: 'ring-green-500' },
  moderate: { text: 'text-amber-700', bg: 'bg-amber-500', soft: 'bg-amber-50', ring: 'ring-amber-500' },
  high: { text: 'text-red-700', bg: 'bg-red-500', soft: 'bg-red-50', ring: 'ring-red-500' },
};

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export function LearnMore() {
  const [activeStage, setActiveStage] = useState(2); // default to Stage 3 (most commonly detected)
  const active = stages[activeStage];
  const tone = severityTone[active.severity];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Scoped styles: animations + reduced-motion fallback */}
      <style>{`
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
        .reveal-in { opacity: 1; transform: none; }
        @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
        .animate-floaty { animation: floaty 7s ease-in-out infinite; }
        .animate-floaty-slow { animation: floaty 11s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
          .animate-floaty, .animate-floaty-slow { animation: none; }
        }
      `}</style>

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
        {/* floating ambient blobs (decorative) */}
        <div aria-hidden className="pointer-events-none absolute -top-16 -left-10 w-72 h-72 rounded-full bg-[#3A86FF]/10 blur-3xl animate-floaty" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-10 w-80 h-80 rounded-full bg-[#2EC4B6]/10 blur-3xl animate-floaty-slow" />

        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-white/70 backdrop-blur border border-blue-100 text-sm font-medium text-[#3A86FF]">
              <Droplet className="w-4 h-4" />
              Kidney Health Awareness
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Understanding{' '}
              <span className="bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] bg-clip-text text-transparent">
                Chronic Kidney Disease
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Learn what CKD is, why it often goes unnoticed, and how early detection protects your health.
            </p>
          </Reveal>

          {/* Animated awareness stats */}
          <div className="mt-12 grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {heroStats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 120}>
                <div className="h-full bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="text-4xl font-bold bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6] bg-clip-text text-transparent">
                    <CountUp end={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- What is CKD ---------------- */}
      <section className="py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <Reveal>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Chronic Kidney Disease?</h2>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Chronic Kidney Disease (CKD) is a condition marked by a gradual loss of kidney function over time. Your
                kidneys filter waste and excess fluid from your blood, which then leaves the body through urine.
              </p>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                When CKD reaches an advanced stage, dangerous levels of fluid, electrolytes, and waste can build up in
                the body. It can progress to kidney failure, which is fatal without dialysis or a transplant.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                The good news: early detection and treatment can often keep CKD from getting worse.
              </p>
            </Reveal>
            <Reveal delay={150} className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1681383152363-c470f17c680c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwa2lkbmV5JTIwaGVhbHRoY2FyZSUyMGlsbHVzdHJhdGlvbnxlbnwxfHx8fDE3NzYyMTY1Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Kidney health illustration"
                  className="w-full h-auto"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Interactive Stage Explorer ---------------- */}
      <section className="py-16 bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Explore the Stages of CKD</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tap a stage to see how kidney function changes. Stages are based on the eGFR — the rate at which your
              kidneys filter blood.
            </p>
          </Reveal>

          <Reveal>
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Stage selector */}
              <div className="grid grid-cols-5 gap-px bg-gray-100">
                {stages.map((s, i) => {
                  const t = severityTone[s.severity];
                  const isActive = i === activeStage;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveStage(i)}
                      aria-pressed={isActive}
                      className={`group relative px-2 py-4 text-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3A86FF] ${
                        isActive ? 'bg-white' : 'bg-gray-50 hover:bg-white'
                      }`}
                    >
                      <span
                        className={`block h-1.5 w-full rounded-full mb-3 transition-all duration-300 ${
                          isActive ? t.bg : 'bg-gray-200 group-hover:' + t.bg
                        }`}
                      />
                      <span
                        className={`block font-semibold text-sm sm:text-base transition-colors ${
                          isActive ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {s.name}
                      </span>
                      <span className="block text-xs text-gray-400 mt-0.5">GFR {s.gfr}</span>
                    </button>
                  );
                })}
              </div>

              {/* Detail panel — re-keyed so it fades on stage change */}
              <div key={active.id} className="reveal reveal-in p-8 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${tone.soft} ${tone.text}`}
                  >
                    {active.name} · GFR {active.gfr}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-3">{active.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{active.detail}</p>
                </div>

                {/* Animated "remaining function" meter */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-medium text-gray-600">Approx. kidney function</span>
                    <span className={`text-2xl font-bold ${tone.text}`}>{active.fnPct}%</span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${tone.bg} transition-all duration-700 ease-out`}
                      style={{ width: `${active.fnPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Illustrative only — actual function is measured by a clinical eGFR test.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Risk Factors ---------------- */}
      <section className="py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Common Risk Factors</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Activity, title: 'Diabetes', description: 'High blood sugar can damage kidney filters' },
              { icon: Heart, title: 'High Blood Pressure', description: 'Can damage blood vessels in the kidneys' },
              { icon: Droplet, title: 'Family History', description: 'Genetic predisposition to kidney disease' },
              { icon: AlertCircle, title: 'Age Over 60', description: 'Kidney function naturally declines with age' },
              { icon: Activity, title: 'Obesity', description: 'Excess weight increases kidney workload' },
              { icon: Heart, title: 'Heart Disease', description: 'Poor circulation affects kidney function' },
            ].map((factor, index) => {
              const Icon = factor.icon;
              return (
                <Reveal key={index} delay={(index % 3) * 100}>
                  <div className="group h-full bg-gray-50 p-6 rounded-2xl border border-transparent transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-100 hover:bg-white">
                    <div className="w-12 h-12 bg-[#3A86FF] rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{factor.title}</h3>
                    <p className="text-gray-600">{factor.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- Symptoms ---------------- */}
      <section className="py-16 bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Signs and Symptoms</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            <Reveal>
              <div className="h-full bg-white p-6 rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                  Early Symptoms (Often Minimal)
                </h3>
                <ul className="space-y-3">
                  {[
                    'Fatigue and weakness',
                    'Difficulty concentrating',
                    'Decreased appetite',
                    'Sleep problems',
                    'Muscle cramping at night',
                  ].map((symptom, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2" />
                      <span className="text-gray-700">{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="h-full bg-white p-6 rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  Advanced Symptoms
                </h3>
                <ul className="space-y-3">
                  {[
                    'Swelling in feet, ankles, hands, or face',
                    'Shortness of breath',
                    'Changes in urination frequency',
                    'Nausea and vomiting',
                    'Persistent itching',
                  ].map((symptom, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2" />
                      <span className="text-gray-700">{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
          <Reveal>
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[#3A86FF] shrink-0 mt-0.5" />
              <p className="text-blue-900">
                <strong>Important:</strong> Many people with early CKD have no symptoms at all. That is exactly why
                screening and early detection matter so much — especially for those with risk factors.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Prevention ---------------- */}
      <section className="py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Prevention and Management</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Control Blood Sugar', description: 'Manage diabetes through diet, exercise, and medication' },
              { title: 'Monitor Blood Pressure', description: 'Keep blood pressure below 140/90 mmHg' },
              { title: 'Healthy Diet', description: 'Low sodium, balanced protein, plenty of fruit and vegetables' },
              { title: 'Regular Exercise', description: 'At least 30 minutes of activity most days' },
              { title: 'Maintain Healthy Weight', description: 'Achieve and keep a BMI in the healthy range' },
              { title: 'Quit Smoking', description: 'Smoking damages blood vessels and kidneys' },
              { title: 'Limit Alcohol', description: 'Keep alcohol consumption moderate' },
              { title: 'Regular Check-ups', description: 'Annual kidney function tests if you have risk factors' },
            ].map((tip, index) => (
              <Reveal key={index} delay={(index % 4) * 90}>
                <div className="group h-full bg-green-50 p-6 rounded-2xl border border-green-200 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:bg-white">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mb-3 transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-gray-700">{tip.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-r from-[#3A86FF] to-[#2EC4B6]">
        <div aria-hidden className="pointer-events-none absolute -top-10 right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-floaty" />
        <div className="relative w-full px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <Stethoscope className="w-12 h-12 text-white/90 mx-auto mb-5" />
            <h2 className="text-3xl font-bold text-white mb-4">Take Control of Your Kidney Health Today</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Early detection is key. Take our free CKD risk screening to understand your risk level.
            </p>
            <Link
              to="/assessment"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-[#3A86FF] rounded-xl hover:bg-gray-50 transition-all shadow-lg text-lg font-semibold hover:shadow-2xl hover:-translate-y-0.5"
            >
              Start Free Assessment
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}