// src/pages/doctor/DoctorDashboard.jsx
import { useState, useMemo } from "react";
// Added 'Filter' to imports
import { Users, AlertTriangle, Pill, Activity, Search, Plus, Filter, CheckCircle, Clock } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import MedicineAssignModal from "../../components/doctor/MedicineAssignModal";

const DoctorDashboard = () => {
  const { user, patients, missedCases } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Missed, OnTrack
  const [assignModal, setAssignModal] = useState({ open: false, patientId: null, patientName: "" });

  const myPatients = patients.filter(p => p.doctorAssignedId === user.id);

  // --- ENHANCED FILTERING LOGIC ---
  const processedPatients = useMemo(() => {
    return myPatients.map(patient => {
      // Calculate Status for this patient
      let missedCount = 0;
      let lateCount = 0;
      let onTimeCount = 0;

      patient.medicines.forEach(med => {
        med.schedule.forEach(slot => {
          if (slot.status === 'missed') missedCount++;
          if (slot.status === 'late') lateCount++;
          if (slot.status === 'on_time') onTimeCount++;
        });
      });

      // Determine Category
      let statusCategory = "OnTrack";
      if (missedCount > 0) statusCategory = "Critical";
      else if (lateCount > 0) statusCategory = "Late";

      // Adherence Score (Simple Calc)
      const total = missedCount + lateCount + onTimeCount;
      const adherence = total === 0 ? 100 : Math.round(((onTimeCount + (lateCount * 0.5)) / total) * 100);

      return { ...patient, statusCategory, adherence, missedCount };
    }).filter(p => {
      // Apply Search
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      // Apply Filter
      const matchesFilter = statusFilter === "All" || 
                           (statusFilter === "Missed" && p.statusCategory === "Critical") ||
                           (statusFilter === "Stable" && p.statusCategory === "OnTrack");
      
      return matchesSearch && matchesFilter;
    });
  }, [myPatients, searchTerm, statusFilter]);
  // --------------------------------

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Tracking Dashboard</h1>
          <p className="text-slate-500">Welcome, Dr. {user.name} - monitor adherence & interventions</p>
        </div>
        
        {/* KPI CARDS */}
        <div className="flex gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
             <div className="p-2 bg-red-50 text-red-600 rounded-full"><AlertTriangle size={20}/></div>
             <div>
               <p className="text-[10px] uppercase font-bold text-slate-400">Critical Alerts</p>
               <p className="text-xl font-black text-slate-800">{missedCases.length}</p>
             </div>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
             <div className="p-2 bg-teal-50 text-teal-600 rounded-full"><Activity size={20}/></div>
             <div>
               <p className="text-[10px] uppercase font-bold text-slate-400">Avg Adherence</p>
               <p className="text-xl font-black text-slate-800">
                 {processedPatients.length > 0 
                   ? Math.round(processedPatients.reduce((acc, p) => acc + p.adherence, 0) / processedPatients.length) 
                   : 0}%
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={20}/>
          <input 
             placeholder="Search your patients..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition"
          />
        </div>
        <div className="flex gap-2">
           {["All", "Stable", "Missed"].map(filter => (
             <button
               key={filter}
               onClick={() => setStatusFilter(filter)}
               className={`px-6 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
                 statusFilter === filter 
                 ? "bg-slate-800 text-white shadow-lg" 
                 : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
               }`}
             >
               {filter === "Missed" && <AlertTriangle size={16} />}
               {filter === "Stable" && <CheckCircle size={16} />}
               {filter}
             </button>
           ))}
        </div>
      </div>

      {/* PATIENT TRACKING CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {processedPatients.map(patient => (
          <div key={patient.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition group relative overflow-hidden">
             
             {/* Status Stripe */}
             <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                patient.statusCategory === 'Critical' ? 'bg-red-500' : 'bg-teal-500'
             }`}></div>

             <div className="flex justify-between items-start mb-4 pl-4">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-400">
                      {patient.name.charAt(0)}
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-800 group-hover:text-teal-600 transition">{patient.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase">{patient.history.diagnosis}</p>
                   </div>
                </div>
                <div className="text-right">
                   <div className="flex items-center justify-end gap-1 text-sm font-bold text-slate-600 mb-1">
                      <Activity size={16} className={patient.adherence < 80 ? "text-red-500" : "text-teal-500"} />
                      {patient.adherence}%
                   </div>
                   <p className="text-[10px] uppercase font-bold text-slate-400">Compliance</p>
                </div>
             </div>

             {/* Meds Summary */}
             <div className="pl-4 mb-6">
                <div className="flex flex-wrap gap-2">
                   {patient.medicines.map(med => {
                      const deliveryBadge =
                        med.deliveryStatus === "delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700";

                      return (
                        <span
                          key={med.id}
                          title={
                            med.pharmacyName
                              ? `${med.pharmacyName}${med.pharmacyLocation ? ` • ${med.pharmacyLocation}` : ""}`
                              : undefined
                          }
                          className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100 flex items-center gap-1"
                        >
                          <Pill size={12}/> {med.name}
                          {med.deliveryStatus && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${deliveryBadge}`}>
                              {med.deliveryStatus}
                            </span>
                          )}
                        </span>
                      );
                   })}
                   {patient.medicines.length === 0 && <span className="text-xs text-slate-400 italic">No meds assigned</span>}
                </div>
             </div>

             {/* Actions */}
             <div className="pl-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                <div className="text-xs font-bold text-slate-400">
                   {patient.missedCount > 0 ? (
                      <span className="text-red-500 flex items-center gap-1">
                         <AlertTriangle size={14}/> {patient.missedCount} Missed events
                      </span>
                   ) : (
                      <span className="text-green-600 flex items-center gap-1">
                         <CheckCircle size={14}/> All good
                      </span>
                   )}
                </div>
                <button 
                  onClick={() => setAssignModal({ open: true, patientId: patient.id, patientName: patient.name })}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-teal-600 transition flex items-center gap-2"
                >
                   <Plus size={14} /> Update Prescription
                </button>
             </div>
          </div>
        ))}
      </div>

      <MedicineAssignModal 
        isOpen={assignModal.open}
        onClose={() => setAssignModal({ ...assignModal, open: false })}
        patientId={assignModal.patientId}
        patientName={assignModal.patientName}
      />
    </div>
  );
};

export default DoctorDashboard;
