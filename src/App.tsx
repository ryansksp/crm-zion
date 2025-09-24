import React, { useState } from 'react';
import { AppProvider} from './contexts/AppContext';
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

  // TODO: Implement role-based access control for tabs based on userProfile?.accessLevel
  // const filteredTabs = tabs.filter(tab => {
  //   if (tab.key === 'configuracoes' && userProfile?.accessLevel === 'Operador') {
  //     return false;
  //   }
  //   return true;
  // });

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
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
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
