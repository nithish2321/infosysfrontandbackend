// src/pages/doctor/DoctorProfile.jsx
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import DoctorProfileManager from "../../components/admin/DoctorProfileManager";
import { useAppContext } from "../../context/AppContext";

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { user, doctorProfile, fetchDoctorProfile, updateDoctorProfile } = useAppContext();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctorProfile) return;

    setLoading(true);
    fetchDoctorProfile()
      .catch(() => {
        toast.error("Unable to load doctor profile");
      })
      .finally(() => setLoading(false));
  }, [doctorProfile]);

  if (loading && !doctorProfile) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-slate-500 font-semibold">
        Loading your profile...
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-slate-500 font-semibold">
        Doctor profile not available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold transition"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <DoctorProfileManager
        profile={doctorProfile}
        role={user?.role || "Doctor"}
        onSave={async (doc) => {
          try {
            await updateDoctorProfile(doc);
            toast.success("Profile updated successfully");
          } catch (error) {
            toast.error(error?.response?.data?.error || "Failed to update profile");
          }
        }}
        onCancel={() => navigate("/")}
      />
    </div>
  );
};

export default DoctorProfile;
