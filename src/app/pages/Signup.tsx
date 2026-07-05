import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getEmailHistory } from '../context/AuthContext';
import { Activity, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // 🔥 Expanded common domains
  const commonDomains = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'icloud.com', 'protonmail.com', 'live.com', 'msn.com',
    'yahoo.co.uk', 'gmail.co.uk', 'company.com'
  ];

  // 🔥 Strong email regex (supports +, subdomains, etc.)
  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // ─── Email history ─────────────────
  const [emailHistory, setEmailHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredHistory, setFilteredHistory] = useState<string[]>([]);
  const emailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEmailHistory(getEmailHistory());
  }, []);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (emailRef.current && !emailRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // 🔥 EMAIL VALIDATION
  const handleEmailChange = (value: string) => {
    setEmail(value);

    // basic format check
    if (!emailRegex.test(value)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }

    // history suggestions
    const filtered = emailHistory.filter((e) =>
      e.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredHistory(filtered);

    // 🔥 domain typo correction
    if (value.includes('@')) {
      const [user, domain] = value.split('@');

      if (domain) {
        const suggestion = commonDomains.find(d =>
          d.startsWith(domain)
        );

        if (suggestion && domain !== suggestion) {
          setEmailError(`Did you mean ${user}@${suggestion}?`);
        }
      }
    }

    setShowSuggestions(filtered.length > 0 && value.length > 0);
  };

  const selectEmail = (selected: string) => {
    setEmail(selected);
    setShowSuggestions(false);
    setEmailError('');
  };

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const success = await signup(name, email, password, 'patient');

      if (success) {
        toast.success('Account created!');
        navigate('/login');
      } else {
        toast.error('Email already exists.');
      }
    } catch {
      toast.error('Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-md w-full p-6 bg-white rounded-2xl shadow-xl">

        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="text-sm">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 py-3 border rounded-lg"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div ref={emailRef}>
            <label className="text-sm">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full pl-10 py-3 border rounded-lg ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
                required
              />

              {showSuggestions && (
                <ul className="absolute bg-white w-full shadow mt-1 rounded">
                  {filteredHistory.map((s) => (
                    <li
                      key={s}
                      onMouseDown={() => selectEmail(s)}
                      className="p-2 hover:bg-blue-50 cursor-pointer"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 py-3 border rounded-lg"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={loading || !!emailError}
            className="w-full py-3 bg-blue-600 text-white rounded-lg"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}