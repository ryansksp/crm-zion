import React from 'react';
import { useApp } from '../contexts/AppContext';
import { TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react';

export function PainelDesempenho() {
  const { clientes, metas, obterTaxaConversao } = useApp();

  const vendas = clientes.filter(c => c.etapa === 'Venda Ganha');
  const totalVendido = metas.vendidoNoMes;
  const progressoMeta = metas.mensal > 0 ? (totalVendido / metas.mensal) * 100 : 0;

  // Dados para o gráfico de conversão por etapa
  const etapas = [
    'Lead',
    'Contato Inicial',
    'Envio de Simulação',
    'Follow-up',
    'Negociação Final',
    'Venda Ganha'
  ];

  const dadosConversao = etapas.map(etapa => ({
    etapa,
    quantidade: clientes.filter(c => c.etapa === etapa).length
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Painel de Desempenho</h2>
        <p className="text-gray-600">Acompanhe suas métricas e performance</p>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Vendido no Mês</p>
              <p className="text-2xl font-bold">R$ {totalVendido.toLocaleString('pt-BR')}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Comissão Estimada</p>
              <p className="text-2xl font-bold">R$ {metas.comissaoEstimada.toLocaleString('pt-BR')}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Taxa de Conversão</p>
              <p className="text-2xl font-bold">{obterTaxaConversao().toFixed(1)}%</p>
            </div>
            <Target className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Vendas no Mês</p>
              <p className="text-2xl font-bold">{vendas.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Gráfico de Rosca - Meta */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso da Meta Mensal</h3>
        
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 144 144">
              <circle
                cx="72"
                cy="72"
                r="60"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(progressoMeta * 377) / 100} 377`}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-bold text-gray-900">{progressoMeta.toFixed(1)}%</span>
              <span className="text-sm text-gray-600">da meta</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Vendido</p>
            <p className="text-lg font-semibold">R$ {totalVendido.toLocaleString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Meta</p>
            <p className="text-lg font-semibold">R$ {metas.mensal.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* Funil de Conversão */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Funil de Conversão</h3>
        
        <div className="space-y-3">
          {dadosConversao.map((item) => {
            const porcentagem = clientes.length > 0 ? (item.quantidade / clientes.length) * 100 : 0;
            
            return (
              <div key={item.etapa} className="flex items-center space-x-4">
                <div className="w-32 text-sm font-medium text-gray-700 truncate">
                  {item.etapa}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${porcentagem}%` }}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {item.quantidade} ({porcentagem.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Análise Mensal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Performance</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Leads Recebidos:</span>
              <span className="font-medium">{clientes.filter(c => c.etapa === 'Lead').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Em Negociação:</span>
              <span className="font-medium">
                {clientes.filter(c => ['Follow-up', 'Negociação Final'].includes(c.etapa)).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Simulações Enviadas:</span>
              <span className="font-medium">
                {clientes.filter(c => c.etapa === 'Envio de Simulação').length}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Taxa de Fechamento:</span>
              <span className="font-bold text-green-600">
                {((vendas.length / Math.max(clientes.length, 1)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metas e Objetivos</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Vendas Mensais:</span>
                <span className="font-medium">{vendas.length} / 10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((vendas.length / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Valor da Meta:</span>
                <span className="font-medium">
                  R$ {totalVendido.toLocaleString('pt-BR')} / R$ {metas.mensal.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(progressoMeta, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600">
                Faltam <strong>R$ {Math.max(metas.mensal - totalVendido, 0).toLocaleString('pt-BR')}</strong> 
                {' '}para atingir a meta mensal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}