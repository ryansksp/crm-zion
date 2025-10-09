import { useApp } from '../contexts/AppContext';
import { DollarSign, Target, BarChart3, UserX } from 'lucide-react';

export function PainelDesempenho() {
  const { clientesPorUsuario, metasPorUsuario, userProfile, userProfiles, clientes, metas, obterTaxaConversao } = useApp();

  if (!userProfile) {
    return <div>Carregando...</div>;
  }

  // Se for Diretor ou Gerente, mostrar dados por usuário
  if (userProfile.accessLevel === 'Diretor' || userProfile.accessLevel === 'Gerente') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Painel de Desempenho</h2>
          <p className="text-gray-600">Acompanhe suas métricas e performance por usuário</p>
        </div>

        {Object.entries(clientesPorUsuario).map(([userId, clientes]) => {
          const metas = metasPorUsuario[userId] || { mensal: 0, vendidoNoMes: 0 };
          const userName = userProfiles[userId]?.name || userId;
          const vendas = clientes.filter(c => c.etapa === 'Venda Ganha');
          const perdidos = clientes.filter(c => c.etapa === 'Venda Perdida');
          const totalVendido = vendas.reduce((sum, c) => sum + Number(c.valorCredito || 0), 0);
          const totalPerdido = perdidos.reduce((sum, c) => sum + Number(c.valorCredito || 0), 0);
          const progressoMeta = metas.mensal > 0 ? (totalVendido / metas.mensal) * 100 : 0;

          return (
            <div key={userId} className="border rounded p-4 mb-6 bg-white shadow">
              <h3 className="text-xl font-semibold mb-4">Usuário: {userName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="flex items-center space-x-4">
                  <UserX className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Leads</p>
                    <p className="text-xl font-bold">{clientes.filter(c => c.etapa === 'Lead').length}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Vendas no Mês</p>
                    <p className="text-xl font-bold">{vendas.length}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Valor Total Vendido</p>
                    <p className="text-xl font-bold">R$ {totalVendido.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <UserX className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Leads Perdidos</p>
                    <p className="text-xl font-bold">{perdidos.length}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <DollarSign className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Valor Total Perdido</p>
                    <p className="text-xl font-bold">R$ {totalPerdido.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Target className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Meta Mensal</p>
                    <p className="text-xl font-bold">R$ {metas.mensal.toLocaleString('pt-BR')}</p>
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressoMeta, 100)}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {progressoMeta.toFixed(1)}% da meta atingida
                    </p>
                  </div>
                </div>
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
  const progressoMeta = metas.mensal > 0 ? (totalVendido / metas.mensal) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Painel de Desempenho</h2>
        <p className="text-gray-600">Acompanhe suas métricas e performance</p>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4">
          <UserX className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Total de Leads</p>
            <p className="text-xl font-bold">{clientes.filter(c => c.etapa === 'Lead').length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4">
          <BarChart3 className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Vendas no Mês</p>
            <p className="text-xl font-bold">{vendas.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Valor Total Vendido</p>
            <p className="text-xl font-bold">R$ {totalVendido.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4">
          <UserX className="w-8 h-8 text-red-600" />
          <div>
            <p className="text-sm text-gray-600">Leads Perdidos</p>
            <p className="text-xl font-bold">{perdidos.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4">
          <DollarSign className="w-8 h-8 text-red-600" />
          <div>
            <p className="text-sm text-gray-600">Valor Total Perdido</p>
            <p className="text-xl font-bold">R$ {totalPerdido.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4">
          <Target className="w-8 h-8 text-purple-600" />
          <div>
            <p className="text-sm text-gray-600">Taxa de Conversão</p>
            <p className="text-xl font-bold">{obterTaxaConversao().toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Meta Mensal */}
      <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Meta Mensal</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressoMeta, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>R$ {totalVendido.toLocaleString('pt-BR')}</span>
          <span>R$ {metas.mensal.toLocaleString('pt-BR')}</span>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          {progressoMeta.toFixed(1)}% da meta atingida
        </p>
      </div>
    </div>
  );
}
