import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { FunilVendas } from './components/FunilVendas';
import { Simulador } from './components/Simulador';
import { ClientesAtivos } from './components/ClientesAtivos';
import { ClientesPerdidos } from './components/ClientesPerdidos';
import { PainelDesempenho } from './components/PainelDesempenho';
import { Configuracoes } from './components/Configuracoes';
import { Login } from './components/Login';
import { Profile } from './components/Profile';


function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

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

  // Define accessible tabs based on accessLevel
  const accessLevel = userProfile?.accessLevel || 'Operador';

  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'funil', label: 'Funil de Vendas' },
    { key: 'simulador', label: 'Simulador' },
    { key: 'clientes-ativos', label: 'Clientes Ativos' },
    { key: 'clientes-perdidos', label: 'Clientes Perdidos' },
    { key: 'desempenho', label: 'Painel de Desempenho' },
    { key: 'configuracoes', label: 'Configurações' },
    { key: 'profile', label: 'Perfil' }
  ];

  // Example: restrict 'configuracoes' tab to Gerente and Diretor only
  const filteredTabs = tabs.filter(tab => {
    if (tab.key === 'configuracoes' && accessLevel === 'Operador') {
      return false;
    }
    return true;
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'funil':
        return <FunilVendas />;
      case 'simulador':
        return <Simulador />;
      case 'clientes-perdidos':
        return <ClientesPerdidos />;
      case 'clientes-ativos':
        return <ClientesAtivos />;
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
    <Layout activeTab={activeTab} onTabChange={setActiveTab} tabs={filteredTabs}>
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
