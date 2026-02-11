// src/components/doctor/MedicineAssignModal.jsx
import { useEffect, useState } from "react";
import { X, Clock, Pill, Search, Check, AlertTriangle, Store, MapPin, DollarSign } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const MedicineAssignModal = ({ isOpen, onClose, patientId, patientName }) => {
  const { medicineMaster, assignMedicine, fetchPharmacyAvailability } = useAppContext();

  // Form State
  const [search, setSearch] = useState("");
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [scheduleTimes, setScheduleTimes] = useState(["08:00", "20:00"]);

  const filteredMeds = medicineMaster.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (value) => {
    const numberValue = Number(value);
    if (value === null || value === undefined || Number.isNaN(numberValue)) {
      return "N/A";
    }
    return `$${numberValue.toFixed(2)}`;
  };

  const handleDrugSelect = (drug) => {
    setSelectedDrug(drug);
    setSearch(drug.name);
    setDosage(drug.strength);
    setScheduleTimes(drug.defaultSchedule || ["08:00"]);
  };

  useEffect(() => {
    if (!isOpen || !selectedDrug) {
      setAvailability([]);
      setSelectedInventory(null);
      return;
    }

    let active = true;
    const loadAvailability = async () => {
      setAvailabilityLoading(true);
      try {
        const list = await fetchPharmacyAvailability(selectedDrug.name);
        if (!active) return;
        setAvailability(list);
        setSelectedInventory(list[0] || null);
      } catch (error) {
        if (!active) return;
        setAvailability([]);
        setSelectedInventory(null);
      } finally {
        if (active) setAvailabilityLoading(false);
      }
    };

    loadAvailability();
    return () => {
      active = false;
    };
  }, [isOpen, selectedDrug, fetchPharmacyAvailability]);

  const handleAddTime = () => {
    setScheduleTimes([...scheduleTimes, "12:00"]);
  };

  const handleTimeChange = (index, val) => {
    const newTimes = [...scheduleTimes];
    newTimes[index] = val;
    setScheduleTimes(newTimes);
  };

  const handleRemoveTime = (index) => {
    setScheduleTimes(scheduleTimes.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedDrug || !dosage) {
      toast.error("Please select a drug and dosage");
      return;
    }

    if (!selectedInventory) {
      toast.error("Please choose an available pharmacy");
      return;
    }

    const newMedicine = {
      name: selectedDrug.name,
      dosage: dosage,
      type: selectedDrug.type,
      instructions: instructions || "As advised",
      inventoryItemId: selectedInventory.inventoryItemId,
      schedule: scheduleTimes.map((time) => ({
        time,
        status: "pending",
        takenAt: null,
      })),
    };

    try {
      await assignMedicine(patientId, newMedicine);
      toast.success(`Prescribed ${selectedDrug.name} to ${patientName}`);
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to assign medicine");
    }
  };

  const canAssign = !!selectedInventory && !availabilityLoading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-teal-600 p-4 flex justify-between items-center text-white">
          <div>
            <h2 className="font-bold text-lg">Prescribe Medicine</h2>
            <p className="text-xs text-teal-100">For Patient: {patientName}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* 1. Search Drug */}
          <div className="relative">
            <label className="text-xs font-bold text-slate-500 uppercase">Search Drug</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedDrug(null);
                  setAvailability([]);
                  setSelectedInventory(null);
                }}
                placeholder="Type medicine name..."
                className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-teal-500 outline-none"
              />
            </div>

            {/* Dropdown */}
            {search && !selectedDrug && (
              <div className="absolute top-full left-0 w-full bg-white border rounded-xl shadow-xl mt-1 z-10 max-h-40 overflow-y-auto">
                {filteredMeds.map((med) => (
                  <div
                    key={med.id}
                    onClick={() => handleDrugSelect(med)}
                    className="p-3 hover:bg-teal-50 cursor-pointer border-b last:border-0 flex justify-between items-center"
                  >
                    <span className="font-bold text-slate-700">{med.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      {med.strength}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Pharmacy Availability */}
          {selectedDrug && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase">Available Pharmacies</label>
                <span className="text-xs text-slate-400 font-semibold">
                  {availabilityLoading ? "Checking stock..." : `${availability.length} option(s)`}
                </span>
              </div>

              {!availabilityLoading && availability.length === 0 && (
                <div className="text-xs font-bold text-red-500 flex items-center gap-1">
                  <AlertTriangle size={12} /> No pharmacy has this medicine in stock.
                </div>
              )}

              <div className="space-y-2">
                {availability.map((item) => {
                  const isSelected = selectedInventory?.inventoryItemId === item.inventoryItemId;
                  return (
                    <button
                      key={item.inventoryItemId}
                      type="button"
                      onClick={() => setSelectedInventory(item)}
                      className={`w-full text-left p-3 rounded-xl border transition ${
                        isSelected
                          ? "border-teal-500 bg-teal-50 shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-2">
                            <Store size={14} /> {item.pharmacyName}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={12} /> {item.pharmacyLocation}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Stock</p>
                          <p className="text-sm font-black text-slate-700">{item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <DollarSign size={12} /> {formatPrice(item.price)}
                        </span>
                        {item.dosage && <span className="text-slate-400">{item.dosage}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Dosage & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Dosage / Strength</label>
              <input
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full mt-1 p-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
              <div className="mt-1 p-3 rounded-xl bg-slate-100 text-slate-600 flex items-center gap-2">
                <Pill size={16} /> {selectedDrug?.type || "N/A"}
              </div>
            </div>
          </div>

          {/* 4. Instructions */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Instructions</label>
            <input
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. After food"
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          {/* 5. Schedule */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Clock size={12} /> Schedule Times
              </label>
              <button
                onClick={handleAddTime}
                className="text-xs font-bold text-teal-600 hover:underline"
              >
                + Add Time
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {scheduleTimes.map((time, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 bg-white border px-2 py-1 rounded-lg shadow-sm"
                >
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    className="font-bold text-slate-700 outline-none text-sm"
                  />
                  <button
                    onClick={() => handleRemoveTime(idx)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canAssign}
            className={`px-5 py-2 rounded-xl font-bold flex items-center gap-2 text-white ${
              !canAssign ? "bg-slate-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            <Check size={18} /> Assign Prescription
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicineAssignModal;
