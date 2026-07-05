import { useState, useRef, useEffect } from "react";
import { Lock, Mail, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, getEmailHistory } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState("");

  // ─── Email history / autocomplete ─────────────────────────────────────────
  const [emailHistory, setEmailHistory]     = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredHistory, setFilteredHistory] = useState<string[]>([]);
  const emailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEmailHistory(getEmailHistory());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (emailRef.current && !emailRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError("");
    const filtered = emailHistory.filter((e) =>
      e.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredHistory(filtered);
    setShowSuggestions(filtered.length > 0 && value.length > 0);
  };

  const selectEmail = (selected: string) => {
    setEmail(selected);
    setShowSuggestions(false);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const navigate  = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    const role = await login(email, password);
    setIsLoading(false);

    if (role) {
      if (role === "admin")        navigate("/admin-dashboard");
      else if (role === "doctor")  navigate("/doctor-dashboard");
      else                         navigate("/patient-dashboard");
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-blue-100/50 border border-gray-100 p-8 md:p-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Secure access to your health dashboard</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">

          {/* Email field with history dropdown */}
          <div className="space-y-2" ref={emailRef}>
            <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onFocus={() => {
                  const filtered = email
                    ? emailHistory.filter((e) => e.toLowerCase().includes(email.toLowerCase()))
                    : emailHistory;
                  setFilteredHistory(filtered);
                  if (filtered.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all outline-none"
                placeholder="you@example.com"
                autoComplete="off"
              />

              {/* Suggestions dropdown */}
              {showSuggestions && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {filteredHistory.map((suggestion) => (
                    <li
                      key={suggestion}
                      onMouseDown={() => selectEmail(suggestion)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Password field with show/hide toggle */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <button
                type="button"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all outline-none"
                placeholder="••••••••"
              />
              {/* Toggle button */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-gray-600 text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}