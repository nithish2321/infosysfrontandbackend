// src/pages/admin/AdminPatients.jsx
import { useState } from "react";
import { Search, User, Droplet, Phone, Activity, Filter, Stethoscope } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const AdminPatients = () => {
  const { patients, doctors } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All"); // All, Critical, Stable
  const [filterDoctor, setFilterDoctor] = useState("All"); // All, DOC001, DOC002...

  // Helper: Determine status based on missed medicines
  const getStatus = (patient) => {
    const missedCount = patient.medicines.reduce((acc, med) => 
      acc + med.schedule.filter(s => s.status === "missed").length, 0
    );
    return missedCount > 0 ? "Critical" : "Stable";
  };

  // Helper: Get Doctor Name by ID
  const getDoctorName = (docId) => {
    const doc = doctors.find(d => d.id === docId);
    return doc ? doc.personal.fullName : "Unassigned";
  };

  // --- FILTERING LOGIC ---
  const filteredPatients = patients.filter(p => {
    // 1. Search Text (Name)
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Status Filter
    const status = getStatus(p);
    const matchesStatus = filterStatus === "All" || status === filterStatus;

    // 3. Doctor Filter (The requested feature)
    const matchesDoctor =
      filterDoctor === "All" ||
      p.doctorAssignedId === Number(filterDoctor);

    return matchesSearch && matchesStatus && matchesDoctor;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Patient Directory</h1>
          <p className="text-slate-500">Total Patients: {patients.length}</p>
        </div>
        
        {/* FILTERS TOOLBAR */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          
          {/* SEARCH */}
          <div className="relative md:w-48">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input 
              placeholder="Search name..."
              className="w-full pl-9 p-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-teal-100 text-sm font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* DOCTOR FILTER (New) */}
          <div className="relative md:w-48">
             <Stethoscope className="absolute left-3 top-3 text-slate-400" size={16} />
             <select 
               className="w-full pl-9 p-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-teal-100 appearance-none cursor-pointer text-sm font-bold text-slate-600 truncate"
               value={filterDoctor}
               onChange={(e) => setFilterDoctor(e.target.value)}
             >
               <option value="All">All Doctors</option>
               {doctors.map(doc => (
                 <option key={doc.id} value={doc.id}>{doc.personal.fullName}</option>
               ))}
             </select>
          </div>

          {/* STATUS FILTER */}
          <div className="relative md:w-40">
             <Filter className="absolute left-3 top-3 text-slate-400" size={16} />
             <select 
               className="w-full pl-9 p-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-teal-100 appearance-none cursor-pointer text-sm font-bold text-slate-600"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
             >
               <option value="All">All Status</option>
               <option value="Stable">Stable</option>
               <option value="Critical">Critical</option>
             </select>
          </div>
        </div>
      </div>

      {/* PATIENT LIST */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPatients.map(patient => (
          <div key={patient.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition group">
            
            {/* Patient Identity */}
            <div className="flex items-center gap-4 w-full md:w-1/3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-lg group-hover:bg-teal-100 group-hover:text-teal-600 transition">
                {patient.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{patient.name}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">ID: {patient.id}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-1/2 text-sm text-slate-600">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Diagnosis</span>
                <span className="font-semibold flex items-center gap-1"><Activity size={14} className="text-teal-500"/> {patient.history.diagnosis}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Blood</span>
                <span className="font-semibold flex items-center gap-1"><Droplet size={14} className="text-red-500"/> {patient.bloodGroup}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Contact</span>
                <span className="font-semibold flex items-center gap-1"><Phone size={14} className="text-slate-400"/> {patient.contact.phone}</span>
              </div>
              
              {/* Assigned Doctor Display */}
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned To</span>
                <span className="font-semibold flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md w-fit whitespace-nowrap">
                   <Stethoscope size={12}/> {getDoctorName(patient.doctorAssignedId)}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="w-full md:w-auto text-right">
              {getStatus(patient) === "Critical" ? (
                <span className="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-xs font-black border border-red-200 shadow-sm flex items-center gap-2 justify-center">
                  ⚠️ Critical Risk
                </span>
              ) : (
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-black border border-green-200 shadow-sm flex items-center gap-2 justify-center">
                  ✅ Stable
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredPatients.length === 0 && (
          <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">No patients found matching these filters.</p>
            <button onClick={() => {setFilterDoctor("All"); setFilterStatus("All"); setSearchTerm("")}} className="mt-2 text-teal-600 text-sm font-bold hover:underline">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPatients;
