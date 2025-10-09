import { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatDateTimeBrasilia } from '../utils/date';
import { Cliente } from '../types';
import { Users, Calendar, Gift, CheckCircle2, XCircle, Plus, X, Filter } from 'lucide-react';

export function ClientesAtivos() {
  const { obterClientesAtivos, atualizarCliente, userProfiles } = useApp();
  const clientesAtivos = obterClientesAtivos();

  // State to hold editing groups detailed per client
  const [editingGroupsDetailed, setEditingGroupsDetailed] = useState<Record<string, { grupo: string; cotas: string[] }[]>>({});

  // Refs to track if initialized
  const initializedGroupsDetailed = useRef<Record<string, boolean>>({});

  const [editingGroups, setEditingGroups] = useState<Record<string, string>>({});
  const [editingQuotas, setEditingQuotas] = useState<Record<string, string[]>>({});

  // Refs to track initialization
  const initializedGroups = useRef<Record<string, boolean>>({});
  const initializedQuotas = useRef<Record<string, boolean>>({});

  // State for seller filter
  const [selectedSeller, setSelectedSeller] = useState<string>('all');

  useEffect(() => {
    // Initialize editingGroupsDetailed state from clientesAtivos, but only if not already initialized
    const initialGroupsDetailed: Record<string, { grupo: string; cotas: string[] }[]> = {};
    const initialGroups: Record<string, string> = {};
    const initialQuotas: Record<string, string[]> = {};
    clientesAtivos.forEach(cliente => {
      if (!initializedGroupsDetailed.current[cliente.id]) {
        if (cliente.gruposDetalhados) {
          initialGroupsDetailed[cliente.id] = cliente.gruposDetalhados.map(g => ({ ...g, cotas: [...g.cotas] }));
        } else if (cliente.grupo && cliente.gruposECotas) {
          // Migrate from old structure
          initialGroupsDetailed[cliente.id] = [{ grupo: cliente.grupo, cotas: [...cliente.gruposECotas] }];
        } else {
          initialGroupsDetailed[cliente.id] = [{ grupo: '', cotas: [''] }];
        }
        initializedGroupsDetailed.current[cliente.id] = true;
      }
      if (!initializedGroups.current[cliente.id]) {
        initialGroups[cliente.id] = cliente.grupo || '';
        initializedGroups.current[cliente.id] = true;
      }
      if (!initializedQuotas.current[cliente.id]) {
        initialQuotas[cliente.id] = cliente.gruposECotas ? [...cliente.gruposECotas] : [''];
        initializedQuotas.current[cliente.id] = true;
      }
    });
    setEditingGroupsDetailed(prev => ({ ...prev, ...initialGroupsDetailed }));
    setEditingGroups(prev => ({ ...prev, ...initialGroups }));
    setEditingQuotas(prev => ({ ...prev, ...initialQuotas }));
  }, [clientesAtivos]);

  // Get unique sellers
  const uniqueSellers = Array.from(new Set(clientesAtivos.map(c => c.userId)));

  // Filter clients based on selected seller
  const filteredClientes = selectedSeller === 'all' ? clientesAtivos : clientesAtivos.filter(c => c.userId === selectedSeller);

  // Calculate sales per seller
  const vendasPorVendedor = uniqueSellers.reduce((acc, sellerId) => {
    const clientesDoVendedor = clientesAtivos.filter(c => c.userId === sellerId);
    acc[sellerId] = {
      totalClientes: clientesDoVendedor.length,
      ativos: clientesDoVendedor.filter(c => c.statusConsorcio === 'Ativo').length,
      contemplados: clientesDoVendedor.filter(c => c.statusConsorcio === 'Contemplado').length,
      cancelados: clientesDoVendedor.filter(c => c.statusConsorcio === 'Cancelado').length,
    };
    return acc;
  }, {} as Record<string, { totalClientes: number; ativos: number; contemplados: number; cancelados: number }>);
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
      const quotas = prev[clienteId] ? [...prev[clienteId]] : [];
      quotas[index] = value;
      return { ...prev, [clienteId]: quotas };
    });
  };

  const saveQuotas = (cliente: Cliente) => {
    const quotas = editingQuotas[cliente.id];
    if (quotas) {
      atualizarCliente(cliente.id, { gruposECotas: quotas.filter(q => q.trim() !== '') });
    }
  };

  const removeQuotaField = (clienteId: string, index: number) => {
    setEditingQuotas(prev => {
      const quotas = prev[clienteId] ? [...prev[clienteId]] : [];
      quotas.splice(index, 1);
      return { ...prev, [clienteId]: quotas };
    });
  };

  const addQuotaField = (clienteId: string) => {
    setEditingQuotas(prev => {
      const quotas = prev[clienteId] ? [...prev[clienteId]] : [];
      quotas.push('');
      return { ...prev, [clienteId]: quotas };
    });
  };

  const handleGroupChange = (clienteId: string, groupIndex: number, field: 'grupo' | 'cotas', value: string | string[]) => {
    setEditingGroupsDetailed(prev => {
      const groups = prev[clienteId] ? [...prev[clienteId]] : [];
      if (field === 'grupo') {
        groups[groupIndex].grupo = value as string;
      } else {
        groups[groupIndex].cotas = value as string[];
      }
      return { ...prev, [clienteId]: groups };
    });
  };

  const addGroup = (clienteId: string) => {
    setEditingGroupsDetailed(prev => {
      const groups = prev[clienteId] ? [...prev[clienteId]] : [];
      groups.push({ grupo: '', cotas: [''] });
      return { ...prev, [clienteId]: groups };
    });
  };

  const removeGroup = (clienteId: string, groupIndex: number) => {
    setEditingGroupsDetailed(prev => {
      const groups = prev[clienteId] ? [...prev[clienteId]] : [];
      groups.splice(groupIndex, 1);
      return { ...prev, [clienteId]: groups };
    });
  };

  const addQuotaToGroup = (clienteId: string, groupIndex: number) => {
    setEditingGroupsDetailed(prev => {
      const groups = prev[clienteId] ? [...prev[clienteId]] : [];
      groups[groupIndex].cotas.push('');
      return { ...prev, [clienteId]: groups };
    });
  };

  const removeQuotaFromGroup = (clienteId: string, groupIndex: number, quotaIndex: number) => {
    setEditingGroupsDetailed(prev => {
      const groups = prev[clienteId] ? [...prev[clienteId]] : [];
      groups[groupIndex].cotas.splice(quotaIndex, 1);
      return { ...prev, [clienteId]: groups };
    });
  };

  const saveGroupsDetailed = (cliente: Cliente) => {
    const groupsDetailed = editingGroupsDetailed[cliente.id];
    if (groupsDetailed) {
      atualizarCliente(cliente.id, { gruposDetalhados: groupsDetailed });
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

      {/* Vendas por Vendedor */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Vendedor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(vendasPorVendedor).map(([sellerId, stats]) => (
            <div key={sellerId} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">{userProfiles[sellerId]?.name || 'Desconhecido'}</h4>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div>Total: {stats.totalClientes}</div>
                <div>Ativos: {stats.ativos}</div>
                <div>Contemplados: {stats.contemplados}</div>
                <div>Cancelados: {stats.cancelados}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtro por Vendedor */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">Filtrar por Vendedor:</label>
          <select
            value={selectedSeller}
            onChange={(e) => setSelectedSeller(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Vendedores</option>
            {uniqueSellers.map(sellerId => (
              <option key={sellerId} value={sellerId}>{userProfiles[sellerId]?.name || 'Desconhecido'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Clientes</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredClientes.map(cliente => {
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
                      <div className="mt-1">
                        <div className="font-medium">
                          Grupos: {editingGroupsDetailed[cliente.id]?.length || 0}, Total Cotas: {editingGroupsDetailed[cliente.id]?.reduce((total, g) => total + g.cotas.length, 0) || 0}
                        </div>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">Editar detalhes</summary>
                          <div className="mt-2 space-y-4">
                            {editingGroupsDetailed[cliente.id]?.map((group, groupIndex) => (
                              <div key={groupIndex} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="font-medium text-sm">Grupo {groupIndex + 1}:</label>
                                  {editingGroupsDetailed[cliente.id].length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeGroup(cliente.id, groupIndex)}
                                      className="p-1 rounded bg-red-600 text-white hover:bg-red-700"
                                      title="Remover grupo"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  value={group.grupo}
                                  onChange={(e) => handleGroupChange(cliente.id, groupIndex, 'grupo', e.target.value)}
                                  className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full mb-2"
                                  placeholder="Nome do Grupo"
                                />
                                <div className="font-medium text-sm mb-1">Cotas:</div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {group.cotas.map((quota, quotaIndex) => (
                                    <div key={quotaIndex} className="flex items-center space-x-1">
                                      <input
                                        type="text"
                                        value={quota}
                                        onChange={(e) => {
                                          const newCotas = [...group.cotas];
                                          newCotas[quotaIndex] = e.target.value;
                                          handleGroupChange(cliente.id, groupIndex, 'cotas', newCotas);
                                        }}
                                        className="border border-gray-300 rounded-md px-2 py-1 text-sm w-24"
                                        placeholder="Cota"
                                      />
                                      {group.cotas.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeQuotaFromGroup(cliente.id, groupIndex, quotaIndex)}
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
                                    onClick={() => addQuotaToGroup(cliente.id, groupIndex)}
                                    className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                    title="Adicionar cota"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => addGroup(cliente.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                title="Adicionar grupo"
                              >
                                <Plus className="w-4 h-4 mr-1 inline" /> Adicionar Grupo
                              </button>
                              <button
                                type="button"
                                onClick={() => saveGroupsDetailed(cliente)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                title="Salvar grupos e cotas"
                              >
                                Salvar Tudo
                              </button>
                            </div>
                          </div>
                        </details>
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

