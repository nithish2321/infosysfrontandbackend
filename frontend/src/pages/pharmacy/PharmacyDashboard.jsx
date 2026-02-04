// src/pages/pharmacy/PharmacyDashboard.jsx
import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { 
  Plus, Edit, Trash2, Search, LogOut, Building2, 
  X, Truck, CheckCircle2, User, Save, MapPin, Mail 
} from "lucide-react"; 
import { toast } from "react-hot-toast";

const PharmacyDashboard = () => {
  const { 
    user, 
    logout, 
    updateProfile, 
    pharmacyInventory, 
    pharmacyDeliveries,
    fetchPharmacyInventory,
    fetchPharmacyDeliveries,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
  } = useAppContext();
  
  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory' or 'deliveries'
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    id: "", name: "", dosage: "", quantity: "", price: "", expiry: ""
  });
  
  const [profileData, setProfileData] = useState({
    pharmacyName: user?.pharmacyName || "",
    location: user?.location || "",
    email: user?.email || ""
  });

  useEffect(() => {
    setProfileData({
      pharmacyName: user?.pharmacyName || "",
      location: user?.location || "",
      email: user?.email || ""
    });
  }, [user]);

  // Filter Inventory
  const medicines = pharmacyInventory || []; 
  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (user?.role === "PharmacyAdmin") {
      fetchPharmacyInventory().catch(() => toast.error("Failed to load inventory"));
      fetchPharmacyDeliveries().catch(() => toast.error("Failed to load deliveries"));
    }
  }, [user]);

  // --- HANDLERS ---

  // 1. Add Medicine
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity) {
      toast.error("Name and Quantity are required");
      return;
    }

    try {
      await createInventoryItem({
        name: formData.name,
        dosage: formData.dosage,
        quantity: parseInt(formData.quantity),
        price: formData.price ? parseFloat(formData.price) : 0,
        expiry: formData.expiry || null
      });
      setShowAddModal(false);
      resetForm();
      toast.success("Medicine added successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to add medicine");
    }
  };

  // 2. Prepare Edit
  const handleEditClick = (med) => {
    setFormData({
      id: med.id,
      name: med.name,
      dosage: med.dosage,
      quantity: med.quantity,
      price: med.price,
      expiry: med.expiry
    });
    setShowEditModal(true);
  };

  // 3. Save Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateInventoryItem(formData.id, {
        name: formData.name,
        dosage: formData.dosage,
        quantity: parseInt(formData.quantity),
        price: formData.price ? parseFloat(formData.price) : 0,
        expiry: formData.expiry || null
      });
      setShowEditModal(false);
      resetForm();
      toast.success("Medicine updated!");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update medicine");
    }
  };

  // 4. Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await deleteInventoryItem(id);
        toast.success("Medicine deleted");
      } catch (error) {
        toast.error(error?.response?.data?.error || "Failed to delete medicine");
      }
    }
  };

  // 5. Profile
  const handleProfileSave = async () => {
    try {
      await updateProfile(profileData);
      setShowProfileModal(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to update profile");
    }
  };

  const resetForm = () => {
    setFormData({ id: "", name: "", dosage: "", quantity: "", price: "", expiry: "" });
  };

  // 6. Get Deliveries
  const getDeliveries = () => {
    const list = pharmacyDeliveries || [];
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Building2 className="text-teal-600"/> {user?.pharmacyName || "Pharmacy Dashboard"}
            </h1>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-2 mt-1">
              <MapPin size={14}/> {user?.location || "No Location Set"}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab("inventory")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'inventory' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}
                >
                  Inventory
                </button>
                <button 
                  onClick={() => setActiveTab("deliveries")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'deliveries' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}
                >
                  Deliveries
                </button>
             </div>

             <button onClick={() => setShowProfileModal(true)} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition">
                <User size={20}/>
             </button>
             <button onClick={logout} className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition">
                <LogOut size={20}/>
             </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        {activeTab === "inventory" ? (
          <div className="space-y-6 animate-fade-in">
             {/* Stats & Search */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
                   <div>
                      <p className="text-slate-500 text-xs font-bold uppercase">Total Items</p>
                      <p className="text-3xl font-black text-slate-800">{medicines.length}</p>
                   </div>
                   <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                      <Building2 size={24}/>
                   </div>
                </div>

                <div className="md:col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex gap-4 items-center">
                   <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                      <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search inventory..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                      />
                   </div>
                   <button 
                      onClick={() => { resetForm(); setShowAddModal(true); }}
                      className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-lg shadow-teal-200"
                   >
                      <Plus size={18}/> Add Item
                   </button>
                </div>
             </div>

             {/* Inventory Table */}
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase">Medicine Name</th>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase">Dosage</th>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase">Stock</th>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase">Price</th>
                         <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filteredMedicines.map(med => (
                         <tr key={med.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 font-bold text-slate-800">{med.name}</td>
                            <td className="p-4 text-sm text-slate-600">{med.dosage}</td>
                            <td className="p-4">
                               <span className={`px-3 py-1 rounded-full text-xs font-bold ${med.quantity < 50 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                  {med.quantity} units
                               </span>
                            </td>
                            <td className="p-4 text-sm font-bold text-slate-600">${med.price}</td>
                            <td className="p-4 flex justify-end gap-2">
                               <button onClick={() => handleEditClick(med)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit size={16}/></button>
                               <button onClick={() => handleDelete(med.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                            </td>
                         </tr>
                      ))}
                      {filteredMedicines.length === 0 && (
                         <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-medium">No medicines found.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        ) : (
          /* DELIVERIES TAB */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                <Truck className="text-teal-600"/>
                <h3 className="font-bold text-slate-800">Order & Delivery Status</h3>
             </div>
             <table className="w-full text-left">
                <thead className="bg-slate-50">
                   <tr>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Patient</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Medicine</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {getDeliveries().map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                         <td className="p-4 text-sm text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                         <td className="p-4 font-bold text-slate-800">{item.patient}</td>
                         <td className="p-4 text-sm text-slate-600">{item.medicine}</td>
                         <td className="p-4">
                            {item.status === 'delivered' ? (
                               <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                  <CheckCircle2 size={12}/> Delivered
                               </span>
                            ) : (
                               <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                  <Truck size={12}/> On Way
                               </span>
                            )}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. ADD / EDIT MODAL */}
      {(showAddModal || showEditModal) && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
               <div className="bg-teal-600 p-4 flex justify-between items-center text-white">
                  <h3 className="font-bold">{showEditModal ? "Edit Medicine" : "Add New Medicine"}</h3>
                  <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="hover:bg-white/20 p-1 rounded"><X size={20}/></button>
               </div>
               
               <form onSubmit={showEditModal ? handleEditSubmit : handleAddSubmit} className="p-6 space-y-4">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase">Medicine Name</label>
                     <input 
                        className="w-full mt-1 p-3 border rounded-xl bg-slate-50 outline-none focus:border-teal-500"
                        placeholder="e.g. Paracetamol"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Stock Qty</label>
                        <input 
                           type="number"
                           className="w-full mt-1 p-3 border rounded-xl bg-slate-50 outline-none focus:border-teal-500"
                           placeholder="0"
                           value={formData.quantity}
                           onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Price ($)</label>
                        <input 
                           type="number"
                           className="w-full mt-1 p-3 border rounded-xl bg-slate-50 outline-none focus:border-teal-500"
                           placeholder="0.00"
                           value={formData.price}
                           onChange={(e) => setFormData({...formData, price: e.target.value})}
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Dosage</label>
                        <input 
                           className="w-full mt-1 p-3 border rounded-xl bg-slate-50 outline-none focus:border-teal-500"
                           placeholder="e.g. 500mg"
                           value={formData.dosage}
                           onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Expiry</label>
                        <input 
                           type="date"
                           className="w-full mt-1 p-3 border rounded-xl bg-slate-50 outline-none focus:border-teal-500"
                           value={formData.expiry}
                           onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                        />
                     </div>
                  </div>
                  
                  <button type="submit" className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl mt-4 flex justify-center items-center gap-2">
                     <Save size={18}/> {showEditModal ? "Save Changes" : "Add to Inventory"}
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* 2. PROFILE MODAL */}
      {showProfileModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
               <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
                  <h3 className="font-bold">Pharmacy Profile</h3>
                  <button onClick={() => setShowProfileModal(false)} className="hover:bg-white/20 p-1 rounded"><X size={20}/></button>
               </div>
               
               <div className="p-6 space-y-4">
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase">Pharmacy Name</label>
                     <div className="relative mt-1">
                        <Building2 className="absolute left-3 top-3 text-slate-400" size={18}/>
                        <input 
                           className="w-full pl-10 p-3 border rounded-xl bg-slate-50 outline-none focus:border-slate-800"
                           value={profileData.pharmacyName}
                           onChange={(e) => setProfileData({...profileData, pharmacyName: e.target.value})}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                     <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-3 text-slate-400" size={18}/>
                        <input 
                           className="w-full pl-10 p-3 border rounded-xl bg-slate-50 outline-none focus:border-slate-800"
                           value={profileData.location}
                           onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        />
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-500 uppercase">Contact Email</label>
                     <div className="relative mt-1">
                        <Mail className="absolute left-3 top-3 text-slate-400" size={18}/>
                        <input 
                           className="w-full pl-10 p-3 border rounded-xl bg-slate-50 outline-none focus:border-slate-800"
                           value={profileData.email}
                           onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        />
                     </div>
                  </div>

                  <button onClick={handleProfileSave} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl mt-4">
                     Update Profile
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default PharmacyDashboard;
