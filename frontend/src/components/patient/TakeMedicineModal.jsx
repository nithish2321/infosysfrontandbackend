// src/components/patient/TakeMedicineModal.jsx
import { CheckCircle, Clock, XCircle } from "lucide-react";

const TakeMedicineModal = ({ isOpen, onClose, medicineName, time, onSelectStatus }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-slate-800">{medicineName}</h2>
          <p className="text-slate-500 font-medium">Scheduled for {time}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button 
            onClick={() => onSelectStatus("on_time")}
            className="w-full p-4 rounded-xl border-2 border-green-100 bg-green-50 hover:bg-green-100 hover:border-green-300 flex items-center gap-4 transition-all group"
          >
            <CheckCircle className="text-green-600 group-hover:scale-110 transition-transform" size={24} />
            <div className="text-left">
              <p className="font-black text-green-800">Taken On Time</p>
              <p className="text-xs text-green-600">I took it as scheduled</p>
            </div>
          </button>

          <button 
            onClick={() => onSelectStatus("late")}
            className="w-full p-4 rounded-xl border-2 border-yellow-100 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-300 flex items-center gap-4 transition-all group"
          >
            <Clock className="text-yellow-600 group-hover:scale-110 transition-transform" size={24} />
            <div className="text-left">
              <p className="font-black text-yellow-800">Taken Late</p>
              <p className="text-xs text-yellow-600">I took it, but delayed</p>
            </div>
          </button>

          <button 
            onClick={() => onSelectStatus("missed")}
            className="w-full p-4 rounded-xl border-2 border-red-100 bg-red-50 hover:bg-red-100 hover:border-red-300 flex items-center gap-4 transition-all group"
          >
            <XCircle className="text-red-600 group-hover:scale-110 transition-transform" size={24} />
            <div className="text-left">
              <p className="font-black text-red-800">Missed Dose</p>
              <p className="text-xs text-red-600">I did not take this medicine</p>
            </div>
          </button>
        </div>

        <button onClick={onClose} className="mt-4 w-full text-center text-slate-400 font-bold text-sm hover:text-slate-600">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TakeMedicineModal;