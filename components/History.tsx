
import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, X, TrendingUp, RotateCcw } from 'lucide-react';
import { Medication, MedicationStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface HistoryProps {
  meds: Medication[];
}

const History: React.FC<HistoryProps> = ({ meds }) => {
  const weeklyData = [
    { day: 'M', value: 82 },
    { day: 'T', value: 88 },
    { day: 'W', value: 75 },
    { day: 'T', value: 92 },
    { day: 'F', value: 85 },
    { day: 'S', value: 90 },
    { day: 'S', value: 88 },
  ];

  const recentActivity = [
    { name: 'Metformin', time: '08:00 AM', date: 'OCT 24, 2023', status: MedicationStatus.TAKEN },
    { name: 'Lisinopril', time: '08:00 AM', date: 'OCT 24, 2023', status: MedicationStatus.TAKEN },
    { name: 'Atorvastatin', time: '02:00 PM', date: 'OCT 23, 2023', status: MedicationStatus.MISSED },
    { name: 'Aspirin', time: '08:00 PM', date: 'OCT 23, 2023', status: MedicationStatus.TAKEN },
  ];

  return (
    <div className="flex flex-col min-h-full px-6 pt-12 pb-10 bg-slate-50">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Patient Mode</p>
        </div>
        <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100 text-blue-600">
          <Calendar size={20} />
        </div>
      </header>

      {/* Date Selector Range */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><ChevronLeft size={20} /></button>
        <span className="text-sm font-bold text-gray-700">Oct 18 - Oct 24, 2023</span>
        <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><ChevronRight size={20} /></button>
      </div>

      {/* Main Graph Card - Inspired by Pill Guard UI */}
      <div className="bg-[#2D3B72] rounded-[40px] p-8 shadow-2xl shadow-blue-900/20 mb-8 text-white relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />
        
        <div className="flex justify-between items-start mb-10 relative z-10">
          <div>
            <h3 className="text-sm font-black tracking-widest text-white/90">WEEKLY CONSISTENCY</h3>
            <p className="text-[10px] font-bold text-blue-200/60 tracking-wider mt-0.5">ADHERENCE RATE</p>
          </div>
          <div className="bg-[#4ADE80]/20 text-[#4ADE80] px-3 py-1.5 rounded-xl flex items-center gap-1">
            <TrendingUp size={12} />
            <span className="text-[10px] font-black">+12.5%</span>
          </div>
        </div>

        <div className="h-44 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 800}} 
                dy={15}
              />
              <Tooltip 
                cursor={{ stroke: '#60A5FA', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '10px',
                  color: '#fff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#60A5FA" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                dot={{ r: 4, fill: '#fff', strokeWidth: 0, shadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                activeDot={{ r: 6, fill: '#fff', stroke: '#60A5FA', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Adherence Timeline */}
      <section className="flex-1">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-black text-gray-400 tracking-widest">ADHERENCE TIMELINE</h3>
          <span className="text-[10px] font-bold text-blue-600 cursor-pointer">View All</span>
        </div>
        
        <div className="space-y-4">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`p-3 rounded-2xl flex items-center justify-center shadow-sm ${
                    activity.status === MedicationStatus.TAKEN 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'bg-red-50 text-red-500'
                  }`}>
                     {activity.status === MedicationStatus.TAKEN ? (
                       <Check size={20} strokeWidth={3} />
                     ) : (
                       <X size={20} strokeWidth={3} />
                     )}
                  </div>
                  <button 
                    className="absolute -top-1 -right-1 bg-white shadow-sm rounded-full p-1 text-blue-600 border border-blue-100 hover:bg-blue-50 transition-all z-10"
                    title="Undo last action"
                  >
                    <RotateCcw size={10} />
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black text-gray-400 tracking-tighter uppercase">{activity.date}</span>
                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                    <span className="text-[10px] font-bold text-blue-600">{activity.time}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm tracking-tight">{activity.name}</h4>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                  activity.status === MedicationStatus.TAKEN 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-red-600 bg-red-50'
                }`}>
                  {activity.status === MedicationStatus.TAKEN ? 'Scheduled' : 'Missed'}
                </span>
                <span className="text-[10px] font-bold text-gray-900 mt-1">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default History;
