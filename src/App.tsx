import React, { useState } from 'react';
import { AppProvider, useApp} from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { FunilVendas } from './components/FunilVendas';

import { ClientesAtivos } from './components/ClientesAtivos';
import { ClientesPerdidos } from './components/ClientesPerdidos';
import { Leads } from './components/Leads';
import { PainelDesempenho } from './components/PainelDesempenho';
import { Configuracoes } from './components/Configuracoes';
import { Login } from './components/Login';
import { Profile } from './components/Profile';
import { ControleUsuarios } from './components/ControleUsuarios';
import { Pagamentos } from './components/Pagamentos';
import PlanComparisonPopup from './components/PlanComparisonPopup';

function AppContent() {
  const { user, loading, error, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show error if there's an authentication error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-red-800 font-semibold mb-2">Erro de Autenticação</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={clearError}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <AppProvider>
      <AppContentInner activeTab={activeTab} setActiveTab={setActiveTab} />
    </AppProvider>
  );
}

function AppContentInner({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: React.Dispatch<React.SetStateAction<string>> }) {
  const { userProfile, setIsPlanComparisonOpen } = useApp();

  // Check if user is approved
  if (userProfile && userProfile.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
            <h2 className="text-yellow-800 font-semibold mb-2">Conta Pendente de Aprovação</h2>
            <p className="text-yellow-600 mb-4">
              Sua conta está aguardando aprovação do diretor. Você receberá acesso assim que for aprovado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Role-based access control for tabs
  const getAvailableTabs = () => {
    const allTabs = [
      { key: 'dashboard', label: 'Dashboard', icon: '📊' },
      { key: 'funil', label: 'Funil de Vendas', icon: '🔄' },
      { key: 'leads', label: 'Leads', icon: '🎯' },
      { key: 'simulador', label: 'Simulador', icon: '🧮' },
      { key: 'clientes-ativos', label: 'Clientes Ativos', icon: '✅' },
      { key: 'clientes-perdidos', label: 'Clientes Perdidos', icon: '❌' },
      { key: 'pagamentos', label: 'Pagamentos', icon: '💰' },
      { key: 'desempenho', label: 'Desempenho', icon: '📈' },
      { key: 'configuracoes', label: 'Configurações', icon: '⚙️' },
      { key: 'usuarios', label: 'Controle de Usuários', icon: '👥' },
    ];

    if (!userProfile) return allTabs;

    const perms = userProfile.permissions;

    if (!perms) {
      switch (userProfile.accessLevel) {
        case 'Operador':
          return allTabs.filter(tab =>
            ['dashboard', 'funil', 'leads', 'simulador', 'clientes-ativos', 'clientes-perdidos', 'pagamentos'].includes(tab.key)
          );
        case 'Gerente':
          return allTabs.filter(tab =>
            !['configuracoes', 'usuarios'].includes(tab.key)
          );
        case 'Diretor':
          return allTabs;
        default:
          return allTabs;
      }
    }

    return allTabs.filter(tab => {
      switch (tab.key) {
        case 'dashboard':
        case 'funil':
        case 'leads':
        case 'simulador':
        case 'clientes-ativos':
        case 'clientes-perdidos':
        case 'pagamentos':
        case 'desempenho':
          return perms.canViewAllClients || perms.canViewAllLeads || perms.canViewAllSimulations || perms.canViewAllReports;
        case 'configuracoes':
          return perms.canChangeSettings;
        case 'usuarios':
          return perms.canManageUsers;
        default:
          return true;
      }
    });
  };

  const availableTabs = getAvailableTabs();
  const currentTabExists = availableTabs.some(tab => tab.key === activeTab) || activeTab === 'profile';

  // Redirect to dashboard if current tab is not available
  if (!currentTabExists && availableTabs.length > 0) {
    setActiveTab(availableTabs[0].key);
  }

  const handleTabChange = (tab: string) => {
    if (tab === 'simulador') {
      setIsPlanComparisonOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'funil':
        return <FunilVendas />;
      case 'leads':
        return <Leads />;
      case 'clientes-ativos':
        return <ClientesAtivos />;
      case 'clientes-perdidos':
        return <ClientesPerdidos />;
      case 'pagamentos':
        return <Pagamentos />;
      case 'desempenho':
        return <PainelDesempenho />;
      case 'configuracoes':
        return <Configuracoes />;
      case 'usuarios':
        return <ControleUsuarios />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={handleTabChange} availableTabs={availableTabs}>
        {renderContent()}
      </Layout>
      <PlanComparisonPopup />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
