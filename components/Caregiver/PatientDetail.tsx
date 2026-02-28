
import React, { useState } from 'react';
import { ChevronLeft, MessageSquare, Phone, Bell, Pill, CheckCircle2, AlertCircle, Clock, User, Scale, Ruler, Activity, RotateCcw, StickyNote, Send, X, Package, RefreshCw } from 'lucide-react';
import { PatientProfile, MedicationStatus, Medication, RefillRequest, ApprovalStatus } from '../../types';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';

interface PatientDetailProps {
  patient: PatientProfile;
  onBack: () => void;
  onUndoStatus: (id: string) => void;
  onMarkAsTaken: (id: string) => void;
  onAddNote: (text: string) => void;
  onSetReminder: (medId: string, time: string | undefined) => void;
  refillRequests: RefillRequest[];
  onApproveRefill: (id: string) => void;
  onRejectRefill: (id: string) => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, onUndoStatus, onMarkAsTaken, onAddNote, onSetReminder, refillRequests, onApproveRefill, onRejectRefill }) => {
  const [confirmUndoId, setConfirmUndoId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [reminderMed, setReminderMed] = useState<Medication | null>(null);
  const [tempReminderTime, setTempReminderTime] = useState('09:00');

  const chartData = [
    { day: 'M', value: 85 },
    { day: 'T', value: 95 },
    { day: 'W', value: 70 },
    { day: 'T', value: 40 },
    { day: 'F', value: 90 },
    { day: 'S', value: 100 },
    { day: 'S', value: 88 },
  ];

  const handleSaveNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
  };

  const handleSaveReminder = () => {
    if (reminderMed) {
      // Convert 24h to 12h for UI consistency if needed, but keeping string for now
      const formattedTime = new Date(`2000-01-01T${tempReminderTime}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      onSetReminder(reminderMed.id, formattedTime);
      setReminderMed(null);
    }
  };

  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    let label = "";
    let color = "";
    if (bmi < 18.5) { label = "Underweight"; color = "text-blue-500"; }
    else if (bmi < 25) { label = "Normal"; color = "text-green-500"; }
    else if (bmi < 30) { label = "Overweight"; color = "text-orange-500"; }
    else { label = "Obese"; color = "text-red-500"; }
    return { value: bmi.toFixed(1), label, color };
  };

  const bmiInfo = calculateBMI(patient.weightKg || 70, patient.heightCm || 170);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative">
      <div className="gradient-header pt-12 pb-32 px-6 text-white relative">
        <button onClick={onBack} className="absolute left-6 top-12 p-2 hover:bg-white/20 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center mt-4">
          <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden shadow-xl mb-4">
            <img src={patient.avatar} alt={patient.name} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold">{patient.name}</h1>
          <div className="flex items-center gap-2">
            <p className="text-blue-100 text-sm">{patient.condition}</p>
            {patient.patientDisplayId && (
              <span className="text-[9px] font-black text-white bg-white/20 px-1.5 py-0.5 rounded uppercase tracking-tighter backdrop-blur-sm border border-white/10">
                ID: {patient.patientDisplayId}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 -mt-20 space-y-6 pb-20">
        {/* Health Metrics Section */}
        <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Patient Overview</h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <User size={14} className="text-blue-500 mb-1" />
              <span className="text-[8px] font-bold text-gray-400 uppercase">Age</span>
              <span className="text-xs font-bold text-gray-700">{patient.age}y</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <Scale size={14} className="text-indigo-500 mb-1" />
              <span className="text-[8px] font-bold text-gray-400 uppercase">Weight</span>
              <span className="text-xs font-bold text-gray-700">{patient.weightKg || 70}kg</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <Ruler size={14} className="text-purple-500 mb-1" />
              <span className="text-[8px] font-bold text-gray-400 uppercase">Height</span>
              <span className="text-xs font-bold text-gray-700">{patient.heightCm || 170}cm</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-slate-50 rounded-2xl border border-slate-100">
              <Activity size={14} className="text-green-500 mb-1" />
              <span className="text-[8px] font-bold text-gray-400 uppercase">BMI</span>
              <span className={`text-xs font-bold ${bmiInfo?.color}`}>{bmiInfo?.value}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-blue-50 transition-all group">
            <div className="bg-blue-100 p-2.5 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
              <MessageSquare size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-600">Chat</span>
          </button>
          <button className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-green-50 transition-all group">
            <div className="bg-green-100 p-2.5 rounded-2xl text-green-600 group-hover:scale-110 transition-transform">
              <Phone size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-600">Call</span>
          </button>
          <button className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-orange-50 transition-all group">
            <div className="bg-orange-100 p-2.5 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform">
              <Bell size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-600">Nudge</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-gray-900">Weekly Performance</h3>
             <span className="text-xs font-bold text-blue-600">View Logs</span>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.value >= 80 ? '#3B82F6' : entry.value >= 60 ? '#FB923C' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Refill Requests for this patient */}
        {refillRequests.some(r => r.status === ApprovalStatus.PENDING) && (
          <section className="bg-amber-50 p-6 rounded-[32px] border border-amber-100">
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-amber-600" />
              <h3 className="text-sm font-bold text-amber-900">Pending Refills</h3>
            </div>
            <div className="space-y-3">
              {refillRequests.filter(r => r.status === ApprovalStatus.PENDING).map(req => (
                <div key={req.id} className="bg-white p-4 rounded-2xl shadow-sm border border-amber-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-900">{req.medicationName}</span>
                    <span className="text-[10px] font-bold text-amber-600">{req.pillsRemaining} pills left</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onRejectRefill(req.id)}
                      className="flex-1 py-2 text-[10px] font-bold text-gray-500 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => onApproveRefill(req.id)}
                      className="flex-1 py-2 text-[10px] font-bold text-white bg-amber-600 rounded-lg shadow-sm hover:bg-amber-700 transition-all"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Patient Notes Section */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
              <StickyNote size={18} />
            </div>
            <h3 className="text-base font-bold text-gray-900">Care Notes</h3>
          </div>

          <div className="space-y-4 mb-6">
            <div className="relative">
              <textarea 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a clinical observation or note..."
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none h-24"
              />
              <button 
                onClick={handleSaveNote}
                disabled={!newNote.trim()}
                className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 transition-all"
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-1 hide-scrollbar">
            {patient.notes && patient.notes.length > 0 ? (
              patient.notes.map((note) => (
                <div key={note.id} className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">{note.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {note.text}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-gray-400 italic">No care notes yet. Add your first observation above.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-gray-900">Active Schedule</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Set Reminders</span>
          </div>
          <div className="space-y-3">
            {patient.meds.map((med) => (
              <div key={med.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3 group">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`p-3 rounded-2xl ${med.status === MedicationStatus.TAKEN ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                        <Pill size={20} />
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setConfirmUndoId(med.id); }}
                        className="absolute -top-1 -right-1 bg-white shadow-sm rounded-full p-1 text-blue-500 border border-blue-100 hover:bg-blue-50 transition-all z-10"
                        title="Undo last action"
                      >
                        <RotateCcw size={10} />
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{med.name}</h4>
                      <p className="text-[10px] text-gray-400 font-medium">{med.dosage} • {med.time}</p>
                      {med.pillsRemaining !== undefined && (
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${med.pillsRemaining <= (med.refillThreshold || 5) ? 'bg-red-500' : 'bg-blue-500'}`} 
                              style={{ width: `${Math.min(100, (med.pillsRemaining / (med.totalPills || 30)) * 100)}%` }}
                            />
                          </div>
                          <span className={`text-[9px] font-bold ${med.pillsRemaining <= (med.refillThreshold || 5) ? 'text-red-500' : 'text-gray-400'}`}>
                            {med.pillsRemaining} left
                          </span>
                        </div>
                      )}
                      {med.reminderTime && (
                        <div className="flex items-center gap-1 mt-1 text-orange-600">
                          <Bell size={10} strokeWidth={3} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Reminder set: {med.reminderTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setReminderMed(med)}
                      className={`p-2.5 rounded-xl transition-all ${med.reminderTime ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400 hover:text-orange-500 hover:bg-orange-50'}`}
                    >
                      <Bell size={18} />
                    </button>
                    {med.status === MedicationStatus.TAKEN ? (
                      <div className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-bold">
                        <CheckCircle2 size={12} />
                        Taken
                      </div>
                    ) : (
                      <button 
                        onClick={() => onMarkAsTaken(med.id)}
                        className="flex items-center gap-1 bg-slate-50 text-slate-400 px-3 py-1.5 rounded-full text-[10px] font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Clock size={12} />
                        Upcoming
                      </button>
                    )}
                  </div>
                </div>

                {(med.status === MedicationStatus.TAKEN || med.status === MedicationStatus.MISSED) && (
                  <div className="flex justify-end border-t border-gray-50 pt-2">
                    <button 
                      onClick={() => setConfirmUndoId(med.id)}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-blue-600 transition-colors px-2 py-1 bg-slate-50 rounded-lg"
                    >
                      <RotateCcw size={12} />
                      Undo Correct
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {patient.adherence < 60 && (
          <div className="bg-red-50 p-5 rounded-3xl border border-red-100 flex items-start gap-4">
             <div className="bg-red-100 p-2 rounded-xl text-red-600">
                <AlertCircle size={20} />
             </div>
             <div>
                <h4 className="text-sm font-bold text-red-900">High Risk Alert</h4>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                  {patient.name} has missed doses this week. Correcting status might improve metrics if entries were accidental.
                </p>
                <button className="mt-3 text-xs font-bold text-red-900 underline">Send Warning</button>
             </div>
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {reminderMed && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setReminderMed(null)} />
          <div className="bg-white w-full max-w-[320px] rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setReminderMed(null)} 
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6">
                <Bell size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Set Reminder</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Set a custom notification for <strong>{reminderMed.name}</strong>.
              </p>
              
              <div className="w-full mt-6 space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Reminder Time</label>
                  <input 
                    type="time" 
                    value={tempReminderTime}
                    onChange={(e) => setTempReminderTime(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-base font-bold text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 w-full gap-3 mt-8">
                <button 
                  onClick={handleSaveReminder}
                  className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Save Reminder
                </button>
                {reminderMed.reminderTime && (
                  <button 
                    onClick={() => {
                      onSetReminder(reminderMed.id, undefined);
                      setReminderMed(null);
                    }}
                    className="w-full py-3 text-xs font-bold text-red-500 hover:underline"
                  >
                    Remove Existing Reminder
                  </button>
                )}
              </div>
              <p className="mt-4 text-[9px] text-gray-400 leading-tight">
                This will trigger a push notification to both you and the patient at the specified time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Undo Confirmation Dialog */}
      {confirmUndoId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setConfirmUndoId(null)} />
          <div className="bg-white w-full max-w-[320px] rounded-[32px] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Undo Action?</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Revert this patient's medicine status back to upcoming?
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button 
                onClick={() => setConfirmUndoId(null)}
                className="py-3 text-xs font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmUndoId) {
                    onUndoStatus(confirmUndoId);
                    setConfirmUndoId(null);
                  }
                }}
                className="py-3 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-md shadow-blue-100 active:scale-95 transition-all"
              >
                Undo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
