// src/pages/patient/PatientDashboard.jsx
import { useState } from "react";
import { Clock, CheckCircle2, AlertCircle, Calendar, Truck, PackageCheck } from "lucide-react"; // Added Truck, PackageCheck
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import TakeMedicineModal from "../../components/patient/TakeMedicineModal";
import MissedReasonModal from "../../components/patient/MissedReasonModal";

const PatientDashboard = () => {
  // Added markMedicineDelivered from context
  const { user, patients, updateMedicineStatus, markMedicineDelivered } = useAppContext();
  
  const myData = patients.find(p => p.id === user.id);
  const [activeTask, setActiveTask] = useState(null); 
  const [showReason, setShowReason] = useState(false);

  // --- NEW: DELIVERY CONFIRMATION HANDLER ---
  const handleConfirmDelivery = async (medicineId) => {
    try {
      await markMedicineDelivered(user.id, medicineId);
      toast.success("Delivery Confirmed! Pharmacy & Doctor notified.");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to confirm delivery");
    }
  };

  const handleStatus = async (status) => {
    if (status === "missed") {
      setShowReason(true); 
    } else {
      try {
        await updateMedicineStatus(user.id, activeTask.medicineId, activeTask.time, status);
        toast.success("Great job! Status updated.");
        setActiveTask(null);
      } catch (error) {
        toast.error(error?.response?.data?.error || "Failed to update status");
      }
    }
  };

  const handleReasonSubmit = async (reason) => {
    try {
      await updateMedicineStatus(user.id, activeTask.medicineId, activeTask.time, "missed", reason);
      toast.error("Logged as missed. Doctor notified.");
      setShowReason(false);
      setActiveTask(null);
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update status");
    }
  };

  const renderStatus = (schedule) => {
    if (schedule.status === "on_time") return <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={12}/> Taken on time</span>;
    if (schedule.status === "late") return <span className="text-xs font-bold text-yellow-600 flex items-center gap-1"><Clock size={12}/> Taken late</span>;
    if (schedule.status === "missed") return <span className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertCircle size={12}/> Missed</span>;
    return null;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">Hello, {user.name.split(" ")[0]}!</h1>
          <p className="text-teal-100 font-medium">Your health journey continues today.</p>
        </div>
        <Clock className="absolute right-[-20px] top-[-20px] opacity-20" size={200} />
      </div>

      {/* --- NEW: DELIVERY PENDING SECTION --- */}
  {myData?.medicines?.some(m => m.deliveryStatus === 'pending') && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-orange-800 flex items-center gap-2 mb-3">
                <Truck size={20}/> Incoming Deliveries
            </h3>
            <div className="grid gap-3">
                {myData.medicines.filter(m => m.deliveryStatus === 'pending').map(med => (
                    <div key={med.id} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm">
                        <div>
                            <p className="font-bold text-slate-800">{med.name}</p>
                            <p className="text-xs text-slate-500">Sent from Pharmacy</p>
                        </div>
                        <button 
                            onClick={() => handleConfirmDelivery(med.id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition"
                        >
                            <PackageCheck size={16}/> Confirm Received
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Timeline Section */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="text-teal-600"/> Today's Schedule
        </h2>

        {!myData || !myData.medicines || myData.medicines.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
            No medicines assigned yet.
          </div>
        ) : (
          <div className="space-y-4">
            {myData.medicines.map((med) => (
              <div key={med.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4 border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        {med.name}
                        {med.deliveryStatus === 'delivered' && (
                            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={10}/> Delivered
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">{med.dosage} • {med.instructions}</p>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {med.type}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {med.schedule.map((slot, idx) => (
                    <div 
                      key={idx} 
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        slot.status !== "pending" 
                          ? "bg-slate-50 border-slate-100 opacity-70" 
                          : "bg-white border-teal-100 hover:border-teal-400 hover:shadow-md cursor-pointer"
                      }`}
                      onClick={() => slot.status === "pending" && setActiveTask({ medicineId: med.id, time: slot.time, medicineName: med.name })}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-black text-xl text-slate-700">{slot.time}</span>
                        {renderStatus(slot)}
                      </div>
                      
                      {slot.status === "pending" && (
                        <p className="text-xs text-teal-600 font-bold mt-1">Tap to update status</p>
                      )}
                      
                      {slot.takenAt && (
                        <p className="text-[10px] text-slate-400 mt-2">Recorded at {slot.takenAt}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS remain unchanged */}
      <TakeMedicineModal 
        isOpen={!!activeTask && !showReason}
        medicineName={activeTask?.medicineName}
        time={activeTask?.time}
        onClose={() => setActiveTask(null)}
        onSelectStatus={handleStatus}
      />

      <MissedReasonModal 
        isOpen={showReason}
        onClose={() => { setShowReason(false); setActiveTask(null); }}
        onSubmit={handleReasonSubmit}
      />
    </div>
  );
};

export default PatientDashboard;
