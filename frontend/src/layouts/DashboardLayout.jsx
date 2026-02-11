// src/layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import NotificationBar from "../components/common/NotificationBar";
import { useAppContext } from "../context/AppContext";

const DashboardLayout = () => {
  const { user, logout } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-50 pl-64 transition-all duration-300">
      <Sidebar role={user?.role} onLogout={logout} />
      
      {/* MAIN CONTENT AREA */}
      <main className="p-8 max-w-7xl mx-auto min-h-screen animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
            <h2 className="text-2xl font-black text-slate-800">
              {user?.name || user?.pharmacyName || user?.email}
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              {user?.role} Portal
            </p>
          </div>
          <NotificationBar />
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
