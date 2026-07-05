import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./app/context/AuthContext";
import { AssessmentProvider } from "./app/context/AssessmentContext";

import App from "./app/App";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter> {/* 🔥 Router must be OUTSIDE */}
      <AuthProvider>
        <AssessmentProvider>
          <App />
        </AssessmentProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);