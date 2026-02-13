// src/App.jsx - TEMP FORCE PHARMACY DASHBOARD FIX
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import { Toaster } from "react-hot-toast";

// Layouts & Auth
import AuthPage from "./pages/auth/AuthPage";
import DashboardLayout from "./layouts/DashboardLayout";

// 🆕 PHARMACY PAGES
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPatients from "./pages/admin/AdminPatients";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorStatistics from "./pages/doctor/DoctorStatistics";
import DoctorProfile from "./pages/doctor/DoctorProfile";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientProfile from "./pages/patient/PatientProfile";

const AppRoutes = () => {
  const { user } = useAppContext();

  if (!user) return <AuthPage />;

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        
        {/* ================= ADMIN ROUTES ================= */}
        {user.role === "Admin" && (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/patients" element={<AdminPatients />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {/* ================= DOCTOR ROUTES ================= */}
        {user.role === "Doctor" && (
          <>
            <Route path="/" element={<DoctorDashboard />} />
            <Route path="/statistics" element={<DoctorStatistics />} />
            <Route path="/profile" element={<DoctorProfile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {/* ================= PATIENT ROUTES ================= */}
        {user.role === "Patient" && (
          <>
            <Route path="/" element={<PatientDashboard />} />
            <Route path="/profile" element={<PatientProfile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {/* ================= 🆕 PHARMACY ROUTES - TEMP FORCE FIX ================= */}
        {(user.role === "PharmacyAdmin" || user?.email?.includes("pharmacy")) && (
          <>
            <Route path="/" element={<PharmacyDashboard />} />
            <Route path="/medicines" element={<PharmacyDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {/* Fallback for unmatched roles */}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: '#334155', color: '#fff', borderRadius: '12px' } }} />
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
