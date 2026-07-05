import { useEffect, useState } from 'react';
  import { Link, useNavigate } from 'react-router-dom';

  import {
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    Home,
    Activity,
    ShieldAlert,
    HeartPulse,
    ArrowRight,
    ClipboardList,
  } from 'lucide-react';

  import { useAssessment } from '../context/AssessmentContext';
  import { useAuth } from '../context/AuthContext';

  import * as Progress from '@radix-ui/react-progress';
  import { motion } from 'motion/react';

  export function AssessmentResult() {
    const { latestResult } = useAssessment();
    const { isAuthenticated } = useAuth();

    const navigate = useNavigate();

    const [animatedProgress, setAnimatedProgress] =
      useState(0);

    useEffect(() => {
      if (!latestResult) {
        navigate('/assessment');
        return;
      }

      const timer = setTimeout(() => {
        setAnimatedProgress(
          latestResult.riskPercentage
        );
      }, 300);

      return () => clearTimeout(timer);
    }, [latestResult, navigate]);

    if (!latestResult) return null;

    /* =========================================
      RISK CONFIG
    ========================================= */

    const getRiskConfig = () => {
      switch (latestResult.riskLevel) {
        case 'low':
          return {
            icon: CheckCircle2,
            color: 'text-green-600',
            softText: 'text-green-700',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            gradientFrom: 'from-green-500',
            gradientTo: 'to-green-600',
            title: 'Low Risk',
            badge: 'Healthy Kidney Risk Level',
          };

        case 'moderate':
          return {
            icon: AlertTriangle,
            color: 'text-yellow-600',
            softText: 'text-yellow-700',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            gradientFrom: 'from-yellow-500',
            gradientTo: 'to-orange-500',
            title: 'Moderate Risk',
            badge: 'Needs Lifestyle Attention',
          };

        case 'high':
        default:
          return {
            icon: ShieldAlert,
            color: 'text-red-600',
            softText: 'text-red-700',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            gradientFrom: 'from-red-500',
            gradientTo: 'to-red-700',
            title: 'High Risk',
            badge: 'Medical Consultation Recommended',
          };
      }
    };

    const config = getRiskConfig();
    const Icon = config.icon;

    return (
      <div className="min-h-screen bg-gray-50 py-6 lg:py-8">

        <div className="w-full px-4 sm:px-6 lg:px-8">

          {/* =========================================
              MAIN RESULT CARD
          ========================================= */}

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6"
          >

            {/* TOP HEADER */}
            <div
              className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} p-6 text-white`}
            >

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                {/* LEFT */}
                <div className="flex items-center gap-4">

                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-10 h-10" />
                  </div>

                  <div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sm font-medium mb-2">
                      <Activity className="w-4 h-4" />
                      CKD Screening Result
                    </div>

                    <h1 className="text-3xl font-bold">
                      {config.title}
                    </h1>

                    <p className="text-white/90 mt-1">
                      Completed on{' '}
                      {new Date(
                        latestResult.date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="bg-white/15 rounded-2xl px-5 py-4 backdrop-blur-sm">

                  <p className="text-sm text-white/80 mb-1">
                    Estimated Risk Score
                  </p>

                  <h2 className="text-5xl font-bold">
                    {latestResult.riskPercentage}%
                  </h2>
                </div>
              </div>
            </div>

            {/* BODY */}
            <div className="p-6">

              {/* RISK BAR */}
              <div
                className={`${config.bgColor} ${config.borderColor} border rounded-2xl p-5 mb-6`}
              >

                <div className="flex items-center justify-between mb-4">

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {config.title}
                    </h2>

                    <p className={`text-sm ${config.softText}`}>
                      {config.badge}
                    </p>
                  </div>

                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.bgColor}`}
                  >
                    <HeartPulse
                      className={`w-7 h-7 ${config.color}`}
                    />
                  </div>
                </div>

                <Progress.Root
                  value={animatedProgress}
                  className="w-full h-4 bg-white rounded-full overflow-hidden"
                >

                  <Progress.Indicator
                    className={`h-full bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} transition-all duration-1000 ease-out`}
                    style={{
                      width: `${animatedProgress}%`,
                    }}
                  />
                </Progress.Root>

                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                </div>
              </div>

              {/* ASSESSMENT SUMMARY */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">

                {/* LEFT */}
                <div className="bg-gray-50 rounded-2xl p-5">

                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList className="w-5 h-5 text-[#3A86FF]" />

                    <h3 className="text-lg font-semibold text-gray-900">
                      Assessment Summary
                    </h3>
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    {latestResult.explanation}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">

                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-blue-600" />

                    <h3 className="text-lg font-semibold text-gray-900">
                      Important Note
                    </h3>
                  </div>

                  <p className="text-blue-900 text-sm leading-relaxed">
                    This assessment is based on your
                    questionnaire responses and is intended
                    for early CKD risk factor screening only. It is
                    not a medical diagnosis. If you are not feeling very well lately,  Please consult a
                    healthcare professional for proper
                    laboratory testing and clinical evaluation.
                  </p>
                </div>
              </div>

              {/* RECOMMENDATIONS + SAVE PROMPT (side by side) */}
              <div
                className={`grid gap-6 mb-8 ${
                  !isAuthenticated ? 'lg:grid-cols-3' : 'grid-cols-1'
                }`}
              >

                {/* RECOMMENDATIONS */}
                <div className={!isAuthenticated ? 'lg:col-span-2' : ''}>

                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-[#3A86FF]" />

                    <h3 className="text-lg font-semibold text-gray-900">
                      Recommended Actions
                    </h3>
                  </div>

                  <div className="space-y-2.5">

                    {latestResult.recommendations.map(
                      (rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: index * 0.1,
                          }}
                          className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >

                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white text-xs font-bold flex-shrink-0`}
                          >
                            {index + 1}
                          </div>

                          <p className="text-sm text-gray-700 leading-relaxed">
                            {rec}
                          </p>
                        </motion.div>
                      )
                    )}
                  </div>
                </div>

                {/* SAVE PROMPT — beside recommendations, only for guests */}
                {!isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-col items-center text-center justify-center"
                  >

                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-3">
                      <ClipboardList className="w-6 h-6 text-[#3A86FF]" />
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-1.5">
                      Save Your Assessment History
                    </h3>

                    <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                      Create a free account to track your CKD risk
                      assessments, monitor your progress, and book
                      appointments with specialists.
                    </p>

                    <Link
                      to="/signup"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3A86FF] text-white text-sm rounded-xl hover:bg-[#2E6FD9] transition-colors"
                    >
                      Create Free Account
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid md:grid-cols-3 gap-4">

                {/* BOOK */}
                {isAuthenticated ? (
                  <Link
                    to="/book-appointment"
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white hover:shadow-lg transition-all`}
                  >
                    <Calendar className="w-5 h-5" />

                    Book Appointment
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    state={{
                      returnTo: '/book-appointment',
                    }}
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white hover:shadow-lg transition-all`}
                  >
                    <Calendar className="w-5 h-5" />

                    Sign Up to Book
                  </Link>
                )}

                {/* RETAKE */}
                <Link
                  to="/assessment"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />

                  Retake Assessment
                </Link>

                {/* HOME */}
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-5 h-5" />

                  Back to Home
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }