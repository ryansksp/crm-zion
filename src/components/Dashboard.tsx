import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatDateTimeBrasilia, diasInatividade } from '../utils/date';
import { TrendingUp, Users, Target, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const { clientes, metas, metasPorUsuario, userProfile } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'all'>('monthly');

  // Determine which meta to use based on user level
  const userMeta = (userProfile?.accessLevel === 'Diretor' || userProfile?.accessLevel === 'Gerente')
    ? metas.mensal
    : (metasPorUsuario[userProfile?.id || '']?.mensal || 0);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const clientesInativos = clientes.filter(c => {
    const dias = diasInatividade(c.dataUltimaInteracao);
    return dias > 3 && !['Venda Ganha', 'Venda Perdida'].includes(c.etapa);
  });

  const vendasGanhas = clientes.filter(c => c.etapa === 'Venda Ganha');
  const vendasPerdidas = clientes.filter(c => c.etapa === 'Venda Perdida');

  // Date filtering logic
  const [year, month] = selectedMonth.split('-').map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const isMonthly = selectedPeriod === 'monthly';

  const filteredClientes = isMonthly
    ? clientes.filter(c => new Date(c.dataCriacao) >= startOfMonth && new Date(c.dataCriacao) <= endOfMonth)
    : clientes;

  const filteredVendasGanhas = isMonthly
    ? vendasGanhas.filter(c => c.dataVenda && new Date(c.dataVenda) >= startOfMonth && new Date(c.dataVenda) <= endOfMonth)
    : vendasGanhas;

  const filteredVendasPerdidas = isMonthly
    ? vendasPerdidas.filter(c => c.dataPerda && new Date(c.dataPerda) >= startOfMonth && new Date(c.dataPerda) <= endOfMonth)
    : vendasPerdidas;

  const filteredTotalVendido = filteredVendasGanhas.reduce((sum, c) => sum + Number(c.valorCredito || 0), 0);
  const filteredTotalPerdido = filteredVendasPerdidas.reduce((sum, c) => sum + Number(c.valorCredito || 0), 0);
  const filteredTaxaConversao = filteredClientes.length > 0 ? (filteredVendasGanhas.length / filteredClientes.length) * 100 : 0;

  // Calculate selected month sales for meta
  const selectedMonthSales = isMonthly
    ? filteredVendasGanhas.reduce((sum, c) => sum + Number(c.valorCredito || 0), 0)
    : vendasGanhas
        .filter(c => {
          const currentMonth = new Date();
          const startOfCurrentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          const endOfCurrentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);
          return c.dataVenda && new Date(c.dataVenda) >= startOfCurrentMonth && new Date(c.dataVenda) <= endOfCurrentMonth;
        })
        .reduce((sum, c) => sum + Number(c.valorCredito || 0), 0);

  const selectedMonthName = isMonthly
    ? new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long' })
    : new Date().toLocaleDateString('pt-BR', { month: 'long' });

  // Capitalize first letter of month name
  const capitalizedMonthName = selectedMonthName.charAt(0).toUpperCase() + selectedMonthName.slice(1);

  const filteredAtividades = isMonthly
    ? clientes.filter(c => new Date(c.dataUltimaInteracao) >= startOfMonth)
        .sort((a, b) => new Date(b.dataUltimaInteracao).getTime() - new Date(a.dataUltimaInteracao).getTime())
        .slice(0, 5)
    : clientes
        .sort((a, b) => new Date(b.dataUltimaInteracao).getTime() - new Date(a.dataUltimaInteracao).getTime())
        .slice(0, 5);

  // Generate month options (last 12 months)
  const monthOptions = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
    monthOptions.push({ value, label });
  }

  const filteredEstatisticas = [
    {
      titulo: isMonthly ? 'Total de Leads (Mês)' : 'Total de Leads',
      valor: filteredClientes.length,
      icon: Users,
      cor: 'text-blue-600',
      bgCor: 'bg-blue-50'
    },
    {
      titulo: isMonthly ? 'Vendas no Mês' : 'Vendas Totais',
      valor: filteredVendasGanhas.length,
      icon: TrendingUp,
      cor: 'text-green-600',
      bgCor: 'bg-green-50'
    },
    {
      titulo: isMonthly ? 'Valor Vendido (Mês)' : 'Valor Total Vendido',
      valor: `R$ ${filteredTotalVendido.toLocaleString('pt-BR')}`,
      icon: TrendingUp,
      cor: 'text-green-600',
      bgCor: 'bg-green-50'
    },
    {
      titulo: isMonthly ? 'Leads Perdidos (Mês)' : 'Leads Perdidos',
      valor: filteredVendasPerdidas.length,
      icon: AlertTriangle,
      cor: 'text-red-600',
      bgCor: 'bg-red-50'
    },
    {
      titulo: isMonthly ? 'Valor Perdido (Mês)' : 'Valor Total Perdido',
      valor: `R$ ${filteredTotalPerdido.toLocaleString('pt-BR')}`,
      icon: AlertTriangle,
      cor: 'text-red-600',
      bgCor: 'bg-red-50'
    },
    {
      titulo: isMonthly ? 'Taxa de Conversão (Mês)' : 'Taxa de Conversão',
      valor: `${filteredTaxaConversao.toFixed(1)}%`,
      icon: Target,
      cor: 'text-purple-600',
      bgCor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">Visão geral da sua performance de vendas</p>

        {/* Seletor de Período */}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setSelectedPeriod('monthly')}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedPeriod === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setSelectedPeriod('all')}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedPeriod === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Todo Período
          </button>
          {selectedPeriod === 'monthly' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="ml-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredEstatisticas.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.titulo}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.valor}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgCor} dark:bg-gray-700`}>
                  <Icon className={`w-6 h-6 ${stat.cor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress da Meta */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meta Mensal ({capitalizedMonthName})</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            R$ {selectedMonthSales.toLocaleString('pt-BR')} / R$ {userMeta.toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min((selectedMonthSales / (userMeta || 1)) * 100, 100)}%`
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {((selectedMonthSales / (userMeta || 1)) * 100).toFixed(1)}% da meta atingida
        </p>
      </div>


      {/* Alertas de Clientes Inativos */}
      {clientesInativos.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                Atenção: {clientesInativos.length} cliente(s) sem interação há mais de 3 dias
              </h3>
              <div className="space-y-1">
                {clientesInativos.slice(0, 3).map(cliente => (
                  <p key={cliente.id} className="text-sm text-orange-700 dark:text-orange-300">
                    • {cliente.nome} - {cliente.etapa}
                  </p>
                ))}
                {clientesInativos.length > 3 && (
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    ... e mais {clientesInativos.length - 3} cliente(s)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Atividades Recentes */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {isMonthly ? 'Atividades Recentes (Mês)' : 'Atividades Recentes'}
        </h3>
        <div className="space-y-3">
          {filteredAtividades.map(cliente => (
            <div key={cliente.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{cliente.nome}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{cliente.etapa}</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDateTimeBrasilia(cliente.dataUltimaInteracao)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}