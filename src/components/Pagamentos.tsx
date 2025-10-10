import { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { Cliente } from '../types';
import { daysDifference } from '../utils/date';
import { Users, CheckCircle2, XCircle, Filter, DollarSign, Clock, AlertTriangle } from 'lucide-react';

export function Pagamentos() {
  const { obterClientesAtivos, atualizarCliente, userProfiles } = useApp();
  const clientesAtivos = obterClientesAtivos();

  // State to hold editing payments per client
  const [editingPayments, setEditingPayments] = useState<Record<string, { status: 'Pendente' | 'Pago' | 'Atrasado'; data?: string }[]>>({});

  // State to hold editing due day per client
  const [editingDueDays, setEditingDueDays] = useState<Record<string, number>>({});

  // Refs to track if initialized
  const initializedPayments = useRef<Record<string, boolean>>({});
  const initializedDueDays = useRef<Record<string, boolean>>({});

  // State for seller filter
  const [selectedSeller, setSelectedSeller] = useState<string>('all');

  // State for success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    // Initialize editingPayments state from clientesAtivos, but only if not already initialized
    const initialPayments: Record<string, { status: 'Pendente' | 'Pago' | 'Atrasado'; data?: string }[]> = {};
    clientesAtivos.forEach(cliente => {
      if (!initializedPayments.current[cliente.id]) {
        if (cliente.pagamentos) {
          initialPayments[cliente.id] = cliente.pagamentos.map(p => ({ ...p }));
        } else {
          // Initialize with 12 installments, all pending
          initialPayments[cliente.id] = Array.from({ length: 12 }, () => ({ status: 'Pendente' as const }));
        }
        initializedPayments.current[cliente.id] = true;
      }
    });

    // Automatically set status to 'Atrasado' for overdue payments without data
    Object.keys(initialPayments).forEach(clienteId => {
      const cliente = clientesAtivos.find(c => c.id === clienteId);
      if (cliente) {
        const dueDay = cliente.diaVencimentoPadrao || 10;
        const payments = initialPayments[clienteId];
        payments.forEach((payment, index) => {
          if (payment.status === 'Pendente' && !payment.data) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const dueDate = new Date(currentYear, currentMonth + index - 1, dueDay);
            if (dueDate < today) {
              payment.status = 'Atrasado';
            }
          }
        });
      }
    });

    setEditingPayments(prev => ({ ...prev, ...initialPayments }));
  }, [clientesAtivos]);

  useEffect(() => {
    // Initialize editingDueDays state from clientesAtivos, but only if not already initialized
    const initialDueDays: Record<string, number> = {};
    clientesAtivos.forEach(cliente => {
      if (!initializedDueDays.current[cliente.id]) {
        initialDueDays[cliente.id] = cliente.diaVencimentoPadrao || 10; // Default to 10th
        initializedDueDays.current[cliente.id] = true;
      }
    });
    setEditingDueDays(prev => ({ ...prev, ...initialDueDays }));
  }, [clientesAtivos]);

  // Get unique sellers
  const uniqueSellers = Array.from(new Set(clientesAtivos.map(c => c.userId)));

  // Filter clients based on selected seller
  const filteredClientes = selectedSeller === 'all' ? clientesAtivos : clientesAtivos.filter(c => c.userId === selectedSeller);

  // Calculate payment summary
  const paymentSummary = filteredClientes.reduce((acc, cliente) => {
    const payments = editingPayments[cliente.id] || [];
    const dueDay = editingDueDays[cliente.id] || 10;
    payments.forEach((payment, index) => {
      if (payment.status === 'Pago') {
        acc.pagas++;
      } else if (payment.status === 'Atrasado') {
        acc.atrasadas++;
      } else if (payment.status === 'Pendente') {
        if (payment.data) {
          const dueDate = new Date(payment.data);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (dueDate < today) {
            acc.atrasadas++;
          } else {
            acc.proximas++;
          }
        } else {
          // Calculate due date based on dueDay
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          const installmentMonth = new Date(currentYear, currentMonth + index - 1, dueDay);

          if (installmentMonth < today) {
            acc.atrasadas++;
          } else {
            acc.proximas++;
          }
        }
      }
    });
    return acc;
  }, { pagas: 0, pendentes: 0, atrasadas: 0, proximas: 0 });

  // Calculate upcoming notifications (due in 10 days)
  const upcomingNotifications = filteredClientes.filter(cliente => {
    const payments = editingPayments[cliente.id] || [];
    return payments.some(payment => {
      if (payment.status === 'Pago' || !payment.data) return false;
      const dueDate = new Date(payment.data);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tenDaysFromNow = new Date(today);
      tenDaysFromNow.setDate(today.getDate() + 10);
      return dueDate >= today && dueDate <= tenDaysFromNow;
    });
  });

  const handlePaymentChange = (clienteId: string, installmentIndex: number, field: 'status' | 'data', value: string) => {
    setEditingPayments(prev => {
      const payments = prev[clienteId] ? [...prev[clienteId]] : [];
      if (field === 'status') {
        payments[installmentIndex].status = value as 'Pendente' | 'Pago' | 'Atrasado';
        if (value !== 'Pago') {
          payments[installmentIndex].data = undefined;
        }
      } else {
        payments[installmentIndex].data = value;
      }
      return { ...prev, [clienteId]: payments };
    });
  };

  const validatePaymentDates = (payments: { status: string; data?: string }[]) => {
    const paidPayments = payments.filter(p => p.status === 'Pago' && p.data);
    if (paidPayments.length <= 1) return true; // No need to validate if 0 or 1 payment

    const dates = paidPayments.map(p => new Date(p.data!));
    for (let i = 1; i < dates.length; i++) {
      if (dates[i] < dates[i - 1]) {
        return false; // Date is not in chronological order
      }
    }
    return true;
  };

  const savePayments = (cliente: Cliente) => {
    const payments = editingPayments[cliente.id];
    const dueDay = editingDueDays[cliente.id];
    if (payments) {
      // Validate payment dates are in chronological order
      if (!validatePaymentDates(payments)) {
        alert('Erro: As datas dos pagamentos devem estar em ordem cronológica crescente.');
        return;
      }

      // Clean payments to remove undefined values
      const cleanedPayments = payments.map(p => {
        const cleaned: any = { status: p.status };
        if (p.data) {
          cleaned.data = p.data;
        }
        return cleaned;
      });
      const updateData: any = { pagamentos: cleanedPayments };
      if (dueDay !== undefined) {
        updateData.diaVencimentoPadrao = dueDay;
      }
      atualizarCliente(cliente.id, updateData);
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    }
  };

  const getPaymentStatus = (cliente: Cliente) => {
    const payments = editingPayments[cliente.id] || [];
    const paidCount = payments.filter(p => p.status === 'Pago').length;
    return `${paidCount}/12 parcelas pagas`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamentos</h2>
        <p className="text-gray-600">Gerencie os pagamentos das parcelas dos clientes</p>
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
              <h3 className="text-lg font-semibold text-gray-900">Pagamentos Ativos</h3>
              <p className="text-2xl font-bold text-green-600">
                {clientesAtivos.filter(c => (editingPayments[c.id] || []).some(p => p.status === 'Pago')).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sem Pagamentos</h3>
              <p className="text-2xl font-bold text-red-600">
                {clientesAtivos.filter(c => !(editingPayments[c.id] || []).some(p => p.status === 'Pago')).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo de Pagamentos */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Geral de Parcelas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Pagas</p>
              <p className="text-xl font-bold text-green-600">{paymentSummary.pagas}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-xl font-bold text-yellow-600">{paymentSummary.pendentes}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Em Atraso</p>
              <p className="text-xl font-bold text-red-600">{paymentSummary.atrasadas}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Próximas</p>
              <p className="text-xl font-bold text-blue-600">{paymentSummary.proximas}</p>
            </div>
          </div>
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

      {/* Notificações de Vencimento */}
      {upcomingNotifications.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800">Avisos de Vencimento</h3>
          </div>
          <p className="text-yellow-700 mb-3">Clientes com parcelas vencendo nos próximos 10 dias:</p>
          <div className="space-y-2">
            {upcomingNotifications.map(cliente => {
              const payments = editingPayments[cliente.id] || [];
              const upcomingPayments = payments
                .map((payment, index) => ({ payment, index }))
                .filter(({ payment }) => {
                  if (payment.status === 'Pago' || !payment.data) return false;
                  const dueDate = new Date(payment.data);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const tenDaysFromNow = new Date(today);
                  tenDaysFromNow.setDate(today.getDate() + 10);
                  return dueDate >= today && dueDate <= tenDaysFromNow;
                });
              return (
                <div key={cliente.id} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <span className="font-medium">{cliente.nome}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      Parcela(s): {upcomingPayments.map(({ index }) => `${index + 1}ª`).join(', ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Vence em: {upcomingPayments.map(({ payment }) => new Date(payment.data!).toLocaleDateString('pt-BR')).join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Clientes */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Clientes</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredClientes.map(cliente => (
            <div key={cliente.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{cliente.nome}</h4>
                    <span className="text-sm text-gray-600">{getPaymentStatus(cliente)}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
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
                    <div className="col-span-full">
                      <label className="font-medium">Dia de Vencimento Padrão:</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={editingDueDays[cliente.id] || 10}
                        onChange={(e) => setEditingDueDays(prev => ({ ...prev, [cliente.id]: parseInt(e.target.value) || 10 }))}
                        className="ml-2 border border-gray-300 rounded px-2 py-1 text-xs w-16"
                      />
                    </div>
                  </div>

                  {/* Payments Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-sm mb-2">Parcelas (12)</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {editingPayments[cliente.id]?.map((payment, index) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  let dueDate: Date;
                                  if (payment.data) {
                                    dueDate = new Date(payment.data);
                                  } else {
                                    const currentMonth = today.getMonth();
                                    const currentYear = today.getFullYear();
                                    const dueDay = editingDueDays[cliente.id] || 10;
                                    dueDate = new Date(currentYear, currentMonth + index - 1, dueDay);
                                  }
                                  const overdueDays = daysDifference(today, dueDate);
                                  return (
                                    <div key={index} className={`p-2 border rounded ${
                                      payment.status === 'Pago' ? 'border-green-300 bg-green-50' :
                                      payment.status === 'Atrasado' ? 'border-red-300 bg-red-50' :
                                      'border-gray-200'
                                    }`}>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs font-medium w-8">{index + 1}ª</span>
                                        <select
                                          value={payment.status}
                                          onChange={(e) => handlePaymentChange(cliente.id, index, 'status', e.target.value)}
                                          className="border border-gray-300 rounded px-2 py-1 text-xs"
                                        >
                                          <option value="Pendente">Pendente</option>
                                          <option value="Pago">Pago</option>
                                          <option value="Atrasado">Atrasado</option>
                                        </select>
                                        <input
                                          type="date"
                                          value={payment.data || ''}
                                          onChange={(e) => handlePaymentChange(cliente.id, index, 'data', e.target.value)}
                                          disabled={payment.status !== 'Pago' && payment.status !== 'Pendente' && payment.status !== 'Atrasado'}
                                          className="border border-gray-300 rounded px-2 py-1 text-xs flex-1"
                                          placeholder={payment.status === 'Pago' ? 'Data do Pagamento' : 'Data de Vencimento'}
                                        />
                                      </div>
                                      {overdueDays > 0 && payment.status !== 'Pago' && (
                                        <div className="text-xs text-red-600 mt-1">Atrasado há {overdueDays} dias</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => savePayments(cliente)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        title="Salvar pagamentos"
                      >
                        Salvar Pagamentos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-lg font-semibold text-green-600 mb-4">Sucesso!</h3>
            <p className="text-gray-700 mb-4">Pagamentos salvos com sucesso!</p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
