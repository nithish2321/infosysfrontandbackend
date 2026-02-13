// src/components/common/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Pill,
  LogOut,
  Users,
  Activity,
  UserCircle,
  Package
} from "lucide-react";

const Sidebar = ({ role, onLogout }) => {
  // --- MENU CONFIGURATION ---
  const adminLinks = [
    { label: "Doctors", to: "/", icon: <LayoutDashboard size={18} /> },
    { label: "Patients", to: "/patients", icon: <Users size={18} /> },
  ];

  const doctorLinks = [
    { label: "Dashboard", to: "/", icon: <LayoutDashboard size={18} /> },
    { label: "Statistics", to: "/statistics", icon: <BarChart3 size={18} /> },
    { label: "My Profile", to: "/profile", icon: <UserCircle size={18} /> },
  ];

  const patientLinks = [
    { label: "My Medicines", to: "/", icon: <Pill size={18} /> },
    { label: "My Profile", to: "/profile", icon: <UserCircle size={18} /> },
  ];

  const pharmacyLinks = [
    { label: "Dashboard", to: "/", icon: <LayoutDashboard size={18} /> },
    { label: "Inventory", to: "/medicines", icon: <Package size={18} /> },
  ];

  let links = [];
  if (role === "Admin") links = adminLinks;
  else if (role === "Doctor") links = doctorLinks;
  else if (role === "Patient") links = patientLinks;
  else links = pharmacyLinks;

  return (
    <aside className="w-64 bg-white h-screen shadow-xl flex flex-col fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="p-6 border-b flex items-center gap-2">
        <div className="bg-teal-600 p-1.5 rounded-lg text-white">
          <Activity size={20} />
        </div>
        <div>
           <h1 className="text-xl font-black text-teal-900 leading-none">MedCare</h1>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{role} Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition duration-200 ${
                isActive
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
