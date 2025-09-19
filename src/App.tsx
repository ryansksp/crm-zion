import React, { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { FunilVendas } from './components/FunilVendas';
import { Simulador } from './components/Simulador';
import { ClientesPerdidos } from './components/ClientesPerdidos';
import { PainelDesempenho } from './components/PainelDesempenho';
import { Configuracoes } from './components/Configuracoes';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
      case 'desempenho':
        return <PainelDesempenho />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
    </AppProvider>
  );
}

export default App;