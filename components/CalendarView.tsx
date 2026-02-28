import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pill, Clock, CheckCircle2, Package, AlertTriangle, Plus, Send, X, RotateCcw } from 'lucide-react';
import { Medication, MedicationStatus, MedicationLog } from '../types';

interface CalendarViewProps {
  meds: Medication[];
  onUpdateStock: (id: string, count: number) => void;
  onUndoStatus: (id: string) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  medicationLogs: MedicationLog[];
}

interface ToastState {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ meds, onUpdateStock, onUndoStatus, selectedDate, onDateChange, medicationLogs }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);
  const [stockInputValue, setStockInputValue] = useState<string>('');

  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const showToast = (message: string, actionLabel?: string, onAction?: () => void) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    
    setToast({
      id: Math.random().toString(),
      message,
      actionLabel,
      onAction
    });

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const handleStockUpdate = () => {
    if (updatingStockId && stockInputValue) {
      const val = parseInt(stockInputValue);
      if (!isNaN(val)) {
        onUpdateStock(updatingStockId, val);
        showToast('Stock updated successfully');
      }
      setUpdatingStockId(null);
      setStockInputValue('');
    }
  };

  const handleRequestRefill = (medName: string) => {
    showToast(`Refill requested for ${medName}`, 'Dismiss');
  };

  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-12 w-full" />);
  }

  for (let d = 1; d <= numDays; d++) {
    const date = new Date(year, month, d);
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const isToday = date.toDateString() === new Date().toDateString();
    const hasTasks = d % 2 === 0 || d % 3 === 0;

    calendarDays.push(
      <button
        key={d}
        onClick={() => onDateChange(date)}
        className={`h-12 w-full flex flex-col items-center justify-center rounded-2xl transition-all relative ${
          isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105 z-10' : 
          isToday ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-700 hover:bg-slate-50'
        }`}
      >
        <span className="text-sm">{d}</span>
        {hasTasks && !isSelected && (
          <div className="absolute bottom-1.5 w-1 h-1 bg-blue-400 rounded-full" />
        )}
      </button>
    );
  }

  const getMedsForSelectedDate = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return meds.map(m => {
      const log = medicationLogs.find(l => l.medicationId === m.id && l.date === dateStr && l.time === m.time);
      return { ...m, status: log ? log.status : MedicationStatus.UPCOMING };
    });
  };

  const medsForSelectedDate = getMedsForSelectedDate();
  const uniqueMeds = meds.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);

  return (
    <div className="flex flex-col min-h-full px-6 pt-12 pb-24 bg-slate-50 relative">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task Calendar</h1>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Plan your health schedule</p>
      </header>

      {/* Month Navigation */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-800">{monthName} {year}</h2>
          <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>
      </div>

      {/* Tasks for Selected Day */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-black text-gray-400 tracking-widest uppercase">
            Schedule for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </h3>
          <span className="text-[10px] font-bold text-blue-600">Daily View</span>
        </div>

        <div className="space-y-3">
          {medsForSelectedDate.map((med) => (
            <div key={med.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`p-3 rounded-2xl ${med.status === MedicationStatus.TAKEN ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Pill size={18} />
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUndoStatus(med.id); }}
                    className="absolute -top-1 -right-1 bg-white shadow-sm rounded-full p-1 text-blue-600 border border-blue-100 hover:bg-blue-50 transition-all z-10"
                    title="Undo last action"
                  >
                    <RotateCcw size={10} />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm tracking-tight">{med.name}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={10} className="text-gray-400" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{med.dosage} • {med.time}</p>
                  </div>
                </div>
              </div>
              {med.status === MedicationStatus.TAKEN && (
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  Done
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Refill Counter Section - Moved from Home */}
      <section className="pb-10">
        <div className="flex justify-between items-center mb-6 px-1">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Refill Counter</h2>
            <p className="text-xs text-gray-400 font-medium">Track remaining pills & refill needs</p>
          </div>
          <Package className="text-blue-600" size={20} />
        </div>

        <div className="space-y-4">
          {uniqueMeds.map((med) => {
            const pills = med.pillsRemaining ?? 0;
            const total = med.totalPills ?? 1;
            const daily = med.dailyDosageCount ?? 1;
            const daysLeft = Math.floor(pills / daily);
            const percent = Math.min((pills / total) * 100, 100);
            
            let statusColor = "bg-emerald-500";
            let statusBg = "bg-emerald-50";
            let statusText = "text-emerald-600";
            let isCritical = false;

            if (daysLeft < 3) {
              statusColor = "bg-red-500";
              statusBg = "bg-red-50";
              statusText = "text-red-600";
              isCritical = true;
            } else if (daysLeft <= 7) {
              statusColor = "bg-orange-500";
              statusBg = "bg-orange-50";
              statusText = "text-orange-600";
            }

            return (
              <div key={`refill-${med.id}`} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${statusBg} ${statusText}`}>
                      <Package size={18} />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-sm tracking-tight">{med.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{med.dosage}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBg} ${statusText} border-current/20`}>
                      {isCritical && <AlertTriangle size={10} className="mr-0.5" />}
                      {daysLeft} Days Left
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                      {pills} pills remaining
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${statusColor} transition-all duration-700`} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase tracking-widest">
                    <span>Empty</span>
                    <span>{percent.toFixed(0)}% Stock</span>
                    <span>Full</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setUpdatingStockId(med.id);
                      setStockInputValue(pills.toString());
                    }}
                    className="flex-1 py-2.5 bg-slate-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Update Stock
                  </button>
                  <button 
                    onClick={() => handleRequestRefill(med.name)}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    Refill
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stock Update Modal Overlay */}
      {updatingStockId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setUpdatingStockId(null)} />
          <div className="bg-white w-full max-w-[320px] rounded-[40px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setUpdatingStockId(null)} 
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <Package size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Update Stock</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Enter the total number of pills available.
              </p>
              
              <div className="w-full mt-6 space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pills Remaining</label>
                  <input 
                    type="number" 
                    value={stockInputValue}
                    onChange={(e) => setStockInputValue(e.target.value)}
                    autoFocus
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-lg font-black text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 w-full gap-3 mt-8">
                <button 
                  onClick={handleStockUpdate}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default CalendarView;