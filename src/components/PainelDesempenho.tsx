import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { DollarSign, Target, BarChart3, UserX } from 'lucide-react';
import { auditLogger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';

export function PainelDesempenho() {
  const { clientesPorUsuario, metasPorUsuario, userProfile, userProfiles, clientes, obterTaxaConversao } = useApp();
  const { user } = useAuth();

  useEffect(() => {
    if (user && userProfile) {
      auditLogger.logAction(user.uid, 'REPORTS', 'VIEW_PERFORMANCE', 'Acesso ao painel de desempenho');
    }
  }, [user, userProfile]);

  if (!userProfile) {
    return <div>Carregando...</div>;
  }

  // Se for Diretor ou Gerente, mostrar dados por usuário
  if (userProfile.accessLevel === 'Diretor' || userProfile.accessLevel === 'Gerente') {
    const hasData = Object.keys(clientesPorUsuario).length > 0;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Painel de Desempenho</h2>
          <p className="text-gray-600 dark:text-gray-400">Acompanhe suas métricas e performance por usuário</p>
        </div>

        {!hasData && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Nenhum dado de performance disponível no momento.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Os dados aparecerão quando houver leads cadastrados.</p>
          </div>
        )}

        {Object.entries(clientesPorUsuario).map(([userId, clientes]) => {
          const userMetas = metasPorUsuario[userId];
          const metas = { mensal: userMetas?.mensal || 0, vendidoNoMes: userMetas?.vendidoNoMes || 0 };
          const userName = userProfiles[userId]?.name || userId;
          const vendas = clientes.filter(c => c.etapa === 'Venda Ganha');
          const perdidos = clientes.filter(c => c.etapa === 'Venda Perdida');
          const totalVendido = vendas.reduce((sum, c) => sum + Number(c.valorCredito || 0), 0);
          const totalPerdido = perdidos.reduce((sum, c) => sum + Number(c.valorCredito || 0), 0);
          const progressoMeta = metas.mensal > 0 ? (totalVendido / metas.mensal) * 100 : 0;

          return (
            <div key={userId} className="border border-gray-200 dark:border-gray-700 rounded p-4 mb-6 bg-white dark:bg-gray-800 shadow">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{userName} ({userProfiles[userId]?.accessLevel || 'N/A'})</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="flex items-center space-x-4">
                  <UserX className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Leads</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{clientes.filter(c => c.etapa === 'Lead').length}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vendas no Mês</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{vendas.length}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total Vendido</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">R$ {totalVendido.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <UserX className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Leads Perdidos</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{perdidos.length}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <DollarSign className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total Perdido</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">R$ {totalPerdido.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Target className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conversão</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{(clientes.length > 0 ? (vendas.length / clientes.length) * 100 : 0).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Meta Mensal */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mt-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Meta Mensal</h3>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressoMeta, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>R$ {totalVendido.toLocaleString('pt-BR')}</span>
                  <span>R$ {metas.mensal.toLocaleString('pt-BR')}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {progressoMeta.toFixed(1)}% da meta atingida
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const vendas = clientes.filter(c => c.etapa === 'Venda Ganha');
  const perdidos = clientes.filter(c => c.etapa === 'Venda Perdida');
  const totalVendido = vendas.reduce((sum, c) => sum + Number(c.valorCredito || 0), 0);
  const totalPerdido = perdidos.reduce((sum, c) => sum + Number(c.valorCredito || 0), 0);
  const userMetas = metasPorUsuario[userProfile.id];
  const metasUsuario = { mensal: userMetas?.mensal || 0, vendidoNoMes: userMetas?.vendidoNoMes || 0 };
  const progressoMeta = metasUsuario.mensal > 0 ? (totalVendido / metasUsuario.mensal) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Painel de Desempenho</h2>
        <p className="text-gray-600 dark:text-gray-400">Acompanhe suas métricas e performance</p>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center space-x-4">
          <UserX className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total de Leads</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{clientes.filter(c => c.etapa === 'Lead').length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center space-x-4">
          <BarChart3 className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Vendas no Mês</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{vendas.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center space-x-4">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total Vendido</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">R$ {totalVendido.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center space-x-4">
          <UserX className="w-8 h-8 text-red-600" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Leads Perdidos</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{perdidos.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center space-x-4">
          <DollarSign className="w-8 h-8 text-red-600" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total Perdido</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">R$ {totalPerdido.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm flex items-center space-x-4">
          <Target className="w-8 h-8 text-purple-600" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conversão</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{obterTaxaConversao().toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Meta Mensal */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Meta Mensal</h3>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressoMeta, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span>R$ {totalVendido.toLocaleString('pt-BR')}</span>
          <span>R$ {metasUsuario.mensal.toLocaleString('pt-BR')}</span>
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {progressoMeta.toFixed(1)}% da meta atingida
        </p>
      </div>
    </div>
  );
}
