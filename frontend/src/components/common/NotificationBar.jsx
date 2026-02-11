// src/components/common/NotificationBar.jsx
import { useMemo, useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const NotificationBar = () => {
  const { user, patients, missedCases, pharmacyDeliveries } = useAppContext();
  const [open, setOpen] = useState(false);

  const notifications = useMemo(() => {
    if (!user) return [];

    const items = [];
    if (user.role === "Patient") {
      const myRecord = patients.find((p) => p.id === user.id);
      const pendingDeliveries = myRecord?.medicines?.filter((m) => m.deliveryStatus === "pending").length || 0;
      if (pendingDeliveries > 0) {
        items.push({
          id: "patient-deliveries",
          message: `${pendingDeliveries} medicine delivery${pendingDeliveries > 1 ? "ies" : "y"} pending confirmation.`,
        });
      }
    }

    if (user.role === "Doctor" && missedCases.length > 0) {
      items.push({
        id: "doctor-missed",
        message: `${missedCases.length} missed dose${missedCases.length > 1 ? "s" : ""} reported by patients.`,
      });
    }

    if (user.role === "Admin" && missedCases.length > 0) {
      items.push({
        id: "admin-missed",
        message: `${missedCases.length} missed dose${missedCases.length > 1 ? "s" : ""} across hospital.`,
      });
    }

    if (user.role === "PharmacyAdmin") {
      const pending = (pharmacyDeliveries || []).filter((d) => d.status !== "delivered").length;
      if (pending > 0) {
        items.push({
          id: "pharmacy-pending",
          message: `${pending} delivery${pending > 1 ? "ies" : "y"} pending update.`,
        });
      }
    }

    return items;
  }, [user, patients, missedCases, pharmacyDeliveries]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition"
      >
        <Bell size={18} className="text-slate-600" />
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Notifications</span>
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-30">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700">Activity</p>
            <span className="text-[10px] uppercase text-slate-400 font-semibold">
              {notifications.length} new
            </span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-5 text-sm text-slate-500 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-teal-500" />
                No new notifications.
              </div>
            ) : (
              notifications.map((note) => (
                <div key={note.id} className="px-4 py-3 text-sm text-slate-600 border-b last:border-b-0">
                  {note.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBar;
