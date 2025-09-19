import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow p-4 flex items-center space-x-4">
        <h1 className="text-xl font-bold">Cronos Pro</h1>
        <p className="text-sm text-gray-500">CRM Embracon</p>
        <nav className="flex items-center space-x-4 ml-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-3 py-1 rounded ${
                activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={logout}
            className="flex items-center space-x-1 text-red-600 hover:text-red-800 ml-4"
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <span>Sair</span>
          </button>
        </nav>
      </header>
      <main className="flex-grow p-4">{children}</main>
    </div>
  );
}
