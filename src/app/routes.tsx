import { createBrowserRouter } from "react-router-dom";
import { Root } from "./pages/Root";
import { Landing } from "./pages/Landing";
import { Assessment } from "./pages/Assessment";
import { AssessmentResult } from "./pages/AssessmentResult";
import { BookAppointment } from "./pages/BookAppointment";
import Login from './pages/Login'
import { Signup } from "./pages/Signup";
import { PatientDashboard } from "./pages/PatientDashboard";
import { PatientProfile } from "./pages/PatientProfile";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LearnMore } from "./pages/LearnMore";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "assessment", Component: Assessment },
      { path: "assessment/result", Component: AssessmentResult },
      { path: "book-appointment", Component: BookAppointment },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "patient-dashboard", Component: PatientDashboard },
      { path: "patient-profile", Component: PatientProfile },
      { path: "doctor-dashboard", Component: DoctorDashboard },
      { path: "admin-dashboard", Component: AdminDashboard },
      { path: "learn-more", Component: LearnMore },
      { path: "*", Component: NotFound },
    ],
  },
]);