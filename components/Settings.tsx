
import React, { useState } from 'react';
import { User, Edit3, Bell, Bluetooth, ChevronRight, LogOut, Shield, HelpCircle, Info, Calendar, Scale, Ruler, Activity, X, Heart, Phone, MessageSquare, AlertTriangle } from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsProps {
  user: UserType;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  const [notifications, setNotifications] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const calculateBMI = (weight?: number, height?: number) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    let label = "";
    let color = "";
    let bgColor = "";
    if (bmi < 18.5) { 
      label = "Underweight"; 
      color = "text-blue-500"; 
      bgColor = "bg-blue-50";
    } else if (bmi < 25) { 
      label = "Normal"; 
      color = "text-green-500"; 
      bgColor = "bg-green-50";
    } else if (bmi < 30) { 
      label = "Overweight"; 
      color = "text-orange-500"; 
      bgColor = "bg-orange-50";
    } else { 
      label = "Obese"; 
      color = "text-red-500"; 
      bgColor = "bg-red-50";
    }

    return { value: bmi.toFixed(1), label, color, bgColor };
  };

  const bmiInfo = calculateBMI(user.weightKg, user.heightCm);

  const menuItems = [
    { label: 'Medication Schedule', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Privacy & Security', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Help & Support', icon: HelpCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'About PillCare', icon: Info, color: 'text-gray-500', bg: 'bg-gray-50' },
  ];

  const handleEmergencyAlert = () => {
    if (!user.caregiverPhone) return;
    alert(`Emergency SMS Alert sent to ${user.caregiverName} (${user.caregiverPhone}): "PillCare Alert: Emergency status reported by ${user.name}. Please check in immediately."`);
  };

  return (
    <div className="flex flex-col px-6 pt-12 pb-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </header>

      {/* Profile Card */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center mb-6 relative">
        <button className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-full transition-all">
          <Edit3 size={16} />
        </button>
        <div className="w-24 h-24 rounded-full border-4 border-blue-50 overflow-hidden shadow-inner mb-4">
          <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
        <div className="flex gap-2 mt-1">
          <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full">
              {user.role}
          </p>
          {user.role === 'patient' && user.patientDisplayId && (
            <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-full">
                ID: {user.patientDisplayId}
            </p>
          )}
        </div>
        
        {user.role === 'patient' && (
          <div className="grid grid-cols-3 w-full gap-2 mt-6">
            <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
              <User size={14} className="text-blue-500 mb-1" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Age</span>
              <span className="text-xs font-bold text-gray-700">{user.age || '--'} yrs</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
              <Scale size={14} className="text-indigo-500 mb-1" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Weight</span>
              <span className="text-xs font-bold text-gray-700">{user.weightKg || '--'} kg</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
              <Ruler size={14} className="text-purple-500 mb-1" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Height</span>
              <span className="text-xs font-bold text-gray-700">{user.heightCm || '--'} cm</span>
            </div>
          </div>
        )}

        <div className="w-full mt-4 pt-4 border-t border-gray-50 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Email</span>
            <span className="text-gray-700 font-semibold">{user.email}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Phone</span>
            <span className="text-gray-700 font-semibold">{user.phone}</span>
          </div>
        </div>
      </div>

      {/* Caregiver Information Card */}
      {user.role === 'patient' && user.caregiverName && (
        <section className="mb-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Caregiver Information</h3>
          <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-5">
               <div className="bg-red-50 p-3 rounded-2xl text-red-500">
                  <Heart size={24} />
               </div>
               <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900">{user.caregiverName}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{user.caregiverRelationship}</p>
               </div>
               <div className="flex gap-2">
                  <a href={`tel:${user.caregiverPhone}`} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                     <Phone size={18} />
                  </a>
                  <button className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                     <MessageSquare size={18} />
                  </button>
               </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-50">
               <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Contact Phone</span>
                  <span className="text-xs font-bold text-gray-700">{user.caregiverPhone}</span>
               </div>
               {user.caregiverEmail && (
                 <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Contact Email</span>
                    <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{user.caregiverEmail}</span>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
               <a 
                href={`tel:${user.caregiverPhone}`}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md shadow-blue-100 active:scale-95 transition-all"
               >
                 <Phone size={14} />
                 Call Caregiver
               </a>
               <button 
                onClick={handleEmergencyAlert}
                className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all"
               >
                 <AlertTriangle size={14} />
                 Send Alert SMS
               </button>
            </div>
          </div>
        </section>
      )}

      {/* BMI Insight Card */}
      {user.role === 'patient' && bmiInfo && (
        <div className={`${bmiInfo.bgColor} p-5 rounded-3xl border border-white/50 shadow-sm mb-8 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-white shadow-sm ${bmiInfo.color}`}>
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Body Mass Index</p>
              <h3 className="text-lg font-bold text-gray-900">{bmiInfo.value} BMI</h3>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl bg-white font-bold text-xs shadow-sm ${bmiInfo.color}`}>
            {bmiInfo.label}
          </div>
        </div>
      )}

      {/* Preferences */}
      <section className="mb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Preferences</h3>
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
                <Bell size={20} />
              </div>
              <span className="font-semibold text-gray-700 text-sm">Notifications</span>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${notifications ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${notifications ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded-xl text-indigo-500">
                <Bluetooth size={20} />
              </div>
              <span className="font-semibold text-gray-700 text-sm">Smart Dispenser</span>
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-600">Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Menu List */}
      <section className="space-y-3 mb-8">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button 
              key={idx}
              className="w-full bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100 group hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`${item.bg} ${item.color} p-2 rounded-xl`}>
                  <Icon size={20} />
                </div>
                <span className="font-semibold text-gray-700 text-sm">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </button>
          );
        })}
      </section>

      <button 
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full py-4 bg-white text-red-600 border border-red-100 rounded-[28px] font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
      >
        <LogOut size={20} />
        Logout
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="bg-white w-full max-sm:rounded-[32px] rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6">
                <LogOut size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Are you sure you want to logout? You will need to enter your credentials to access your account again.
              </p>
              
              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={onLogout}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100 active:scale-95 transition-all"
                >
                  Logout
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 bg-gray-50 text-gray-700 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
