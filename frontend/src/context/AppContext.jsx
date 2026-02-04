// src/context/AppContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("medcare_user")) || null);
  const [token, setToken] = useState(() => localStorage.getItem("medcare_token") || null);
  const [missedCases, setMissedCases] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [medicineMaster, setMedicineMaster] = useState([]);
  const [pharmacyInventory, setPharmacyInventory] = useState([]);
  const [pharmacyDeliveries, setPharmacyDeliveries] = useState([]);

  // Persistence Effects
  useEffect(() => { 
     if (user) localStorage.setItem("medcare_user", JSON.stringify(user));
     else localStorage.removeItem("medcare_user");
  }, [user]);
  useEffect(() => {
     if (token) localStorage.setItem("medcare_token", token);
     else localStorage.removeItem("medcare_token");
  }, [token]);

  useEffect(() => {
    const loadPublicData = async () => {
      try {
        const [hospitalsRes, doctorsRes, medicinesRes] = await Promise.all([
          api.get("/public/hospitals"),
          api.get("/public/doctors"),
          api.get("/public/medicines"),
        ]);
        setOrganizations(hospitalsRes.data || []);
        setDoctors(doctorsRes.data || []);
        setMedicineMaster(medicinesRes.data || []);
      } catch (error) {
        // Keep empty state; UI will handle gracefully
      }
    };

    loadPublicData();
  }, []);

  useEffect(() => {
    const missed = [];
    patients.forEach((p) => {
      p.medicines?.forEach((m) => {
        m.schedule?.forEach((s) => {
          if (s.status === "missed") {
            missed.push({
              id: `${p.id}-${m.id}-${s.time}`,
              patientName: p.name,
              medicineName: m.name,
              time: s.time,
              reason: s.reason || null,
              acknowledged: false,
            });
          }
        });
      });
    });
    setMissedCases(missed);
  }, [patients]);

  const mapUserRole = (role) => {
    if (role === "ADMIN") return "Admin";
    if (role === "DOCTOR") return "Doctor";
    if (role === "PATIENT") return "Patient";
    return role;
  };

  const normalizeUser = (data) => ({
    id: data.id,
    name: data.name,
    email: data.email,
    role: mapUserRole(data.role),
    orgName: data.hospitalName,
    hospitalId: data.hospitalId,
  });

  const fetchCurrentUser = async () => {
    const response = await api.get("/api/users/me");
    return normalizeUser(response.data);
  };

  const fetchAdminDoctors = async () => {
    const response = await api.get("/api/admin/doctors");
    setDoctors(response.data || []);
    return response.data;
  };

  const fetchDoctorTemplate = async () => {
    const response = await api.get("/api/admin/doctors/template");
    return response.data;
  };

  const saveDoctorProfile = async (profile) => {
    if (!profile?.id) {
      const response = await api.post("/api/admin/doctors/profile", profile);
      setDoctors((prev) => [response.data, ...prev]);
      return response.data;
    }

    const response = await api.put(`/api/admin/doctors/${profile.id}`, profile);
    setDoctors((prev) => prev.map((doc) => (doc.id === profile.id ? response.data : doc)));
    return response.data;
  };

  const fetchPatients = async () => {
    const response = await api.get("/api/patients");
    setPatients(response.data || []);
    return response.data;
  };

  const fetchMyPatientRecord = async () => {
    const response = await api.get("/api/patients/me");
    setPatients(response.data ? [response.data] : []);
    return response.data;
  };

  const hydrateUserData = async (currentUser) => {
    if (!currentUser) return;

    if (currentUser.role === "Admin") {
      await fetchAdminDoctors();
      await fetchPatients();
    } else if (currentUser.role === "Doctor") {
      await fetchPatients();
    } else if (currentUser.role === "Patient") {
      await fetchMyPatientRecord();
    } else if (currentUser.role === "PharmacyAdmin") {
      await fetchPharmacyInventory();
      await fetchPharmacyDeliveries();
    }
  };

  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser()
        .then((me) => {
          setUser(me);
          hydrateUserData(me);
        })
        .catch(() => {
          setToken(null);
        });
    }
  }, [token, user]);

  useEffect(() => {
    if (user && token) {
      hydrateUserData(user);
    }
  }, [user, token]);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("medcare_token", response.data.token);
      setToken(response.data.token);

      const me = await fetchCurrentUser();
      setUser(me);
      await hydrateUserData(me);
      return true;
    } catch (error) {
      return false;
    }
  };

  const registerPharmacy = async (formData) => {
    await api.post("/auth/pharmacy/register", {
      pharmacyName: formData.pharmacyName,
      location: formData.location,
      email: formData.email,
      password: formData.password,
    });
  };

  const loginPharmacy = async (email, password) => {
    try {
      const response = await api.post("/auth/pharmacy/login", { email, password });
      const { token: authToken, pharmacy } = response.data;

      localStorage.setItem("medcare_token", authToken);
      setToken(authToken);
      setUser({
        id: pharmacy.id,
        email: pharmacy.email,
        role: "PharmacyAdmin",
        pharmacyName: pharmacy.pharmacyName,
        location: pharmacy.location,
      });
      await fetchPharmacyInventory();
      await fetchPharmacyDeliveries();
      return true;
    } catch (error) {
      return false;
    }
  };

  const registerUser = async (formData) => {
    if (formData.role === "Admin") {
      await api.post("/api/hospitals/register", {
        hospitalName: formData.hospitalName,
        adminName: formData.name,
        email: formData.email,
        password: formData.password,
      });
      const hospitals = await api.get("/public/hospitals");
      setOrganizations(hospitals.data || []);
      return;
    }

    if (formData.role === "Doctor") {
      if (!formData.orgId) {
        throw new Error("Hospital is required for doctor registration.");
      }
      await api.post("/auth/register-doctor", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        hospitalId: Number(formData.orgId),
      });
      const doctorsRes = await api.get("/public/doctors");
      setDoctors(doctorsRes.data || []);
      return;
    }

    const doctorId = formData.doctorAssignedId ? Number(formData.doctorAssignedId) : null;
    const assignedDoctor = doctorId ? doctors.find((doc) => doc.id === doctorId) : null;
    const hospitalId = assignedDoctor?.hospitalId || organizations[0]?.id;

    if (!hospitalId) {
      throw new Error("Hospital is required for patient registration.");
    }

    await api.post("/auth/register", {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      hospitalId,
      doctorAssignedId: assignedDoctor?.id || null,
    });
  };

  const updateProfile = async (updatedData) => {
    if (user?.role === "PharmacyAdmin" && token) {
      const response = await api.put("/api/pharmacy/profile", updatedData);
      setUser(prev => ({ ...prev, ...response.data, role: "PharmacyAdmin" }));
      return;
    }
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setPharmacyDeliveries([]);
    setPatients([]);
    setPharmacyInventory([]);
  };
  const updatePatientProfile = async (updatedData) => {
    const response = await api.put(`/api/patients/${updatedData.id}`, updatedData);
    setPatients(prev => prev.map(p => p.id === updatedData.id ? response.data : p));
    return response.data;
  };

  const fetchPharmacyInventory = async () => {
    const response = await api.get("/api/pharmacy/inventory");
    setPharmacyInventory(response.data);
    return response.data;
  };

  const createInventoryItem = async (payload) => {
    const response = await api.post("/api/pharmacy/inventory", payload);
    setPharmacyInventory(prev => [response.data, ...prev]);
    return response.data;
  };

  const updateInventoryItem = async (id, payload) => {
    const response = await api.put(`/api/pharmacy/inventory/${id}`, payload);
    setPharmacyInventory(prev => prev.map(item => item.id === id ? response.data : item));
    return response.data;
  };

  const deleteInventoryItem = async (id) => {
    await api.delete(`/api/pharmacy/inventory/${id}`);
    setPharmacyInventory(prev => prev.filter(item => item.id !== id));
  };

  const fetchPharmacyDeliveries = async () => {
    const response = await api.get("/api/pharmacy/deliveries");
    setPharmacyDeliveries(response.data);
    return response.data;
  };

  const assignMedicine = async (patientId, newMedicine) => {
    const payload = {
      name: newMedicine.name,
      dosage: newMedicine.dosage,
      type: newMedicine.type,
      instructions: newMedicine.instructions,
      scheduleTimes: newMedicine.schedule?.map((slot) => slot.time) || [],
    };

    const response = await api.post(`/api/patients/${patientId}/medicines`, payload);
    setPatients((prev) => prev.map((p) => (p.id === patientId ? response.data : p)));
    return response.data;
  };

  const markMedicineDelivered = async (patientId, medicineId) => {
    const response = await api.patch(`/api/patients/medicines/${medicineId}/delivery`, {
      status: "delivered",
    });
    setPatients((prev) => prev.map((p) => (p.id === patientId ? response.data : p)));
    return response.data;
  };

  const updateMedicineStatus = async (patientId, medicineId, time, status, reason = null) => {
    const response = await api.patch("/api/patients/medicines/status", {
      medicineId,
      time,
      status,
      reason,
    });
    setPatients((prev) => prev.map((p) => (p.id === patientId ? response.data : p)));
    return response.data;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        doctors,
        patients,
        medicineMaster,
        missedCases,
        organizations,
        pharmacyInventory,       // 🆕 Exported
        pharmacyDeliveries,
        login,
        loginPharmacy,
        logout,
        registerPharmacy,
        registerUser,
        updateProfile,
        saveDoctorProfile,
        fetchDoctorTemplate,
        updatePatientProfile,
        fetchPharmacyInventory,
        createInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        fetchPharmacyDeliveries,
        assignMedicine,          // 🆕 Updated Logic
        markMedicineDelivered,   // 🆕 Exported
        updateMedicineStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
