import { useApp } from '../contexts/AppContext';
import { formatDateTimeBrasilia } from '../utils/date';
import { TrendingUp, Users, Target, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const { clientes, metas, obterTaxaConversao } = useApp();

  const clientesInativos = clientes.filter(c => {
    const diasInatividade = Math.floor(
      (Date.now() - new Date(c.dataUltimaInteracao).getTime()) / (1000 * 60 * 60 * 24)
    );
    return diasInatividade > 3 && !['Venda Ganha', 'Venda Perdida'].includes(c.etapa);
  });

  const vendasGanhas = clientes.filter(c => c.etapa === 'Venda Ganha');
  const vendasPerdidas = clientes.filter(c => c.etapa === 'Venda Perdida');
  const totalVendido = vendasGanhas.reduce((sum, c) => sum + (c.valorCredito || 0), 0);
  const totalPerdido = vendasPerdidas.reduce((sum, c) => sum + (c.valorCredito || 0), 0);

  const estatisticas = [
    {
      titulo: 'Total de Leads',
      valor: clientes.length,
      icon: Users,
      cor: 'text-blue-600',
      bgCor: 'bg-blue-50'
    },
    {
      titulo: 'Vendas no Mês',
      valor: vendasGanhas.length,
      icon: TrendingUp,
      cor: 'text-green-600',
      bgCor: 'bg-green-50'
    },
    {
      titulo: 'Valor Total Vendido',
      valor: `R$ ${totalVendido.toLocaleString('pt-BR')}`,
      icon: TrendingUp,
      cor: 'text-green-600',
      bgCor: 'bg-green-50'
    },
    {
      titulo: 'Leads Perdidos',
      valor: vendasPerdidas.length,
      icon: AlertTriangle,
      cor: 'text-red-600',
      bgCor: 'bg-red-50'
    },
    {
      titulo: 'Valor Total Perdido',
      valor: `R$ ${totalPerdido.toLocaleString('pt-BR')}`,
      icon: AlertTriangle,
      cor: 'text-red-600',
      bgCor: 'bg-red-50'
    },
    {
      titulo: 'Taxa de Conversão',
      valor: `${obterTaxaConversao().toFixed(1)}%`,
      icon: Target,
      cor: 'text-purple-600',
      bgCor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral da sua performance de vendas</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estatisticas.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.titulo}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.valor}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgCor}`}>
                  <Icon className={`w-6 h-6 ${stat.cor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress da Meta */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Meta Mensal</h3>
          <span className="text-sm text-gray-500">
            R$ {(metas?.vendidoNoMes ?? 0).toLocaleString('pt-BR')} / R$ {(metas?.mensal ?? 0).toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(((metas?.vendidoNoMes ?? 0) / (metas?.mensal || 1)) * 100, 100)}%`
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          {(((metas?.vendidoNoMes ?? 0) / (metas?.mensal || 1)) * 100).toFixed(1)}% da meta atingida
        </p>
      </div>


      {/* Alertas de Clientes Inativos */}
      {clientesInativos.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-orange-800 mb-1">
                Atenção: {clientesInativos.length} cliente(s) sem interação há mais de 3 dias
              </h3>
              <div className="space-y-1">
                {clientesInativos.slice(0, 3).map(cliente => (
                  <p key={cliente.id} className="text-sm text-orange-700">
                    • {cliente.nome} - {cliente.etapa}
                  </p>
                ))}
                {clientesInativos.length > 3 && (
                  <p className="text-sm text-orange-700">
                    ... e mais {clientesInativos.length - 3} cliente(s)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Atividades Recentes */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
        <div className="space-y-3">
          {clientes
            .sort((a, b) => new Date(b.dataUltimaInteracao).getTime() - new Date(a.dataUltimaInteracao).getTime())
            .slice(0, 5)
            .map(cliente => (
              <div key={cliente.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{cliente.nome}</p>
                  <p className="text-sm text-gray-500">{cliente.etapa}</p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(cliente.dataUltimaInteracao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}