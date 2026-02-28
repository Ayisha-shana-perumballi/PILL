
import React from 'react';
import { AlertCircle, Clock, Pill } from 'lucide-react';
import { MedicationStatus, Medication } from '../types';

interface AlertsProps {
    meds: Medication[];
}

const Alerts: React.FC<AlertsProps> = ({ meds }) => {
  const mockAlerts = [
    { name: 'Atorvastatin', dosage: '20mg', status: MedicationStatus.MISSED, time: '2:00 PM', date: 'Today' },
    { name: 'Aspirin', dosage: '81mg', status: MedicationStatus.DELAYED, time: '8:00 AM', takenTime: '9:15 AM', date: 'Today' },
    { name: 'Metformin', dosage: '500mg', status: MedicationStatus.MISSED, time: '8:00 PM', date: 'Yesterday' },
  ];

  return (
    <div className="flex flex-col min-h-full px-6 pt-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Recent Alerts</h1>
        <p className="text-gray-500 text-sm">Notifications for your medication events</p>
      </header>

      <div className="space-y-4">
        {mockAlerts.map((alert, idx) => (
          <div 
            key={idx} 
            className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden ${
              alert.status === MedicationStatus.MISSED 
                ? 'bg-red-50/30 border-red-100 text-red-900' 
                : 'bg-orange-50/30 border-orange-100 text-orange-900'
            }`}
          >
            <div className={`absolute top-0 right-0 p-3 ${alert.status === MedicationStatus.MISSED ? 'text-red-300' : 'text-orange-300'}`}>
              <AlertCircle size={40} strokeWidth={1} className="opacity-20" />
            </div>

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${alert.status === MedicationStatus.MISSED ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                <Pill size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${alert.status === MedicationStatus.MISSED ? 'text-red-500' : 'text-orange-500'}`}>
                    {alert.status}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">{alert.date}</span>
                </div>
                <h3 className="text-base font-bold mt-1">{alert.name} {alert.dosage}</h3>
                <div className="flex items-center gap-3 mt-3 text-xs opacity-70 font-medium">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    Scheduled: {alert.time}
                  </div>
                  {alert.takenTime && (
                    <div className="flex items-center gap-1">
                        <Check size={12} className="text-green-600" />
                        Taken: {alert.takenTime}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
                <button className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    alert.status === MedicationStatus.MISSED ? 'bg-red-600 text-white border-transparent hover:bg-red-700' : 'bg-orange-600 text-white border-transparent hover:bg-orange-700'
                }`}>
                    Resolve Now
                </button>
                <button className="flex-1 py-2 text-xs font-bold rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                    Snooze
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper for check icon inside alerts
const Check = ({ size, className }: { size: number, className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default Alerts;
