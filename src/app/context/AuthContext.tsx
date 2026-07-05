import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  id:    string;
  name:  string;
  email: string;
  role:  UserRole;
}

interface AuthContextType {
  user:            User | null;
  loading:         boolean;
  login:           (email: string, password: string) => Promise<UserRole | null>;
  signup:          (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout:          () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Email history helpers (used by Login & Signup autocomplete) ──────────────
const EMAIL_HISTORY_KEY = "auth_email_history";

export function getEmailHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(EMAIL_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveEmailToHistory(email: string) {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return;
  const history = getEmailHistory().filter((e) => e !== trimmed);
  history.unshift(trimmed);
  localStorage.setItem(EMAIL_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session from localStorage on first mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user"); // corrupted — clear it
      }
    }
    setLoading(false);
  }, []);

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<UserRole | null> => {
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return null;

      const loggedUser: User = {
        id:    String(data.id ?? Date.now()),
        name:  data.name  || email,              // real name from DB
        email: data.email || email.trim().toLowerCase(), // real email from DB (fixed)
        role:  (data.role as UserRole) || "patient",
      };

      setUser(loggedUser);
      localStorage.setItem("user", JSON.stringify(loggedUser));
      saveEmailToHistory(loggedUser.email);

      return loggedUser.role;
    } catch (err) {
      console.error("Login error:", err);
      return null;
    }
  };

  // ── SIGNUP ────────────────────────────────────────────────────────────────
  const signup = async (
    name:     string,
    email:    string,
    password: string,
    role:     UserRole
  ): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) return false;

      saveEmailToHistory(email.trim().toLowerCase());
      return true;
    } catch (err) {
      console.error("Signup error:", err);
      return false;
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}