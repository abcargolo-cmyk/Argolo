import React from 'react';
import { Users, DollarSign, LayoutDashboard, HeartHandshake } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Legendários', icon: Users },
    { id: 'payments', label: 'Financeiro', icon: DollarSign },
    { id: 'ecosystem', label: 'Ecossistema', icon: HeartHandshake },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight">LEGENDÁRIOS</h1>
        <p className="text-xs text-slate-400 mt-1">Gestão Integrada</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 bg-slate-950 text-center text-xs text-slate-500">
        &copy; 2025 Sistema Legendários
      </div>
    </div>
  );
};

export default Sidebar;