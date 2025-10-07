import React from 'react';
import { Crown, Users, Settings, Calculator, XCircle, LogOut, UserCheck, BarChart3, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Tab {
  key: string;
  label: string;
  icon: string;
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  availableTabs: Tab[];
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  '📊': BarChart3,
  '🔄': Activity,
  '🎯': UserCheck,
  '🧮': Calculator,
  '✅': Users,
  '❌': XCircle,
  '📈': BarChart3,
  '⚙️': Settings,
  '👤': UserCheck,
  '👥': Users,
};

export function Layout({ children, activeTab, onTabChange, availableTabs }: LayoutProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      alert('Erro ao fazer logout.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Zion CRM</h1>
                <p className="text-xs text-gray-500">CRM Embracon</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  console.log('Profile button clicked');
                  onTabChange('profile');
                }}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 cursor-pointer"
                title="Perfil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                </svg>
                <span>Perfil</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <nav className="w-64 bg-white rounded-lg shadow-sm p-4 h-fit">
            <ul className="space-y-2">
              {availableTabs.map((tab) => {
                const Icon = iconMap[tab.icon] || UserCheck;
                return (
                  <li key={tab.key}>
                    <button
                      onClick={() => onTabChange(tab.key)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                        activeTab === tab.key
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
