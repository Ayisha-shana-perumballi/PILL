import React, { useState, useEffect } from 'react';
import { X, Pill, Clock, Calendar, Save, Loader2 } from 'lucide-react';
import { Medication, MedicationStatus } from '../types';
import { db, auth } from '../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

interface MedicationFormProps {
  initialData?: Medication;
  onClose: () => void;
  isOpen: boolean;
}

const MedicationForm: React.FC<MedicationFormProps> = ({ initialData, onClose, isOpen }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00 AM');
  const [category, setCategory] = useState('General');
  const [frequency, setFrequency] = useState('Daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDosage(initialData.dosage);
      setTime(initialData.time);
      setCategory(initialData.category);
      setFrequency(initialData.frequency || 'Daily');
      setStartDate(initialData.startDate || new Date().toISOString().split('T')[0]);
      setEndDate(initialData.endDate || '');
    } else {
      setName('');
      setDosage('');
      setTime('08:00 AM');
      setCategory('General');
      setFrequency('Daily');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !dosage || !time) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not authenticated");
      }

      if (initialData?.id) {
        // UPDATE existing medicine
        await updateDoc(
          doc(db, "users", user.uid, "medicines", initialData.id),
          {
            name,
            dosage,
            time,
            category,
            frequency,
            startDate,
            endDate,
            status: initialData.status || MedicationStatus.UPCOMING,
            updatedAt: serverTimestamp(),
          }
        );
      } else {
        // ADD new medicine
        await addDoc(
          collection(db, "users", user.uid, "medicines"),
          {
            name,
            dosage,
            time,
            category,
            frequency,
            startDate,
            endDate,
            status: MedicationStatus.UPCOMING,
            createdAt: serverTimestamp(),
          }
        );
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save medication.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">
          <X size={20} />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Pill size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {initialData ? 'Edit Medicine' : 'Add Medicine'}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Medicine Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 rounded-2xl py-4 px-4"
          />

          <input
            type="text"
            placeholder="Dosage"
            required
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="w-full bg-slate-50 rounded-2xl py-4 px-4"
          />

          <input
            type="text"
            placeholder="Time (08:00 AM)"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-slate-50 rounded-2xl py-4 px-4"
          />

          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full bg-slate-50 rounded-2xl py-4 px-4"
          >
            <option>Daily</option>
            <option>Twice a day</option>
            <option>Three times a day</option>
            <option>Weekly</option>
            <option>As needed</option>
          </select>

          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-50 rounded-2xl py-4 px-4"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-50 rounded-2xl py-4 px-4"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : (
              <>
                <Save size={20} />
                {initialData ? 'Update Medicine' : 'Save Medicine'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MedicationForm;