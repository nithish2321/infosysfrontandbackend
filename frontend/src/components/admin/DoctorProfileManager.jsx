// src/components/admin/DoctorProfileManager.jsx
import { useState } from "react";
import { ChevronDown, ChevronUp, Save, Lock, User, Briefcase, GraduationCap, Calendar, FileText, Activity, DollarSign, Shield, BookOpen, Monitor } from "lucide-react";
import { toast } from "react-hot-toast";

const SECTION_CONFIG = [
  { id: "personal", label: "1. Personal & Identification", icon: <User size={18}/> },
  { id: "qualifications", label: "2. Professional Qualifications", icon: <GraduationCap size={18}/> },
  { id: "employment", label: "3. Employment & Hospital Details", icon: <Briefcase size={18}/> },
  { id: "licensing", label: "4. Licensing & Compliance", icon: <Shield size={18}/> },
  { id: "schedule", label: "5. Schedule & Availability", icon: <Calendar size={18}/>, adminOnly: true }, // RESTRICTED
  { id: "clinical", label: "6. Clinical Practice Data", icon: <Activity size={18}/> },
  { id: "performance", label: "7. Performance & Evaluation", icon: <Activity size={18}/> },
  { id: "financial", label: "8. Financial & Payroll", icon: <DollarSign size={18}/> },
  { id: "digital", label: "9. Digital & System Access", icon: <Monitor size={18}/> },
  { id: "legal", label: "10. Legal & Administrative", icon: <FileText size={18}/> },
  { id: "research", label: "11. Research & Academic", icon: <BookOpen size={18}/> },
];

const DoctorProfileManager = ({ profile, role, onSave, onCancel }) => {
  const [formData, setFormData] = useState(profile);
  const [expanded, setExpanded] = useState("personal"); // Default open section

  // Handle Input Change
  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(formData);
    toast.success("Doctor profile updated successfully");
  };

  // Permission Logic: Can this user edit this section?
  const isEditable = (sectionConfig) => {
    if (role === "Admin") return true; // Admin edits everything
    if (sectionConfig.adminOnly) return false; // Doctors cannot edit restricted sections
    return true; 
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
      
      {/* HEADER */}
      <div className="bg-slate-800 text-white p-6 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            {formData.personal.fullName || "New Doctor Profile"}
          </h2>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            {formData.qualifications.specialization} • {formData.employment.designation}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-700 transition">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold flex items-center gap-2 transition shadow-lg shadow-teal-900/20">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

      {/* ACCORDION SECTIONS */}
      <div className="p-6 space-y-4 bg-slate-50">
        {SECTION_CONFIG.map((section) => {
          const isOpen = expanded === section.id;
          const canEdit = isEditable(section);

          return (
            <div key={section.id} className={`bg-white rounded-xl border transition-all duration-300 ${isOpen ? "shadow-md ring-1 ring-slate-200" : "shadow-sm"}`}>
              
              {/* Accordion Header */}
              <button
                onClick={() => setExpanded(isOpen ? null : section.id)}
                className={`w-full flex justify-between items-center p-4 font-bold text-left transition rounded-xl ${
                  isOpen ? "bg-slate-50 text-slate-800" : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`p-2 rounded-lg ${isOpen ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
                    {section.icon}
                  </span>
                  {section.label}
                  {!canEdit && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1"><Lock size={8}/> Admin Only</span>}
                </span>
                {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="p-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-down">
                  {Object.keys(formData[section.id]).map((key) => {
                     // Don't show array/object fields in simple inputs (auditLogs etc)
                     if (typeof formData[section.id][key] === 'object' && formData[section.id][key] !== null) return null;

                     return (
                      <div key={key}>
                        <label className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 block tracking-wide">
                          {key.replace(/([A-Z])/g, " $1")}
                        </label>
                        <input
                          disabled={!canEdit}
                          value={formData[section.id][key]}
                          onChange={(e) => handleChange(section.id, key, e.target.value)}
                          className={`w-full p-2.5 rounded-lg border text-sm font-medium transition-colors outline-none ${
                            !canEdit
                              ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                              : "bg-white border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorProfileManager;