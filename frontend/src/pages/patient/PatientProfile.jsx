// src/pages/patient/PatientProfile.jsx
import { useEffect, useState } from "react";
import { User, Phone, MapPin, FileHeart, Droplet, Edit2, Save, X } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const PatientProfile = () => {
  const { user, patients, updatePatientProfile } = useAppContext();
  
  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  // Get current patient data
  const originalData = patients.find(p => p.id === user.id) || {};
  const [formData, setFormData] = useState(originalData);

  useEffect(() => {
    if (!isEditing) {
      setFormData(originalData);
    }
  }, [originalData, isEditing]);

  if (!originalData?.id) return null;

  const handleSave = async () => {
    try {
      await updatePatientProfile(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  // Helper for input fields
  const renderInput = (value, field, section = null) => {
    if (!isEditing) return <p className="font-semibold text-slate-800">{value}</p>;
    
    return (
      <input 
        className="w-full p-1.5 -ml-1.5 rounded border border-teal-200 bg-teal-50 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
        value={value}
        onChange={(e) => {
           if(section) {
             setFormData({ ...formData, [section]: { ...formData[section], [field]: e.target.value } });
           } else {
             setFormData({ ...formData, [field]: e.target.value });
           }
        }}
      />
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* HEADER WITH EDIT BUTTON */}
      <div className="flex justify-between items-end">
         <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-3xl font-black">
              {formData.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">{formData.name}</h1>
              <p className="text-slate-500">ID: {formData.id}</p>
            </div>
         </div>
         
         {!isEditing ? (
           <button 
             onClick={() => setIsEditing(true)} 
             className="flex items-center gap-2 text-teal-600 font-bold hover:bg-teal-50 px-4 py-2 rounded-xl transition"
           >
             <Edit2 size={18} /> Edit Profile
           </button>
         ) : (
           <div className="flex gap-2">
             <button onClick={handleCancel} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">
                Cancel
             </button>
             <button onClick={handleSave} className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 flex items-center gap-2">
                <Save size={18} /> Save
             </button>
           </div>
         )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-8">
        
        {/* SECTION 1: Personal */}
        <div>
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Personal Information</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="text-xs text-slate-400 font-bold uppercase">Full Name</label>
                 {renderInput(formData.name, "name")}
              </div>
              <div>
                 <label className="text-xs text-slate-400 font-bold uppercase">Age</label>
                 {renderInput(formData.age, "age")}
              </div>
              <div>
                 <label className="text-xs text-slate-400 font-bold uppercase">Gender</label>
                 {renderInput(formData.gender, "gender")}
              </div>
              <div>
                 <label className="text-xs text-slate-400 font-bold uppercase">Blood Group</label>
                 {renderInput(formData.bloodGroup, "bloodGroup")}
              </div>
           </div>
        </div>

        {/* SECTION 2: Contact */}
        <div>
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 border-b pb-2">Contact Details</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="text-xs text-slate-400 font-bold uppercase">Phone Number</label>
                 {renderInput(formData.contact?.phone, "phone", "contact")}
              </div>
              <div>
                 <label className="text-xs text-slate-400 font-bold uppercase">Email Address</label>
                 {renderInput(formData.contact?.email, "email", "contact")}
              </div>
              <div className="md:col-span-2">
                 <label className="text-xs text-slate-400 font-bold uppercase">Residential Address</label>
                 {renderInput(formData.contact?.address, "address", "contact")}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
