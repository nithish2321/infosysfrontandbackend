// src/components/patient/MissedReasonModal.jsx
import { useState } from "react";

const REASONS = [
  "Forgot to take it",
  "Ran out of medicine",
  "Side effects / Allergy",
  "Felt better so skipped",
  "Other"
];

const MissedReasonModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
        <h3 className="text-lg font-black text-red-600 mb-2">Reason for Missing?</h3>
        <p className="text-sm text-slate-500 mb-4">This helps your doctor adjust your plan.</p>

        <div className="space-y-2 mb-6">
          {REASONS.map(reason => (
            <label 
              key={reason} 
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                selectedReason === reason ? "bg-red-50 border-red-500 text-red-800" : "hover:bg-slate-50 border-slate-200"
              }`}
            >
              <input 
                type="radio" 
                name="reason" 
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                className="accent-red-600"
              />
              <span className="font-semibold text-sm">{reason}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold rounded-xl hover:bg-slate-100">
            Cancel
          </button>
          <button 
            onClick={() => onSubmit(selectedReason)}
            disabled={!selectedReason}
            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissedReasonModal;