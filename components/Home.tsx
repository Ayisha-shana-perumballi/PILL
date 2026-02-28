import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, CheckCircle2, Clock, Pill, RotateCcw, X, 
  Battery, Wifi, Cpu, Sparkles, Volume2, Check, 
  ChevronRight, MessageCircle, AlertCircle, Package, Plus, Edit2, Trash2
} from 'lucide-react';
import { User, Medication, MedicationStatus, DeviceStatus, AIChangeRequest, ApprovalStatus, RefillRequest } from '../types';
import { getHealthInsights, generateInsightSpeech, AIInsightResponse } from '../services/geminiService';
import MedicationForm from './MedicationForm';

interface HomeProps {
  user: User;
  meds: Medication[];
  adherence: number;
  onMarkAsTaken: (id: string) => void;
  onUndoStatus: (id: string) => void;
  onRedoStatus: (id: string) => void;
  onApplyAIChange: (request: Omit<AIChangeRequest, 'id' | 'status' | 'timestamp'>) => void;
  aiRequests: AIChangeRequest[];
  onRefillRequest: (medicationId: string) => void;
  refillRequests: RefillRequest[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAddMedication: (data: Omit<Medication, 'id'>) => Promise<void>;
  onUpdateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  onDeleteMedication: (id: string) => Promise<void>;
}

interface ToastState {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const Home: React.FC<HomeProps> = ({ 
  user, meds, adherence, onMarkAsTaken, onUndoStatus, onRedoStatus, 
  onApplyAIChange, aiRequests, onRefillRequest, refillRequests, 
  selectedDate, onDateChange, onAddMedication, onUpdateMedication, onDeleteMedication 
}) => {
  const [aiResponse, setAiResponse] = useState<AIInsightResponse | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const [activeInsightTab, setActiveInsightTab] = useState<'summary' | 'interactions' | 'advice'>('summary');
  const [isInsightExpanded, setIsInsightExpanded] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | undefined>(undefined);
  
  const [device] = useState<DeviceStatus>({
    batteryPercentage: 88,
    signalStrength: 'Strong',
    lastSynced: 'Just now',
    firmwareVersion: 'v2.4.12',
    isConnected: true
  });

  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [meds, adherence]);

  const fetchInsights = async () => {
    setLoadingInsight(true);
    try {
      const data = await getHealthInsights(meds, adherence);
      setAiResponse(data);
    } catch (err) {
      setAiResponse({ insight: "You've had a great start by completing your morning medications on schedule. Staying consistent with your remaining doses today is essential for maintaining the safety and effectiveness of your treatment plan." });
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleListen = async () => {
    if (!aiResponse?.insight || isPlaying) return;
    setIsPlaying(true);
    try {
      const audioData = await generateInsightSpeech(aiResponse.insight);
      if (audioData) {
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const ctx = audioContextRef.current;
        const decoded = atob(audioData);
        const bytes = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  const showToast = (message: string, actionLabel?: string, onAction?: () => void) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ id: Math.random().toString(), message, actionLabel, onAction });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 5000);
  };

  const handleApply = () => {
    if (!aiResponse?.suggestedChange) return;
    const { suggestedChange } = aiResponse;
    onApplyAIChange({
      patientId: user.id,
      patientName: user.name,
      medicationId: suggestedChange.medicationId,
      medicationName: suggestedChange.medicationName,
      oldTime: suggestedChange.oldTime,
      newTime: suggestedChange.newTime,
      reason: suggestedChange.reason,
    });
    showToast('Change request sent to caregiver!');
  };

  const handleUndoAction = (id: string) => {
    onUndoStatus(id);
    showToast('Status reverted', 'Redo', () => {
      onRedoStatus(id);
      setToast(null);
    });
  };

  const handleRefill = (medId: string) => {
    onRefillRequest(medId);
    showToast('Refill request sent to caregiver!');
  };

  const lowStockCount = meds.filter(m => (m.pillsRemaining ?? 10) <= (m.refillThreshold ?? 5)).length;
  const remainingToday = meds.filter(m => m.status === MedicationStatus.UPCOMING).length;
  const pendingRequest = aiRequests.find(r => r.status === ApprovalStatus.PENDING);

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const dateLabel = isToday ? 'Today' : selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div className="flex flex-col min-h-full bg-slate-50 relative pb-10">
      {/* 1. Header Greeting Section */}
      <header className="gradient-header pt-10 pb-12 px-8 rounded-b-[40px] shadow-lg relative overflow-hidden">
        {/* Decorative background curves */}
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[150%] bg-white/5 rounded-full blur-3xl transform rotate-12"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isToday ? `Good Morning, ${user.name.split(' ')[0]}` : user.name.split(' ')[0]}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-white/80 text-xs font-medium">{dateLabel}'s Schedule</p>
              {!isToday && (
                <button 
                  onClick={() => onDateChange(new Date())}
                  className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md text-white border border-white/20"
                >
                  Go to Today
                </button>
              )}
            </div>
            {user.role === 'patient' && user.patientDisplayId && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-sm">
                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">ID:</span>
                <span className="text-[10px] font-bold text-white tracking-wider">{user.patientDisplayId}</span>
              </div>
            )}
          </div>
          
          {/* Adherence Ring from Photo */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48" cy="48" r="40"
                stroke="currentColor" strokeWidth="7"
                fill="transparent" className="text-white/20"
              />
              <circle
                cx="48" cy="48" r="40"
                stroke="currentColor" strokeWidth="7"
                fill="transparent"
                strokeDasharray={251.3}
                strokeDashoffset={251.3 - (251.3 * adherence) / 100}
                className="text-white transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
              <span className="text-xl font-black text-white">{adherence}%</span>
              <div className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded-full border border-white/30 backdrop-blur-sm -mt-1">
                <Check size={7} className="text-white" strokeWidth={3} />
                <span className="text-[7px] font-black text-white uppercase tracking-widest">Boost</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 -mt-8 space-y-6 relative z-20">
        {/* 2. TODAY’S SCHEDULE */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{dateLabel}'s Medications</h2>
            <button 
              onClick={() => { setEditingMed(undefined); setIsFormOpen(true); }}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md shadow-blue-100 active:scale-95 transition-all"
            >
              <Plus size={14} />
              Add Medicine
            </button>
          </div>

          <div className="space-y-2">
            {meds.map((med) => (
              <div key={med.id} className="bg-white p-3.5 rounded-[20px] shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`p-3 rounded-xl flex items-center justify-center ${med.status === MedicationStatus.TAKEN ? 'bg-emerald-50 text-emerald-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      <Pill size={20} className="transform rotate-12" />
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUndoAction(med.id); }}
                      className="absolute -top-1 -right-1 bg-white shadow-md rounded-full p-1 text-blue-600 border border-blue-100 hover:bg-blue-50 transition-all z-10"
                      title="Undo last action"
                    >
                      <RotateCcw size={10} />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base tracking-tight leading-tight">{med.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock size={10} className="text-gray-400" />
                      <p className="text-[10px] text-gray-400 font-medium tracking-tight">
                        {med.dosage} • {med.time}
                      </p>
                    </div>
                    {med.pillsRemaining !== undefined && (
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1 w-14 bg-slate-100 rounded-full overflow-hidden">
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
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setEditingMed(med); setIsFormOpen(true); }}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDeleteMedication(med.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  {med.pillsRemaining !== undefined && med.pillsRemaining <= (med.refillThreshold || 5) && (
                    <button 
                      onClick={() => handleRefill(med.id)}
                      disabled={refillRequests.some(r => r.medicationId === med.id && r.status === ApprovalStatus.PENDING)}
                      className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-all disabled:opacity-50"
                      title="Request Refill"
                    >
                      <RefreshCw size={16} className={refillRequests.some(r => r.medicationId === med.id && r.status === ApprovalStatus.PENDING) ? 'animate-spin' : ''} />
                    </button>
                  )}
                  <div className="flex items-center">
                  {med.status === MedicationStatus.TAKEN ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleUndoAction(med.id)}
                        className="p-1.5 text-gray-300 hover:text-blue-500 rounded-lg transition-all"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        <Check size={9} strokeWidth={3} /> Taken
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {med.name === "Atorvastatin" ? (
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                          <Check size={9} strokeWidth={3} /> Upcoming
                        </div>
                      ) : (
                        <button 
                          onClick={() => onMarkAsTaken(med.id)} 
                          className="bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-widest"
                        >
                          Log Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        </section>

        {/* 3. REFILL COUNTER SUMMARY STRIP */}
        <button className="w-full bg-amber-50/60 border border-amber-200/40 p-5 rounded-[22px] flex items-center justify-between group hover:bg-amber-100/50 transition-all shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600">
              <Package size={20} />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900">Refill Counter</span>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{lowStockCount} medicines low stock</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 4. SYSTEM STATUS (COMPACT) */}
        <div className="bg-slate-50 border border-slate-200/50 rounded-[22px] p-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-gray-900">System Status</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Battery size={18} className="text-emerald-500" />
                <span className="text-sm font-bold text-gray-900">{device.batteryPercentage}%</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-500">Battery</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-2"></div>
              <span className="text-xs font-medium text-gray-400">Just now</span>
            </div>
          </div>
        </div>

        {/* 5. AI INSIGHTS (BOTTOM CARD) */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-[28px] p-5 shadow-2xl text-white relative overflow-hidden group border border-white/10 mt-2">
          <div className="absolute top-[-20px] right-[-20px] p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
            <Sparkles size={100} />
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Sparkles size={16} className="text-yellow-200" fill="currentColor" />
              </div>
              <h3 className="font-bold text-sm tracking-wide">AI Health Insights</h3>
            </div>
            <button onClick={fetchInsights} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <RefreshCw size={14} className={loadingInsight ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1">
            <button 
              onClick={() => setActiveInsightTab('summary')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeInsightTab === 'summary' ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            >
              Summary
            </button>
            {aiResponse?.interactions && (
              <button 
                onClick={() => setActiveInsightTab('interactions')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeInsightTab === 'interactions' ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                Interactions
              </button>
            )}
            {aiResponse?.proactiveAdvice && (
              <button 
                onClick={() => setActiveInsightTab('advice')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeInsightTab === 'advice' ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                Advice
              </button>
            )}
          </div>
          
          <div className="min-h-[60px]">
            {loadingInsight ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-white/20 rounded-full w-full"></div>
                <div className="h-3 bg-white/20 rounded-full w-4/5"></div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeInsightTab === 'summary' && (
                  <div className="mb-4">
                    <p className={`text-sm font-medium leading-relaxed text-indigo-50/90 ${!isInsightExpanded ? 'line-clamp-2' : ''}`}>
                      {aiResponse?.insight || "Your morning medications are tracked successfully. Consistency is key for blood pressure maintenance."}
                    </p>
                    <button 
                      onClick={() => setIsInsightExpanded(!isInsightExpanded)}
                      className="text-[10px] font-bold text-yellow-200 mt-1 hover:underline underline-offset-2"
                    >
                      {isInsightExpanded ? 'View Less' : 'View More'}
                    </button>
                  </div>
                )}
                
                {activeInsightTab === 'interactions' && aiResponse?.interactions && (
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10 mb-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertCircle size={12} className="text-amber-300" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Drug Interactions</span>
                    </div>
                    <p className={`text-xs text-indigo-50/90 leading-relaxed font-medium ${!isInsightExpanded ? 'line-clamp-2' : ''}`}>
                      {aiResponse.interactions}
                    </p>
                    <button 
                      onClick={() => setIsInsightExpanded(!isInsightExpanded)}
                      className="text-[10px] font-bold text-yellow-200 mt-1 hover:underline underline-offset-2"
                    >
                      {isInsightExpanded ? 'View Less' : 'View More'}
                    </button>
                  </div>
                )}

                {activeInsightTab === 'advice' && aiResponse?.proactiveAdvice && (
                  <div className="bg-white/10 rounded-xl p-3 border border-white/10 mb-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles size={12} className="text-emerald-300" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Proactive Advice</span>
                    </div>
                    <p className={`text-xs text-indigo-50/90 leading-relaxed font-medium ${!isInsightExpanded ? 'line-clamp-2' : ''}`}>
                      {aiResponse.proactiveAdvice}
                    </p>
                    <button 
                      onClick={() => setIsInsightExpanded(!isInsightExpanded)}
                      className="text-[10px] font-bold text-yellow-200 mt-1 hover:underline underline-offset-2"
                    >
                      {isInsightExpanded ? 'View Less' : 'View More'}
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleListen}
                    disabled={isPlaying}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold transition-all backdrop-blur-md border border-white/10 disabled:opacity-50"
                  >
                    <Volume2 size={14} className={isPlaying ? 'animate-bounce' : ''} />
                    {isPlaying ? 'Speaking...' : 'Listen'}
                  </button>
                  {aiResponse?.suggestedChange && !pendingRequest && activeInsightTab === 'summary' && (
                    <button 
                      onClick={handleApply}
                      className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-white/95 px-4 py-2 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95"
                    >
                      <Check size={14} strokeWidth={3} />
                      Apply Change
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-24 right-6 z-[60]">
        <button className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-400/30 hover:scale-110 active:scale-95 transition-all">
          <MessageCircle size={28} fill="currentColor" className="opacity-90" />
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[120] animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-gray-900 text-white rounded-[28px] px-6 py-4 shadow-2xl flex items-center justify-between border border-white/10">
            <span className="text-xs font-bold tracking-tight">{toast.message}</span>
            {toast.actionLabel && toast.onAction && (
              <button 
                onClick={toast.onAction}
                className="text-blue-400 text-[10px] font-black uppercase tracking-widest ml-4 hover:text-blue-300 transition-colors"
              >
                {toast.actionLabel}
              </button>
            )}
            {!toast.actionLabel && (
              <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white ml-4">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Medication Form Modal */}
      <MedicationForm 
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingMed(undefined); }}
        initialData={editingMed}
        onSave={async (data) => {
          if (editingMed) {
            await onUpdateMedication(editingMed.id, data);
          } else {
            await onAddMedication(data);
          }
        }}
      />
    </div>
  );
};

export default Home;