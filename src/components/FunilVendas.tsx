import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Plus, User, Phone, Calendar, AlertTriangle, ChevronLeft, ChevronRight, ArrowRight, DollarSign } from 'lucide-react';
import { EtapaFunil } from '../types';

export function FunilVendas() {
  const { clientes, moverClienteEtapa, adicionarCliente } = useApp();
  const [showNovoCliente, setShowNovoCliente] = useState(false);

  const etapas: EtapaFunil[] = [
    'Novo Cliente',
    'Lead',
    'Contato Inicial',
    'Envio de Simulação',
    'Follow-up',
    'Negociação Final',
    'Venda Ganha',
    'Venda Perdida'
  ];

  const coresEtapas = {
    'Novo Cliente': 'bg-indigo-100 text-indigo-700',
    'Lead': 'bg-gray-100 text-gray-700',
    'Contato Inicial': 'bg-blue-100 text-blue-700',
    'Envio de Simulação': 'bg-yellow-100 text-yellow-700',
    'Follow-up': 'bg-orange-100 text-orange-700',
    'Negociação Final': 'bg-purple-100 text-purple-700',
    'Venda Ganha': 'bg-green-100 text-green-700',
    'Venda Perdida': 'bg-red-100 text-red-700'
  };

  const diasInatividade = (dataUltimaInteracao: string) => {
    return Math.floor((Date.now() - new Date(dataUltimaInteracao).getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleNovoCliente = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    adicionarCliente({
      nome: formData.get('nome') as string,
      telefone: formData.get('telefone') as string,
      email: formData.get('email') as string,
      planoInteresse: formData.get('planoInteresse') as string,
      valorCredito: parseFloat(formData.get('valorCredito') as string) || 0,
      etapa: 'Lead',
      dataUltimaInteracao: new Date().toISOString(),
      historico: [],
      simulacoes: []
    });
    
    setShowNovoCliente(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Funil de Vendas</h2>
          <p className="text-gray-600">Gerencie seu pipeline de clientes</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowNovoCliente(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Sales Pipeline - Vertical Split Layout */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Top row: Early stages */}
        <div className="flex items-start space-x-6 overflow-x-auto py-4">
          {etapas.slice(0, 4).map((etapa, etapaIndex) => {
            const clientesEtapa = clientes.filter(c => c.etapa === etapa);
            const totalValor = clientesEtapa.reduce((sum, c) => sum + (c.valorCredito || 0), 0);

            return (
              <React.Fragment key={etapa}>
                <div className="bg-gray-50 p-4 rounded-lg min-w-[240px] w-[240px] flex-shrink-0 flex flex-col max-h-[400px] border border-gray-200">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">{etapa}</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Leads:</span>
                        <span className="font-medium">{clientesEtapa.length}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Valor:</span>
                        <span className="font-medium">R$ {totalValor.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 overflow-y-auto flex-grow">
                    {clientesEtapa.map(cliente => {
                      const dias = diasInatividade(cliente.dataUltimaInteracao);
                      const inativo = dias > 3 && !['Venda Ganha', 'Venda Perdida'].includes(etapa);

                      return (
                        <div
                          key={cliente.id}
                          className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{cliente.nome}</h4>
                            {inativo && (
                              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            )}
                          </div>

                          <div className="space-y-1 text-xs text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3" />
                              <span className="font-medium">R$ {cliente.valorCredito?.toLocaleString('pt-BR') || '0'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span className="truncate">{cliente.telefone}</span>
                            </div>
                          </div>

                          {inativo && (
                            <div className="text-xs text-orange-600 font-medium mb-2">
                              {dias} dias sem interação
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-auto">
                            <button
                              disabled={etapaIndex === 0}
                              onClick={() => moverClienteEtapa(cliente.id, etapas[etapaIndex - 1])}
                              className={`p-1 rounded ${etapaIndex > 0 ? 'bg-blue-100 hover:bg-blue-200 text-blue-600' : 'opacity-50 cursor-not-allowed text-gray-400'}`}
                              title="Mover para etapa anterior"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${coresEtapas[etapa]}`}>
                              {etapaIndex + 1}
                            </span>
                            <button
                              disabled={etapaIndex === etapas.length - 1}
                              onClick={() => moverClienteEtapa(cliente.id, etapas[etapaIndex + 1])}
                              className={`p-1 rounded ${etapaIndex < etapas.length - 1 ? 'bg-blue-100 hover:bg-blue-200 text-blue-600' : 'opacity-50 cursor-not-allowed text-gray-400'}`}
                              title="Mover para próxima etapa"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Arrow between stages */}
                {etapaIndex < 3 && (
                  <div className="flex items-center justify-center flex-shrink-0 mt-20">
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Bottom row: Later stages */}
        <div className="flex items-start space-x-6 overflow-x-auto py-4">
          {etapas.slice(4).map((etapa, etapaIndex) => {
            const clientesEtapa = clientes.filter(c => c.etapa === etapa);
            const totalValor = clientesEtapa.reduce((sum, c) => sum + (c.valorCredito || 0), 0);

            return (
              <React.Fragment key={etapa}>
                <div className="bg-gray-50 p-4 rounded-lg min-w-[240px] w-[240px] flex-shrink-0 flex flex-col max-h-[400px] border border-gray-200">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">{etapa}</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Leads:</span>
                        <span className="font-medium">{clientesEtapa.length}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Valor:</span>
                        <span className="font-medium">R$ {totalValor.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 overflow-y-auto flex-grow">
                    {clientesEtapa.map(cliente => {
                      const dias = diasInatividade(cliente.dataUltimaInteracao);
                      const inativo = dias > 3 && !['Venda Ganha', 'Venda Perdida'].includes(etapa);

                      return (
                        <div
                          key={cliente.id}
                          className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{cliente.nome}</h4>
                            {inativo && (
                              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            )}
                          </div>

                          <div className="space-y-1 text-xs text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-3 h-3" />
                              <span className="font-medium">R$ {cliente.valorCredito?.toLocaleString('pt-BR') || '0'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span className="truncate">{cliente.telefone}</span>
                            </div>
                          </div>

                          {inativo && (
                            <div className="text-xs text-orange-600 font-medium mb-2">
                              {dias} dias sem interação
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-auto">
                            <button
                              disabled={etapaIndex === 0}
                              onClick={() => moverClienteEtapa(cliente.id, etapas[etapaIndex - 1 + 4])}
                              className={`p-1 rounded ${etapaIndex > 0 ? 'bg-blue-100 hover:bg-blue-200 text-blue-600' : 'opacity-50 cursor-not-allowed text-gray-400'}`}
                              title="Mover para etapa anterior"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${coresEtapas[etapa]}`}>
                              {etapaIndex + 5}
                            </span>
                            <button
                              disabled={etapaIndex === etapas.length - 5}
                              onClick={() => moverClienteEtapa(cliente.id, etapas[etapaIndex + 1 + 4])}
                              className={`p-1 rounded ${etapaIndex < etapas.length - 5 ? 'bg-blue-100 hover:bg-blue-200 text-blue-600' : 'opacity-50 cursor-not-allowed text-gray-400'}`}
                              title="Mover para próxima etapa"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Arrow between stages */}
                {etapaIndex < etapas.length - 5 && (
                  <div className="flex items-center justify-center flex-shrink-0 mt-20">
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Modal Novo Cliente */}
      {showNovoCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Novo Cliente</h3>
            <form onSubmit={handleNovoCliente} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  name="nome"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  name="telefone"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plano de Interesse</label>
                <input
                  type="text"
                  name="planoInteresse"
                  required
                  placeholder="Ex: Plano Mais por Menos - Auto"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Venda</label>
                <input
                  type="number"
                  name="valorCredito"
                  required
                  min="0"
                  step="0.01"
                  placeholder="Ex: 10000.00"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNovoCliente(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}