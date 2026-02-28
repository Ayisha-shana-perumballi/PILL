
import React from 'react';
import { Home, History, Bell, Settings, Users, Calendar } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isCaregiver?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, isCaregiver }) => {
  const tabs = isCaregiver ? [
    { id: 'home' as TabType, label: 'Patients', icon: Users },
    { id: 'alerts' as TabType, label: 'Alerts', icon: Bell },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ] : [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'calendar' as TabType, label: 'Calendar', icon: Calendar },
    { id: 'history' as TabType, label: 'History', icon: History },
    { id: 'alerts' as TabType, label: 'Alerts', icon: Bell },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 px-4 py-3 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-200 flex-1 ${
              isActive ? 'text-blue-600 scale-105' : 'text-gray-400'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-blue-50' : ''}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
