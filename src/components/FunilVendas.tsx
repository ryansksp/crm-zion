import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Plus, Phone, AlertTriangle, ChevronLeft, ChevronRight, DollarSign, User, Clock } from 'lucide-react';
import type { EtapaFunil } from '../types'; // 👈 importado apenas como tipo
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { formatDateTimeBrasilia, getCurrentDateTimeBrasiliaISO, diasInatividade } from '../utils/date';
import { formatPhone } from '../utils/formatters';

export function FunilVendas() {
  const { clientes, moverClienteEtapa, adicionarCliente, userProfile, planos } = useApp();
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    planoInteresse: '',
    valorCredito: ''
  });

  // Organizar planos por tipo, agrupando por nome e prazo, mostrando faixa de crédito
  const planosOrganizados = planos.reduce((acc: Record<string, Record<string, { min: number; max: number; planos: typeof planos }>>, plano) => {
    const tipo = plano.tipo || 'Outros';
    if (!acc[tipo]) acc[tipo] = {};

    const prazo = plano.prazoMeses || plano.prazo || 0;
    const key = `${plano.nome}-${prazo}`;
    if (!acc[tipo][key]) {
      acc[tipo][key] = { min: plano.credito || 0, max: plano.credito || 0, planos: [] };
    }
    acc[tipo][key].min = Math.min(acc[tipo][key].min, plano.credito || 0);
    acc[tipo][key].max = Math.max(acc[tipo][key].max, plano.credito || 0);
    acc[tipo][key].planos.push(plano);
    return acc;
  }, {});

  // Ordenar tipos e dentro de cada tipo ordenar por prazo
  const tiposOrdenados = Object.keys(planosOrganizados).sort();
  const planosPorCategoria = tiposOrdenados.reduce((acc: Record<string, { nome: string; label: string; value: string }[]>, tipo) => {
    acc[tipo] = Object.entries(planosOrganizados[tipo])
      .sort(([, a], [, b]) => {
        const prazoA = a.planos[0]?.prazoMeses || a.planos[0]?.prazo || 0;
        const prazoB = b.planos[0]?.prazoMeses || b.planos[0]?.prazo || 0;
        return prazoA - prazoB;
      })
      .map(([, data]) => ({
        nome: data.planos[0].nome,
        label: data.min === data.max
          ? `${data.planos[0].nome} (R$ ${data.min.toLocaleString('pt-BR')})`
          : `${data.planos[0].nome} (R$ ${data.min.toLocaleString('pt-BR')} - R$ ${data.max.toLocaleString('pt-BR')})`,
        value: data.planos[0].nome
      }));
    return acc;
  }, {});

  const db = getFirestore();

  useEffect(() => {
    const loadUserNames = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const names: Record<string, string> = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'approved') {
            names[doc.id] = data.name || 'Desconhecido';
          }
        });
        setUserNames(names);
      } catch (error) {
        console.error('Erro ao carregar nomes de usuários:', error);
      }
    };

    loadUserNames();
  }, [db]);

  const filteredClientes = selectedUserId ? clientes.filter(c => c.userId === selectedUserId) : clientes;

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

  const coresEtapas: Record<EtapaFunil, string> = {
    'Novo Cliente': 'bg-indigo-100 text-indigo-700',
    'Lead': 'bg-gray-100 text-gray-700',
    'Contato Inicial': 'bg-blue-100 text-blue-700',
    'Envio de Simulação': 'bg-yellow-100 text-yellow-700',
    'Follow-up': 'bg-orange-100 text-orange-700',
    'Negociação Final': 'bg-purple-100 text-purple-700',
    'Venda Ganha': 'bg-green-100 text-green-700',
    'Venda Perdida': 'bg-red-100 text-red-700'
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNovoCliente = (e: React.FormEvent) => {
    e.preventDefault();

    adicionarCliente({
      userId: userProfile?.id || '',
      nome: formData.nome,
      telefone: formData.telefone,
      email: formData.email,
      planoInteresse: formData.planoInteresse,
      valorCredito: parseFloat(formData.valorCredito) || 0,
      etapa: 'Lead',
      dataCriacao: getCurrentDateTimeBrasiliaISO(),
      dataUltimaInteracao: getCurrentDateTimeBrasiliaISO(),
      historico: [],
      simulacoes: []
    });

    setFormData({
      nome: '',
      telefone: '',
      email: '',
      planoInteresse: '',
      valorCredito: ''
    });
    setShowNovoCliente(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Funil de Vendas</h2>
          <p className="text-gray-600 dark:text-gray-400">Gerencie seu pipeline de clientes</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por Vendedor:</label>
          <select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value ? e.target.value : null)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos os Vendedores</option>
            {Object.entries(userNames).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowNovoCliente(true)}
            className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg z-50"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-4 gap-6">
          {etapas.map((etapa, etapaIndex) => {
            const clientesEtapa = filteredClientes.filter(c => c.etapa === etapa);
            const totalValor = clientesEtapa.reduce((sum, c) => sum + (c.valorCredito || 0), 0);

            return (
              <div
                key={etapa}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col max-h-[600px]"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{etapa}</h3>
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Leads:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{clientesEtapa.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Valor:</span>
                    <span className="font-medium text-gray-900 dark:text-white">R$ {totalValor.toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                <div className="space-y-2 overflow-y-auto flex-grow">
                  {clientesEtapa.map(cliente => {
                    const dias = diasInatividade(cliente.dataUltimaInteracao);
                    const inativo = dias > 3 && !['Venda Ganha', 'Venda Perdida'].includes(etapa);

                    return (
                      <div
                        key={cliente.id}
                        className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow flex flex-col"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">{cliente.nome}</h4>
                          {inativo && (
                            <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          )}
                        </div>

                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3" />
                            <span className="font-medium text-gray-900 dark:text-white">R$ {cliente.valorCredito?.toLocaleString('pt-BR') || '0'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span className="truncate">{cliente.telefone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span className="truncate">{formatDateTimeBrasilia(cliente.dataUltimaInteracao)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span className="truncate">Vendedor: {userNames[cliente.userId] || 'N/A'}</span>
                          </div>
                        </div>

                        {inativo && (
                          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-2">
                            {dias} dias sem interação
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-auto">
                          <button
                            disabled={etapaIndex === 0}
                            onClick={() => moverClienteEtapa(cliente.id, etapas[etapaIndex - 1])}
                            className={`p-1 rounded ${etapaIndex > 0 ? 'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400' : 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500'}`}
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
                            className={`p-1 rounded ${etapaIndex < etapas.length - 1 ? 'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400' : 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500'}`}
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
            );
          })}
        </div>
      </div>

      {/* Modal Novo Cliente */}
      {showNovoCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Novo Cliente</h3>
            <form onSubmit={handleNovoCliente} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', formatPhone(e.target.value))}
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plano de Interesse</label>
                <select
                  value={formData.planoInteresse}
                  onChange={(e) => handleInputChange('planoInteresse', e.target.value)}
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecione um plano</option>
                  {Object.entries(planosPorCategoria).map(([categoria, planosCategoria]) => (
                    <optgroup key={categoria} label={categoria}>
                      {planosCategoria.map((plano) => (
                        <option key={plano.value} value={plano.value}>
                          {plano.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor da Venda</label>
                <input
                  type="number"
                  value={formData.valorCredito}
                  onChange={(e) => handleInputChange('valorCredito', e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Ex: 10000.00"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNovoCliente(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
