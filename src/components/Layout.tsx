import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

interface Tab {
  key: string;
  label: string;
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  tabs: Tab[];
}

export function Layout({ children, activeTab, onTabChange, tabs }: LayoutProps) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="flex items-center space-x-2 px-6 py-4 border-b">
          <img src="/crown-icon.svg" alt="Coroa" className="w-6 h-6" />
          <div>
            <h1 className="text-xl font-bold">Zion Capital</h1>
            <p className="text-xs text-gray-500">CRM</p>
          </div>
        </div>
        <nav className="flex flex-col flex-grow px-4 py-6 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center px-4 py-2 rounded text-left text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors ${
                activeTab === tab.key ? 'bg-blue-600 text-white' : ''
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-grow">
        <header className="flex justify-end items-center bg-white shadow p-4 space-x-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <User className="w-6 h-6" />
            <span>Perfil</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-1 text-red-600 hover:text-red-800"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </header>
        <main className="flex-grow p-6 bg-gray-50 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
