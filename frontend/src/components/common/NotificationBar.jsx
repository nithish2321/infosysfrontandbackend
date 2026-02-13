// src/components/common/NotificationBar.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, Clock, Truck, Stethoscope } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const toneClasses = {
  critical: "border-red-200 bg-red-50",
  warning: "border-amber-200 bg-amber-50",
  info: "border-sky-200 bg-sky-50",
  success: "border-emerald-200 bg-emerald-50",
};

const NotificationBar = () => {
  const { user, doctors, patients, missedCases, pharmacyDeliveries, pharmacyInventory } = useAppContext();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = useMemo(() => {
    if (!user) return [];

    const items = [];

    if (user.role === "Patient") {
      const record = patients.find((p) => p.id === user.id);
      const pendingDeliveries = record?.medicines?.filter((m) => m.deliveryStatus === "pending") || [];
      const missedDoses =
        record?.medicines?.reduce(
          (acc, med) => acc + (med.schedule?.filter((slot) => slot.status === "missed").length || 0),
          0
        ) || 0;

      if (pendingDeliveries.length > 0) {
        items.push({
          id: "patient-deliveries",
          title: "Pending medicine deliveries",
          description: `${pendingDeliveries.length} delivery pending confirmation.`,
          meta: pendingDeliveries
            .slice(0, 2)
            .map((m) => `${m.name}${m.pharmacyName ? ` from ${m.pharmacyName}` : ""}`)
            .join(" | "),
          tone: "warning",
        });
      }

      if (missedDoses > 0) {
        items.push({
          id: "patient-missed",
          title: "Missed dose alerts",
          description: `${missedDoses} missed dose${missedDoses > 1 ? "s" : ""} recorded.`,
          meta: "Please follow your updated schedule.",
          tone: "critical",
        });
      }
    }

    if (user.role === "Doctor") {
      const myPatients = patients.filter((p) => p.doctorAssignedId === user.id);
      const myPatientNames = new Set(myPatients.map((p) => p.name));
      const myMissed = missedCases.filter((entry) => myPatientNames.has(entry.patientName));
      const pendingDeliveries = myPatients.reduce(
        (acc, patient) => acc + (patient.medicines?.filter((m) => m.deliveryStatus === "pending").length || 0),
        0
      );

      if (myMissed.length > 0) {
        const firstAlert = myMissed[0];
        items.push({
          id: "doctor-missed",
          title: "Critical adherence events",
          description: `${myMissed.length} missed dose${myMissed.length > 1 ? "s" : ""} need review.`,
          meta: `${firstAlert.patientName} missed ${firstAlert.medicineName} at ${firstAlert.time}`,
          tone: "critical",
        });
      }

      if (pendingDeliveries > 0) {
        items.push({
          id: "doctor-deliveries",
          title: "Prescriptions in delivery",
          description: `${pendingDeliveries} medicine delivery${pendingDeliveries > 1 ? "ies" : "y"} still pending.`,
          meta: "Patient confirmation is pending.",
          tone: "info",
        });
      }
    }

    if (user.role === "Admin") {
      const avgRating =
        doctors.length === 0
          ? 0
          : doctors.reduce((acc, doc) => acc + Number(doc?.performance?.rating || 0), 0) / doctors.length;
      const unassignedPatients = patients.filter((p) => !p.doctorAssignedId).length;

      if (missedCases.length > 0) {
        items.push({
          id: "admin-missed",
          title: "Hospital adherence risk",
          description: `${missedCases.length} missed event${missedCases.length > 1 ? "s" : ""} across patients.`,
          meta: "Prioritize follow-up for critical cases.",
          tone: "critical",
        });
      }

      items.push({
        id: "admin-rating",
        title: "Doctor performance snapshot",
        description: `Average doctor rating is ${avgRating.toFixed(1)}.`,
        meta: `${doctors.length} doctor${doctors.length > 1 ? "s" : ""} in directory`,
        tone: "info",
      });

      if (unassignedPatients > 0) {
        items.push({
          id: "admin-unassigned",
          title: "Unassigned patients",
          description: `${unassignedPatients} patient${unassignedPatients > 1 ? "s" : ""} without doctor assignment.`,
          meta: "Assign doctors to reduce care delays.",
          tone: "warning",
        });
      }
    }

    if (user.role === "PharmacyAdmin") {
      const pending = (pharmacyDeliveries || []).filter((d) => d.status !== "delivered");
      const lowStock = (pharmacyInventory || []).filter((i) => i.quantity < 20);

      if (pending.length > 0) {
        items.push({
          id: "pharmacy-delivery",
          title: "Delivery queue",
          description: `${pending.length} delivery${pending.length > 1 ? "ies" : "y"} pending completion.`,
          meta: pending
            .slice(0, 2)
            .map((d) => `${d.patient} - ${d.medicine}`)
            .join(" | "),
          tone: "warning",
        });
      }

      if (lowStock.length > 0) {
        items.push({
          id: "pharmacy-stock",
          title: "Low stock medicines",
          description: `${lowStock.length} item${lowStock.length > 1 ? "s" : ""} require restock.`,
          meta: lowStock
            .slice(0, 2)
            .map((i) => `${i.name} (${i.quantity})`)
            .join(" | "),
          tone: "critical",
        });
      }
    }

    return items;
  }, [user, doctors, patients, missedCases, pharmacyDeliveries, pharmacyInventory]);

  const unreadCount = notifications.length;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition"
      >
        <Bell size={18} className="text-slate-600" />
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 max-w-[92vw] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-30">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700">Notifications</p>
            <span className="text-[10px] uppercase text-slate-400 font-semibold">
              {unreadCount} item{unreadCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto p-3 space-y-2">
            {notifications.length === 0 && (
              <div className="p-4 text-sm text-slate-500 border border-emerald-100 bg-emerald-50 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                No active notifications.
              </div>
            )}

            {notifications.map((note) => (
              <div key={note.id} className={`p-3 rounded-xl border ${toneClasses[note.tone] || toneClasses.info}`}>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  {note.tone === "critical" && <AlertTriangle size={14} className="text-red-600" />}
                  {note.tone === "warning" && <Clock size={14} className="text-amber-600" />}
                  {note.tone === "info" && <Stethoscope size={14} className="text-sky-600" />}
                  {note.tone === "success" && <Truck size={14} className="text-emerald-600" />}
                  {note.title}
                </p>
                <p className="text-xs text-slate-700 mt-1">{note.description}</p>
                {note.meta && <p className="text-[11px] text-slate-500 mt-1">{note.meta}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBar;
