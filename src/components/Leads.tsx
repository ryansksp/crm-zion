import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatDateTimeBrasilia } from '../utils/date';
import { Cliente, Interacao, Simulacao } from '../types';
import { Search, Filter, Eye, Phone, Mail, Calendar, X, UserPlus, UserCheck } from 'lucide-react';
import { CadastroLeads } from './CadastroLeads';

export function Leads() {
  const { clientes, userProfiles, userProfile, reatribuirLead } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtapa, setFilterEtapa] = useState('todos');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showCadastro, setShowCadastro] = useState(false);
  const [novoUserId, setNovoUserId] = useState('');
  const filterUser = 'todos';

  // Definir quais etapas são consideradas "leads"
  const etapasLeads = [
    'Novo Cliente',
    'Lead',
    'Contato Inicial',
    'Envio de Simulação',
    'Follow-up',
    'Negociação Final'
  ];

  const etapasUnicas = [...new Set(clientes.map(c => c.etapa))];

  // Filtrar clientes que são leads
  const leads = clientes.filter(cliente =>
    etapasLeads.includes(cliente.etapa) &&
    (filterEtapa === 'todos' || cliente.etapa === filterEtapa) &&
    (filterUser === 'todos' || cliente.userId === filterUser) &&
    (cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cliente.telefone.includes(searchTerm) ||
     cliente.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group leads by owner
  const leadsByOwner = leads.reduce((acc, lead) => {
    const ownerId = lead.userId;
    if (!acc[ownerId]) {
      acc[ownerId] = [];
    }
    acc[ownerId].push(lead);
    return acc;
  }, {} as Record<string, Cliente[]>);

  const diasInatividade = (dataUltimaInteracao: string) => {
    return Math.floor((Date.now() - new Date(dataUltimaInteracao).getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleReatribuirLead = async () => {
    if (!selectedCliente || !novoUserId) return;
    try {
      await reatribuirLead(selectedCliente.id, novoUserId);
      setNovoUserId('');
      setSelectedCliente(null);
      alert('Lead reatribuído com sucesso!');
    } catch (error) {
      console.error('Erro ao reatribuir lead:', error);
      alert('Erro ao reatribuir lead. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Leads</h2>
          <p className="text-gray-600">Gerencie todos os seus leads em potencial</p>
        </div>
        <button
          onClick={() => setShowCadastro(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Cadastrar Lead
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterEtapa}
                onChange={(e) => setFilterEtapa(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todas as etapas</option>
                {etapasUnicas.map(etapa => (
                  <option key={etapa} value={etapa}>{etapa}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Leads por Proprietário */}
      <div className="space-y-6">
        {Object.entries(leadsByOwner).map(([userId, userLeads]) => {
          const userName = userProfiles[userId]?.name || 'Desconhecido';
          const userRole = userProfiles[userId]?.accessLevel || 'Desconhecido';

          return (
            <div key={userId} className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {userName} ({userRole})
                    </h3>
                    <p className="text-sm text-gray-600">
                      {userLeads.length} lead{userLeads.length !== 1 ? 's' : ''} atribuído{userLeads.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      Meta diária: 5 leads
                    </span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {userLeads.map(cliente => {
                  const dias = diasInatividade(cliente.dataUltimaInteracao);
                  const inativo = dias > 3;

                  return (
                    <div key={cliente.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{cliente.nome}</h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{cliente.telefone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{cliente.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            inativo
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {inativo ? 'Inativo' : 'Ativo'}
                          </span>
                          {inativo && (
                            <p className="text-xs text-red-600 mt-1">{dias} dias sem interação</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Etapa:</span>
                          <p className="font-medium">{cliente.etapa}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Plano de Interesse:</span>
                          <p className="font-medium">{cliente.planoInteresse}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Valor do Crédito:</span>
                          <p className="font-medium">R$ {cliente.valorCredito?.toLocaleString('pt-BR') || '0'}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Última interação: {formatDateTimeBrasilia(cliente.dataUltimaInteracao)}</span>
                        </div>
                        <button
                          onClick={() => setSelectedCliente(cliente)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver Detalhes</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {leads.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
              <p className="text-gray-600">
                {searchTerm || filterEtapa !== 'todos'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Você ainda não tem leads cadastrados'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Detalhes do Lead</h3>
              <button
                onClick={() => setSelectedCliente(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCliente.nome}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCliente.telefone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCliente.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendedor</label>
                  <p className="mt-1 text-sm text-gray-900">{userProfiles[selectedCliente.userId]?.name || 'Desconhecido'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Etapa</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCliente.etapa}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plano de Interesse</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedCliente.planoInteresse}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor do Crédito</label>
                  <p className="mt-1 text-sm text-gray-900">R$ {selectedCliente.valorCredito?.toLocaleString('pt-BR') || '0'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDateTimeBrasilia(selectedCliente.dataCriacao)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Última Interação</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDateTimeBrasilia(selectedCliente.dataUltimaInteracao)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {diasInatividade(selectedCliente.dataUltimaInteracao) > 3 ? 'Inativo' : 'Ativo'}
                  </p>
                </div>
              </div>

              {selectedCliente.historico && selectedCliente.historico.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Histórico de Interações</label>
                  <div className="space-y-2">
                    {selectedCliente.historico.map((interacao: Interacao, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{interacao.tipo}</p>
                            <p className="text-sm text-gray-600">{interacao.descricao}</p>
                          </div>
                          <p className="text-xs text-gray-500">{formatDateTimeBrasilia(interacao.data)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCliente.simulacoes && selectedCliente.simulacoes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Simulações</label>
                  <div className="space-y-2">
                    {selectedCliente.simulacoes.map((simulacao: Simulacao, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Valor do Crédito:</span> R$ {simulacao.valorCredito.toLocaleString('pt-BR')}
                          </div>
                          <div>
                            <span className="font-medium">Parcela:</span> R$ {simulacao.parcela.toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reatribuição de Lead - Apenas para Diretores */}
              {userProfile?.accessLevel === 'Diretor' && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reatribuir Lead</label>
                  <div className="flex gap-2">
                    <select
                      value={novoUserId}
                      onChange={(e) => setNovoUserId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione um usuário</option>
                      {Object.values(userProfiles).map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.accessLevel})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleReatribuirLead}
                      disabled={!novoUserId}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <UserCheck className="w-4 h-4" />
                      Reatribuir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Leads */}
      {showCadastro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full mx-4">
            <CadastroLeads onClose={() => setShowCadastro(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
