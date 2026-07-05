import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, Shield, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import background from "../../assets/pharma.webp";

// Consistent Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true, margin: "-100px" }
};

export function Landing() {
  // state tracker for expanding the CKD hover cards smoothly
  const [hoveredStageIndex, setHoveredStageIndex] = useState<number | null>(null);

  const stagesData = [
    {
      title: "Stage 1",
      gfr: "eGFR ≥ 90",
      desc: "Normal function, early microscopic damage detected",
      color: "bg-blue-400",
      borderHover: "hover:border-blue-400",
      details: "Kidneys work perfectly, but diagnostic markers (like protein/albumin in urine) reveal early abnormalities. Proactive blood pressure control slows down progression early."
    },
    {
      title: "Stage 2",
      gfr: "eGFR 60-89",
      desc: "Mild structural loss of overall filtration capacity",
      color: "bg-blue-500",
      borderHover: "hover:border-blue-500",
      details: "A very mild drop in kidney efficiency occurs. Physical symptoms are rarely noticeable, but regular tracking via blood chemistry and making healthy lifestyle updates becomes essential."
    },
    {
      title: "Stage 3",
      gfr: "eGFR 30-59",
      desc: "Moderate kidney structural damage and reduced functionality",
      color: "bg-blue-600",
      borderHover: "hover:border-blue-600",
      details: "Divided clinically into 3A and 3B. Waste materials or fluids might begin accumulating in tissue, leading to fatigue, mild leg swelling, or changes in urine output."
    },
    {
      title: "Stage 4",
      gfr: "eGFR 15-29",
      desc: "Severe decrease in GFR levels and system function",
      color: "bg-indigo-600",
      borderHover: "hover:border-indigo-600",
      details: "This is a critical advanced stage. Complications like high blood pressure, anemia, and bone disease can develop. Immediate medical management is required to plan for treatments."
    },
    {
      title: "Stage 5",
      gfr: "eGFR < 15",
      desc: "Advanced operational failure requiring targeted dialysis",
      color: "bg-gray-900",
      borderHover: "hover:border-gray-900",
      details: "Also known as End-Stage Renal Disease (ESRD). The kidneys can no longer sustain basic chemical filtration. Maintenance dialysis or a clinical transplant is required."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* ─── HERO SECTION ─── */}
      <section
        className="relative overflow-hidden py-20 lg:py-28 border-b border-gray-100"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Soft, High-Contrast Overlay */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>

        {/* Dynamic Abstract Ambient Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-200/40 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-emerald-200/40 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Context */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6 max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs font-semibold tracking-wider uppercase shadow-sm">
                <Activity className="w-3.5 h-3.5 text-blue-600" /> Early Detection Saves Lives
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
                Your Kidneys <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Matter.</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 font-medium leading-relaxed">
                Assess your Chronic Kidney Disease (CKD) risk in under 5 minutes with our clinically validated AI screening engine.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <Link
                  to="/assessment"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300"
                >
                  Start Assessment
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/learn-more"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Visual Graphic */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="relative max-w-md lg:max-w-none mx-auto w-full"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 [transform:rotate(1.5deg)] hover:[transform:rotate(0deg)] group">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-60 pointer-events-none group-hover:opacity-40 transition-opacity" />
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1681383152363-c470f17c680c?q=80&w=1080"
                  alt="Medical kidney healthcare validation interface"
                  className="w-full h-[400px] object-cover"
                />
              </div>

              {/* Floating Analytical Validation Badge */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 max-w-[260px]"
              >
                <div className="w-12 h-12 shrink-0 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 text-lg leading-tight">Prevent it Early</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Early detection saves livesq  </p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── CKD STAGES TIMELINE UNIFORM INTERACTIVE TRACK ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">Stages of Chronic Kidney Disease</h2>
            <p className="text-gray-500 text-lg font-medium leading-relaxed">
              Hover over any stage card below to reveal clinical definitions and diagnostic GFR markers without layout disruption.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6"
          >
            {stagesData.map((stage, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                onMouseEnter={() => setHoveredStageIndex(i)}
                onMouseLeave={() => setHoveredStageIndex(null)}
                whileHover={{ y: -4 }}
                className={`group relative p-6 h-[280px] sm:h-[260px] md:h-[350px] lg:h-[290px] rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl ${stage.borderHover}`}
              >
                {/* Visual Line Accent */}
                <div className={`w-10 h-1.5 rounded-full mb-5 ${stage.color}`} />
                
                {/* Header Information */}
                <div className="flex items-baseline justify-between gap-2 mb-3">
                  <h3 className="font-bold text-lg text-gray-900 tracking-tight">{stage.title}</h3>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                    {stage.gfr}
                  </span>
                </div>

                {/* Container managing standard dynamic swapping of details within identical height bounds */}
                <div className="relative h-[calc(100%-50px)]">
                  <AnimatePresence initial={false} mode="wait">
                    {hoveredStageIndex !== i ? (
                      <motion.p
                        key="desc"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="text-sm text-gray-500 leading-relaxed font-medium absolute inset-0"
                      >
                        {stage.desc}
                      </motion.p>
                    ) : (
                      <motion.div
                        key={uniqKey => `details-${i}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-gray-600 leading-relaxed font-normal absolute inset-0 border-t border-gray-100 pt-3"
                      >
                        {stage.details}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── SYMPTOMS & PREVENTION SYNERGY GRID ─── */}
      <section className="py-20 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Symptoms Card Container */}
            <motion.div 
              {...fadeInUp}
              className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-8 text-amber-600 font-bold tracking-tight text-lg">
                  <AlertCircle className="w-5 h-5 shrink-0" /> Common Indicator Symptoms
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Persistent chronic fatigue", "Leg/Ankle peripheral swelling", 
                    "Acute shortness of breath", "Irregular urination frequency", 
                    "Painful muscle cramps", "Unexplained itchy skin irritation"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-600 p-4 bg-gray-50/70 border border-gray-100/50 rounded-xl font-medium text-sm transition-colors hover:bg-gray-50">
                      <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Prevention Card Container */}
            <motion.div 
              {...fadeInUp}
              className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 sm:p-10 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-8 font-bold tracking-tight text-lg">
                  <CheckCircle2 className="w-5 h-5 text-blue-200 shrink-0" /> Preventive Guidelines
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                  {[
                    "Stabilize Systemic Blood Pressure", "Rigidly Control Sugar Metrics",
                    "Adhere to Clean Balanced Diets", "Engage in Regular Aerobic Activity",
                    "Limit Daily Sodium Intake Levels", "Schedule Systematic Clinical Screenings"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-blue-50 py-3 border-b border-white/10 font-medium text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── FUNCTIONAL STRATEGY PROCESS SECTION ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">How Screening Functions</h2>
          </div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { step: "01", title: "Complete Assessment", desc: "Complete the CKD assessment by answering questions about your lifestyle, medical history, and kidney-related symptoms.", icon: <Activity className="w-6 h-6" />, color: "text-blue-600", bg: "bg-blue-50" },
              { step: "02", title: "Receive Risk Result", desc: "The system calculates your total score using a rule-based scoring method and classifies your CKD risk level with personalized recommendations.", icon: <Shield className="w-6 h-6" />, color: "text-emerald-600", bg: "bg-emerald-50" },
              { step: "03", title: "Manage Your Healthcare", desc: "View your assessment history, book appointments, receive system notifications, and manage your health information in one platform.", icon: <Clock className="w-6 h-6" />, color: "text-indigo-600", bg: "bg-indigo-50" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                variants={fadeInUp}
                whileHover={{ scale: 1.00 }}
                className="relative p-8 bg-white border border-gray-100 rounded-3xl shadow-md shadow-gray-200/30 hover:shadow-xl hover:shadow-gray-300/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`text-4xl font-black absolute top-6 right-8 opacity-25 tracking-tight ${item.color}`}>
                    {item.step}
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${item.bg} ${item.color}`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed font-medium text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── ACTION BANNER CTA ─── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gray-900 py-16 px-6 sm:px-12 text-center shadow-2xl">
          {/* Subtle Color Accent Mash Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-emerald-500/10 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Begin Your Kidney Wellness Plan Today
            </h2>
            <p className="text-gray-300 text-base sm:text-lg font-medium max-w-xl mx-auto">
              Take the first critical step toward absolute clarity. Screening processes require no medical documentation to begin.
            </p>
            <div className="pt-4">
              <Link
                to="/assessment"
                className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-gray-900 rounded-2xl text-lg font-bold shadow-xl hover:bg-blue-50 transition-all duration-300 hover:scale-[1.02]"
              >
                Take Free Assessment
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed pt-2">
              <strong>Disclaimer:</strong> This tool acts exclusively as a proactive analytical screening benchmark assessment. It does not replace certified diagnoses provided by clinical nephrologists.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}