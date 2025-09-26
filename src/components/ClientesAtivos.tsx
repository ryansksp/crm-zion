import React from 'react';
import { useApp } from '../contexts/AppContext';
import { formatDateTimeBrasilia } from '../utils/date';
import { Users, Calendar, Gift, CheckCircle2, XCircle } from 'lucide-react';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  planoInteresse: string;
  statusConsorcio?: 'Ativo' | 'Contemplado' | 'Cancelado';
  grupoECota?: string;
  dataVenda?: string;
  aniversario?: string;
}

export function ClientesAtivos() {
  const { obterClientesAtivos, atualizarCliente } = useApp();
  const clientesAtivos = obterClientesAtivos();

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
                      {cliente.grupoECota && (
                        <div>
                          <span className="font-medium">Grupo/Cota:</span> {cliente.grupoECota}
                        </div>
                      )}
                      {cliente.dataVenda && (
                        <div>
                          <span className="font-medium">Data da Venda:</span> 
                          {' '}{new Date(cliente.dataVenda).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      {cliente.aniversario && (
                        <div>
                          <span className="font-medium">Aniversário:</span> 
                          {' '}{new Date(cliente.aniversario).toLocaleDateString('pt-BR')}
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

                    {!cliente.grupoECota && (
                      <input
                        type="text"
                        placeholder="Grupo/Cota"
                        onBlur={(e) => {
                          if (e.target.value) {
                            atualizarCliente(cliente.id, { grupoECota: e.target.value });
                          }
                        }}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}

                    {!cliente.aniversario && (
                      <input
                        type="date"
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