import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatDateTimeBrasilia } from '../utils/date';
import { Cliente } from '../types';
import { Users, Calendar, Gift, CheckCircle2, XCircle, Plus, X } from 'lucide-react';

export function ClientesAtivos() {
  const { obterClientesAtivos, atualizarCliente, userProfiles } = useApp();
  const clientesAtivos = obterClientesAtivos();

  // State to hold editing quotas per client
  const [editingQuotas, setEditingQuotas] = useState<Record<string, string[]>>({});
  // State to hold editing groups per client
  const [editingGroups, setEditingGroups] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize editingQuotas state from clientesAtivos
    const initialQuotas: Record<string, string[]> = {};
    const initialGroups: Record<string, string> = {};
    clientesAtivos.forEach(cliente => {
      initialQuotas[cliente.id] = cliente.gruposECotas ? [...cliente.gruposECotas] : [''];
      initialGroups[cliente.id] = cliente.grupo || '';
    });
    setEditingQuotas(initialQuotas);
    setEditingGroups(initialGroups);
  }, [clientesAtivos]);

  const calcularProximaAssembleia = (dataVenda: string) => {
    const venda = new Date(dataVenda);
    const proximaAssembleia = new Date(venda);
    proximaAssembleia.setMonth(proximaAssembleia.getMonth() + 1);
    proximaAssembleia.setDate(15); // Assembleias no dia 15 de cada mês
    
    if (proximaAssembleia < new Date()) {
      proximaAssembleia.setMonth(proximaAssembleia.getMonth() + 1);
    }
    
    return proximaAssembleia;
  };

  const obterAlertas = (cliente: Cliente) => {
    const alertas = [];
    const hoje = new Date();
    
    if (cliente.dataVenda) {
      const proximaAssembleia = calcularProximaAssembleia(cliente.dataVenda);
      const diasParaAssembleia = Math.floor((proximaAssembleia.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diasParaAssembleia <= 7 && diasParaAssembleia >= 0) {
        alertas.push({
          tipo: 'assembleia',
          mensagem: `Assembleia em ${diasParaAssembleia} dias`,
          cor: 'text-blue-600',
          icon: Calendar
        });
      }
    }
    
    if (cliente.aniversario) {
      const aniversario = new Date(cliente.aniversario);
      aniversario.setFullYear(hoje.getFullYear());
      
      if (aniversario < hoje) {
        aniversario.setFullYear(hoje.getFullYear() + 1);
      }
      
      const diasParaAniversario = Math.floor((aniversario.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diasParaAniversario <= 7 && diasParaAniversario >= 0) {
        alertas.push({
          tipo: 'aniversario',
          mensagem: `Aniversário em ${diasParaAniversario} dias`,
          cor: 'text-purple-600',
          icon: Gift
        });
      }
    }
    
    return alertas;
  };

  const statusCores = {
    'Ativo': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
    'Contemplado': { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle2 },
    'Cancelado': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
  };

  const handleQuotaChange = (clienteId: string, index: number, value: string) => {
    setEditingQuotas(prev => {
      const quotas = prev[clienteId] ? [...prev[clienteId]] : [''];
      quotas[index] = value;
      return { ...prev, [clienteId]: quotas };
    });
  };

  const addQuotaField = (clienteId: string) => {
    setEditingQuotas(prev => {
      const quotas = prev[clienteId] ? [...prev[clienteId]] : [''];
      quotas.push('');
      return { ...prev, [clienteId]: quotas };
    });
  };

  const removeQuotaField = (clienteId: string, index: number) => {
    setEditingQuotas(prev => {
      const quotas = prev[clienteId] ? [...prev[clienteId]] : [''];
      quotas.splice(index, 1);
      return { ...prev, [clienteId]: quotas };
    });
  };

  const saveQuotas = (cliente: Cliente) => {
    const quotas = editingQuotas[cliente.id];
    if (quotas) {
      const filteredQuotas = quotas.filter(q => q.trim() !== '');
      try {
        atualizarCliente(cliente.id, { gruposECotas: filteredQuotas.length > 0 ? filteredQuotas : undefined });
        console.log('Quotas salvas com sucesso para cliente:', cliente.id);
      } catch (error) {
        console.error('Erro ao salvar quotas para cliente:', cliente.id, error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Clientes Ativos</h2>
        <p className="text-gray-600">Gerencie o relacionamento pós-venda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total de Clientes</h3>
              <p className="text-2xl font-bold text-blue-600">{clientesAtivos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ativos</h3>
              <p className="text-2xl font-bold text-green-600">
                {clientesAtivos.filter(c => c.statusConsorcio === 'Ativo').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Gift className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Contemplados</h3>
              <p className="text-2xl font-bold text-purple-600">
                {clientesAtivos.filter(c => c.statusConsorcio === 'Contemplado').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Clientes</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {clientesAtivos.map(cliente => {
            const alertas = obterAlertas(cliente);
            const statusInfo = cliente.statusConsorcio ? statusCores[cliente.statusConsorcio] : statusCores['Ativo'];
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={cliente.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{cliente.nome}</h4>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{cliente.statusConsorcio || 'Ativo'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Telefone:</span> {cliente.telefone}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {cliente.email}
                      </div>
                      <div>
                        <span className="font-medium">Plano:</span> {cliente.planoInteresse}
                      </div>
                      <div>
                        <span className="font-medium">Vendedor:</span> {userProfiles[cliente.userId]?.name || 'Desconhecido'}
                      </div>
                      <div className="flex flex-wrap items-center space-x-4 mt-1">
                        <label className="font-medium flex items-center space-x-1">
                          <span>Grupo:</span>
                          <input
                            type="text"
                            value={editingGroups[cliente.id] || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setEditingGroups(prev => ({ ...prev, [cliente.id]: value }));
                            }}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm w-28"
                            placeholder="Grupo"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const groupValue = editingGroups[cliente.id];
                              atualizarCliente(cliente.id, { grupo: groupValue }).catch(error => {
                                console.error('Erro ao salvar grupo:', error);
                              });
                            }}
                            className="ml-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            title="Salvar Grupo"
                          >
                            Salvar
                          </button>
                        </label>
                        <div className="font-medium flex items-center space-x-1">
                          <span>Cotas:</span>
                          <div className="inline-flex items-center space-x-2">
                            {editingQuotas[cliente.id]?.map((quota, index) => (
                              <div key={index} className="flex items-center space-x-1">
                                <input
                                  type="text"
                                  value={quota}
                                  onChange={(e) => handleQuotaChange(cliente.id, index, e.target.value)}
                                  onBlur={() => saveQuotas(cliente)}
                                  className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24"
                                  placeholder="Cota"
                                />
                                {editingQuotas[cliente.id].length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeQuotaField(cliente.id, index)}
                                    className="p-1 rounded bg-red-600 text-white hover:bg-red-700"
                                    title="Remover cota"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addQuotaField(cliente.id)}
                              className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                              title="Adicionar cota"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {cliente.dataVenda && (
                        <div>
                          <span className="font-medium">Data da Venda:</span>
                          {' '}{formatDateTimeBrasilia(cliente.dataVenda)}
                        </div>
                      )}
                      {cliente.aniversario && (
                        <div>
                          <span className="font-medium">Aniversário:</span>
                          {' '}{formatDateTimeBrasilia(cliente.aniversario)}
                        </div>
                      )}
                    </div>

                    {/* Alertas */}
                    {alertas.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {alertas.map((alerta, index) => {
                          const AlertIcon = alerta.icon;
                          return (
                            <div key={index} className={`flex items-center space-x-2 text-sm ${alerta.cor}`}>
                              <AlertIcon className="w-4 h-4" />
                              <span className="font-medium">{alerta.mensagem}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    <select
                      value={cliente.statusConsorcio || 'Ativo'}
                      onChange={(e) => atualizarCliente(cliente.id, { 
                        statusConsorcio: e.target.value as 'Ativo' | 'Contemplado' | 'Cancelado' 
                      })}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Contemplado">Contemplado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>

                    {!cliente.aniversario && (
                      <input
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          if (e.target.value) {
                            atualizarCliente(cliente.id, { aniversario: e.target.value });
                          }
                        }}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Data de aniversário"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {clientesAtivos.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-medium mb-2">Nenhum cliente ativo</h4>
              <p className="text-sm">Clientes aparecerão aqui quando moverem para "Venda Ganha" no funil.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

