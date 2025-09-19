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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Funil de Vendas</h2>
          <p className="text-gray-600">Gerencie seu pipeline de clientes</p>
        </div>
        <button
          onClick={() => setShowNovoCliente(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Sales Pipeline - Horizontal Scroll */}
      <div className="flex items-start space-x-4 overflow-x-auto py-4 px-2">
        {etapas.map((etapa, etapaIndex) => {
          const clientesEtapa = clientes.filter(c => c.etapa === etapa);

          return (
            <React.Fragment key={etapa}>
              <div className="bg-gray-50 p-4 rounded-lg min-w-[280px] flex-shrink-0 flex flex-col max-h-[600px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 text-sm">{etapa}</h3>
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                    {clientesEtapa.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto flex-grow">
                  {clientesEtapa.map(cliente => {
                    const dias = diasInatividade(cliente.dataUltimaInteracao);
                    const inativo = dias > 3 && !['Venda Ganha', 'Venda Perdida'].includes(etapa);

                    return (
                      <div
                        key={cliente.id}
                        className="bg-white p-3 rounded-md shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{cliente.nome}</h4>
                          {inativo && (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                        </div>

                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{cliente.telefone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{cliente.planoInteresse}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span>R$ {cliente.valorCredito?.toLocaleString('pt-BR') || '0'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(cliente.dataUltimaInteracao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {inativo && (
                          <div className="mt-2 text-xs text-orange-600 font-medium">
                            Sem interação há {dias} dias
                          </div>
                        )}

                        <div className="mt-3 flex space-x-1 overflow-x-auto">
                          {etapas.map((novaEtapa, index) => {
                            const isCurrent = cliente.etapa === novaEtapa;
                            const etapaPos = etapas.indexOf(cliente.etapa);
                            const canMoveLeft = etapaPos > 0;
                            const canMoveRight = etapaPos < etapas.length - 1;

                            return (
                              <React.Fragment key={novaEtapa}>
                                {isCurrent && (
                                  <div className="flex items-center space-x-1">
                                    <button
                                      disabled={!canMoveLeft}
                                      onClick={() => moverClienteEtapa(cliente.id, etapas[etapaPos - 1])}
                                      className={`p-1 rounded ${canMoveLeft ? 'bg-gray-200 hover:bg-gray-300' : 'opacity-50 cursor-not-allowed'}`}
                                      title="Mover para etapa anterior"
                                    >
                                      <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className={`px-2 py-1 rounded text-xs ${coresEtapas[novaEtapa]}`}>
                                      {index + 1}
                                    </span>
                                    <button
                                      disabled={!canMoveRight}
                                      onClick={() => moverClienteEtapa(cliente.id, etapas[etapaPos + 1])}
                                      className={`p-1 rounded ${canMoveRight ? 'bg-gray-200 hover:bg-gray-300' : 'opacity-50 cursor-not-allowed'}`}
                                      title="Mover para próxima etapa"
                                    >
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Arrow between stages */}
              {etapaIndex < etapas.length - 1 && (
                <div className="flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </React.Fragment>
          );
        })}
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