// src/pages/admin/AdminDashboard.jsx
import { useState } from "react";
import { Plus, Search, Building2, ArrowRight } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import DoctorProfileManager from "../../components/admin/DoctorProfileManager";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const { doctors, saveDoctorProfile, fetchDoctorTemplate, user } = useAppContext();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDoctors = doctors.filter((doc) =>
    doc.personal.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.qualifications.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNew = async () => {
    try {
      const template = await fetchDoctorTemplate();
      setSelectedDoctor(template);
    } catch (error) {
      toast.error("Unable to load doctor template");
    }
  };

  if (selectedDoctor) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedDoctor(null)} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold transition">
          <ArrowRight size={18} className="rotate-180" /> Back to Directory
        </button>
        <DoctorProfileManager 
          profile={selectedDoctor} 
          role={user.role} 
          onSave={async (doc) => { 
            try {
              await saveDoctorProfile(doc);
              setSelectedDoctor(null);
            } catch (error) {
              toast.error(error?.response?.data?.error || "Failed to save doctor profile");
            }
          }}
          onCancel={() => setSelectedDoctor(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* ORGANIZATION HEADER (New Clarity for Admin) */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
               <div className="flex items-center gap-2 text-teal-400 font-bold mb-2 uppercase tracking-wider text-xs">
                  <Building2 size={16}/> Organization Profile
               </div>
               <h1 className="text-3xl font-black">{user.orgName || "Hospital"}</h1>
               <p className="text-slate-400 mt-1">Administrator: {user.name}</p>
            </div>
            <div className="flex gap-4">
               <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                  <p className="text-xs text-slate-400 font-bold uppercase">Total Doctors</p>
                  <p className="text-2xl font-black">{doctors.length}</p>
               </div>
               
            </div>
         </div>
         {/* Decorative BG */}
         <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      </div>

      {/* ACTION BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search medical staff..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 outline-none"
          />
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-teal-200 transition"
        >
          <Plus size={20} /> Register New Doctor
        </button>
      </div>

      {/* DOCTOR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => {
          const ratingValue = Number(doc?.performance?.rating || 0).toFixed(1);
          const ratingCount = doc?.performance?.ratingCount || 0;

          return (
          <div 
            key={doc.id}
            onClick={() => setSelectedDoctor(doc)}
            className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-teal-500 hover:shadow-xl hover:shadow-teal-900/5 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-teal-500 transition-colors"></div>
            
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xl">
                {doc.personal.fullName.charAt(0)}
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                doc.employment.type === 'Full-time' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {doc.employment.type}
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-800 group-hover:text-teal-600 transition-colors">
              {doc.personal.fullName}
            </h3>
            <p className="text-sm font-semibold text-slate-500 mb-4">
              {doc.qualifications.specialization}
            </p>
            
            <div className="pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400 font-bold uppercase">
               <span>{doc.employment.department}</span>
               <span>Rating: {ratingValue}{ratingCount > 0 ? ` (${ratingCount})` : ""}</span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
