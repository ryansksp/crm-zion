import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, Filter, Eye, Phone, Mail, Calendar, DollarSign } from 'lucide-react';

export function Leads() {
  const { clientes } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtapa, setFilterEtapa] = useState('todos');

  // Definir quais etapas são consideradas "leads"
  const etapasLeads = [
    'Novo Cliente',
    'Lead',
    'Contato Inicial',
    'Envio de Simulação',
    'Follow-up',
    'Negociação Final'
  ];

  // Filtrar clientes que são leads
  const leads = clientes.filter(cliente =>
    etapasLeads.includes(cliente.etapa) &&
    (filterEtapa === 'todos' || cliente.etapa === filterEtapa) &&
    (cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
     cliente.telefone.includes(searchTerm) ||
     cliente.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const etapasUnicas = [...new Set(clientes.map(c => c.etapa))];

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const diasInatividade = (dataUltimaInteracao: string) => {
    return Math.floor((Date.now() - new Date(dataUltimaInteracao).getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Leads</h2>
        <p className="text-gray-600">Gerencie todos os seus leads em potencial</p>
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

      {/* Lista de Leads */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {leads.length} Lead{leads.length !== 1 ? 's' : ''} encontrado{leads.length !== 1 ? 's' : ''}
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {leads.map(cliente => {
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
                    <span>Última interação: {formatarData(cliente.dataUltimaInteracao)}</span>
                  </div>
                  <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors">
                    <Eye className="w-4 h-4" />
                    <span>Ver Detalhes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {leads.length === 0 && (
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
        )}
      </div>
    </div>
  );
}
