// src/layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import { useAppContext } from "../context/AppContext";

const DashboardLayout = () => {
  const { user, logout } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-50 pl-64 transition-all duration-300">
      <Sidebar role={user?.role} onLogout={logout} />
      
      {/* MAIN CONTENT AREA */}
      <main className="p-8 max-w-7xl mx-auto min-h-screen animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;