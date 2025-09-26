import React from 'react';
import { useApp } from '../contexts/AppContext';
import { formatDateBrasilia } from '../utils/date';
import { Cliente } from '../types';
import { Users, XCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters.ts';

export function ClientesPerdidos() {
  const { clientes, atualizarCliente, userProfiles } = useApp();
  const clientesPerdidos = clientes.filter(c => c.etapa === 'Venda Perdida');

  const obterAlertas = (cliente: Cliente) => {
    const alertas: {
      tipo: string;
      mensagem: string;
      cor: string;
      icon: React.ElementType;
    }[] = [];

    const hoje = new Date();

    if (cliente.dataPerda) {
      const perda = new Date(cliente.dataPerda);
      if (!isNaN(perda.getTime())) {
        const diasDesdePerda = Math.floor(
          (hoje.getTime() - perda.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diasDesdePerda <= 30) {
          alertas.push({
            tipo: 'perda-recente',
            mensagem: `Perda recente há ${diasDesdePerda} dias`,
            cor: 'text-red-600',
            icon: XCircle,
          });
        }
      }
    }

    return alertas;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Clientes Perdidos</h2>
        <p className="text-gray-600">
          Gerencie clientes perdidos para possível reativação
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Total de Clientes Perdidos
              </h3>
              <p className="text-2xl font-bold text-red-600">
                {clientesPerdidos.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Clientes Perdidos */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Clientes Perdidos</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {clientesPerdidos.map(cliente => {
            const alertas = obterAlertas(cliente);

            return (
              <div
                key={cliente.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {cliente.nome}
                      </h4>
                      <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3" />
                        <span>Perdido</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Telefone:</span>{' '}
                        {cliente.telefone}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>{' '}
                        {cliente.email}
                      </div>
                      <div>
                        <span className="font-medium">Plano:</span>{' '}
                        {cliente.planoInteresse}
                      </div>
                      <div>
                        <span className="font-medium">Valor da Venda:</span>{' '}
                        {formatCurrency(cliente.valorCredito)}
                      </div>
                      <div>
                        <span className="font-medium">Vendedor:</span>{' '}
                        {userProfiles[cliente.userId]?.name || 'Desconhecido'}
                      </div>
                      {cliente.dataVenda && (
                        <div>
                          <span className="font-medium">Data da Venda:</span>{' '}
                          {formatDateBrasilia(cliente.dataVenda)}
                        </div>
                      )}
                      {cliente.motivoPerda && (
                        <div>
                          <span className="font-medium">Motivo da Perda:</span>{' '}
                          {cliente.motivoPerda}
                        </div>
                      )}
                      {cliente.dataPerda && (
                        <div>
                          <span className="font-medium">Data da Perda:</span>{' '}
                          {formatDateBrasilia(cliente.dataPerda)}
                        </div>
                      )}
                    </div>

                    {/* Alertas */}
                    {alertas.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {alertas.map((alerta, index) => {
                          const AlertIcon = alerta.icon;
                          return (
                            <div
                              key={index}
                              className={`flex items-center space-x-2 text-sm ${alerta.cor}`}
                            >
                              <AlertIcon className="w-4 h-4" />
                              <span className="font-medium">{alerta.mensagem}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    <input
                      type="text"
                      placeholder="Motivo da Perda"
                      defaultValue={cliente.motivoPerda || ''}
                      onBlur={e =>
                        atualizarCliente(cliente.id, { motivoPerda: e.target.value })
                      }
                      className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      defaultValue={
                        cliente.dataPerda
                          ? new Date(cliente.dataPerda).toISOString().substr(0, 10)
                          : ''
                      }
                      onChange={e =>
                        atualizarCliente(cliente.id, { dataPerda: e.target.value })
                      }
                      className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                      title="Data da Perda"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {clientesPerdidos.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-medium mb-2">Nenhum cliente perdido</h4>
              <p className="text-sm">
                Clientes perdidos aparecerão aqui para possível reativação.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
