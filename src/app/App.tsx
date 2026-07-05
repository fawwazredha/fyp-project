import { Routes, Route } from "react-router-dom";

import { Landing } from "./pages/Landing";
import { Assessment } from "./pages/Assessment";
import { AssessmentResult } from "./pages/AssessmentResult";
import { BookAppointment } from "./pages/BookAppointment";
import Login from "./pages/Login";
import { Signup } from "./pages/Signup";
import { PatientDashboard } from "./pages/PatientDashboard";
import { PatientProfile } from "./pages/PatientProfile";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LearnMore } from "./pages/LearnMore";
import { NotFound } from "./pages/NotFound";
import { Navbar } from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/assessment/result" element={<AssessmentResult />} />
        <Route path="/book-appointment" element={<BookAppointment />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/patient-profile" element={<PatientProfile />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route path="/learn-more" element={<LearnMore />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;