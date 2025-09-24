import React, { useState } from 'react';
import { AppProvider, useApp} from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { FunilVendas } from './components/FunilVendas';
import { Simulador } from './components/Simulador';
import { ClientesAtivos } from './components/ClientesAtivos';
import { ClientesPerdidos } from './components/ClientesPerdidos';
import { Leads } from './components/Leads';
import { PainelDesempenho } from './components/PainelDesempenho';
import { Configuracoes } from './components/Configuracoes';
import { Login } from './components/Login';
import { Profile } from './components/Profile';

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
  const { userProfile } = useApp();

  // Role-based access control for tabs
  const getAvailableTabs = () => {
    const allTabs = [
      { key: 'dashboard', label: 'Dashboard', icon: '📊' },
      { key: 'funil', label: 'Funil de Vendas', icon: '🔄' },
      { key: 'leads', label: 'Leads', icon: '🎯' },
      { key: 'simulador', label: 'Simulador', icon: '🧮' },
      { key: 'clientes-ativos', label: 'Clientes Ativos', icon: '✅' },
      { key: 'clientes-perdidos', label: 'Clientes Perdidos', icon: '❌' },
      { key: 'desempenho', label: 'Desempenho', icon: '📈' },
      { key: 'configuracoes', label: 'Configurações', icon: '⚙️' },
      { key: 'usuarios', label: 'Controle de Usuários', icon: '👥' },
    ];

    if (!userProfile) return allTabs;

    switch (userProfile.accessLevel) {
      case 'Operador':
        // Operadores têm acesso limitado
        return allTabs.filter(tab =>
          ['dashboard', 'funil', 'leads', 'simulador', 'clientes-ativos', 'clientes-perdidos'].includes(tab.key)
        );
      case 'Gerente':
        // Gerentes têm acesso a quase tudo, exceto configurações avançadas e controle de usuários
        return allTabs.filter(tab =>
          !['configuracoes', 'usuarios'].includes(tab.key)
        );
      case 'Diretor':
        // Diretores têm acesso completo
        return allTabs;
      default:
        return allTabs;
    }
  };

  const availableTabs = getAvailableTabs();
  const currentTabExists = availableTabs.some(tab => tab.key === activeTab);

  // Redirect to dashboard if current tab is not available
  if (!currentTabExists && availableTabs.length > 0) {
    setActiveTab(availableTabs[0].key);
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'funil':
        return <FunilVendas />;
      case 'leads':
        return <Leads />;
      case 'simulador':
        return <Simulador />;
      case 'clientes-ativos':
        return <ClientesAtivos />;
      case 'clientes-perdidos':
        return <ClientesPerdidos />;
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
    <Layout activeTab={activeTab} onTabChange={setActiveTab} availableTabs={availableTabs}>
      {renderContent()}
    </Layout>
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
