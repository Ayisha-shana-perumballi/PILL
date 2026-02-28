
import React, { useState, useMemo } from 'react';
import { UserPlus, Search, ChevronRight, Activity, TrendingUp, TrendingDown, Clock, ArrowUpDown, ChevronDown, Sparkles, Check, X, AlertCircle, Package, Pill } from 'lucide-react';
import { PatientProfile, AIChangeRequest, ApprovalStatus, RefillRequest } from '../../types';

interface CaregiverDashboardProps {
  patients: PatientProfile[];
  onSelectPatient: (patient: PatientProfile) => void;
  aiRequests: AIChangeRequest[];
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  refillRequests: RefillRequest[];
  onApproveRefill: (id: string) => void;
  onRejectRefill: (id: string) => void;
}

type SortOption = 'adherence-desc' | 'adherence-asc' | 'name-asc' | 'name-desc';

const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({ patients, onSelectPatient, aiRequests, onApproveRequest, onRejectRequest, refillRequests, onApproveRefill, onRejectRefill }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('adherence-desc');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const pendingRequests = aiRequests.filter(r => r.status === ApprovalStatus.PENDING);
  const pendingRefills = refillRequests.filter(r => r.status === ApprovalStatus.PENDING);

  const filteredAndSortedPatients = useMemo(() => {
    let result = [...patients];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.condition.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'adherence-desc': return b.adherence - a.adherence;
        case 'adherence-asc': return a.adherence - b.adherence;
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });
    return result;
  }, [patients, searchQuery, sortBy]);

  return (
    <div className="flex flex-col min-h-screen relative">
      <header className="gradient-header pt-12 pb-20 px-6 rounded-b-[40px] shadow-lg text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Caregiver Portal</h1>
          <button className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md"><UserPlus size={20} /></button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={18} />
          <input 
            type="text" placeholder="Search patients..." 
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 pl-12 pr-4 text-sm placeholder:text-white/50 focus:bg-white/20 outline-none transition-all"
          />
        </div>
      </header>

      <div className="px-6 -mt-10 space-y-6 pb-20">
        {/* AI Change Requests Section */}
        {pendingRequests.length > 0 && (
          <section className="bg-white p-6 rounded-[32px] shadow-xl border border-blue-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Sparkles size={80} className="text-blue-600" /></div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600"><Sparkles size={16} /></div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">AI Change Requests</h2>
            </div>
            
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Request from {req.patientName}</span>
                    <span className="text-[9px] font-bold text-gray-400">{new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 mb-1">{req.medicationName} Schedule Update</h3>
                  <div className="flex items-center gap-3 mb-3 bg-white p-2 rounded-xl border border-slate-100">
                    <div className="text-center flex-1">
                      <p className="text-[8px] font-bold text-gray-400 uppercase">Old</p>
                      <p className="text-xs font-black text-gray-500 line-through">{req.oldTime}</p>
                    </div>
                    <ChevronRight size={14} className="text-blue-400" />
                    <div className="text-center flex-1">
                      <p className="text-[8px] font-bold text-blue-400 uppercase">New</p>
                      <p className="text-xs font-black text-blue-600">{req.newTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 mb-4">
                    <AlertCircle size={12} className="text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-600 leading-tight italic">"{req.reason}"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onRejectRequest(req.id)} className="py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">Reject</button>
                    <button onClick={() => onApproveRequest(req.id)} className="py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700 transition-all">Approve</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Refill Requests Section */}
        {pendingRefills.length > 0 && (
          <section className="bg-white p-6 rounded-[32px] shadow-xl border border-amber-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Package size={80} className="text-amber-600" /></div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-amber-50 p-1.5 rounded-lg text-amber-600"><Package size={16} /></div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Refill Requests</h2>
            </div>
            
            <div className="space-y-4">
              {pendingRefills.map((req) => (
                <div key={req.id} className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">Request from {req.patientName}</span>
                    <span className="text-[9px] font-bold text-gray-400">{new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 mb-1">{req.medicationName} Refill</h3>
                  <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                        <Pill size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Current Stock</p>
                        <p className="text-xs font-black text-amber-600">{req.pillsRemaining} pills left</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onRejectRefill(req.id)} className="py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">Reject</button>
                    <button onClick={() => onApproveRefill(req.id)} className="py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-600 text-white shadow-md shadow-amber-100 hover:bg-amber-700 transition-all">Approve Refill</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Patient List Header */}
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-bold text-gray-900">Your Patients</h2>
          <button onClick={() => setIsSortOpen(!isSortOpen)} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 text-[10px] font-bold text-gray-600">
            <ArrowUpDown size={12} className="text-blue-500" />
            Sort
            <ChevronDown size={10} />
          </button>
        </div>

        <div className="space-y-4">
          {filteredAndSortedPatients.map((patient) => (
            <div key={patient.id} onClick={() => onSelectPatient(patient)} className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-5 hover:border-blue-200 cursor-pointer group active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={patient.avatar} alt={patient.name} className="w-14 h-14 rounded-full border-4 border-slate-50 shadow-inner object-cover" />
                  <div>
                    <h3 className="font-bold text-gray-900">{patient.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400">{patient.condition}</p>
                      {patient.patientDisplayId && (
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                          ID: {patient.patientDisplayId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-all" />
              </div>
              <div className="pt-5 border-t border-gray-50">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Adherence</span>
                  <span className="text-sm font-bold text-gray-900">{patient.adherence}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-blue-500 transition-all duration-1000`} style={{ width: `${patient.adherence}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaregiverDashboard;
