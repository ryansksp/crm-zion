import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { PlanoEmbracon } from '../types';
import { CheckSquare, Square } from 'lucide-react';

const PlanComparisonPopup: React.FC = () => {
  const { isPlanComparisonOpen, setIsPlanComparisonOpen, planos } = useApp();
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [comparisonValue, setComparisonValue] = useState<number>(100000);
  const [availablePlans, setAvailablePlans] = useState<PlanoEmbracon[]>([]);
  const [financingRate, setFinancingRate] = useState<number>(12);
  const [financingTerm, setFinancingTerm] = useState<number>(240);
  const [benefits] = useState<string[]>([
    "Sem juros abusivos - apenas taxas administrativas transparentes",
    "Possibilidade de lance para antecipar a contemplação",
    "Poder de compra à vista sem comprometer seu orçamento mensal",
    "Renda extra através do fundo de reserva durante o plano",
    "Seguro incluso para maior segurança"
  ]);
  const [conclusion, setConclusion] = useState<string>(
    "O Consórcio Embracon oferece uma alternativa inteligente e econômica ao financiamento tradicional. Com taxas transparentes e benefícios exclusivos, você realiza seu sonho de forma mais vantajosa e segura."
  );

  useEffect(() => {
    if (isPlanComparisonOpen && planos.length > 0) {
      // Show all plans for comparison
      setAvailablePlans(planos);
      // Select first 3 plans by default, or all if less than 3
      const defaultSelected = planos.slice(0, Math.min(3, planos.length)).map(plan => plan.id);
      setSelectedPlans(defaultSelected);
    }
  }, [isPlanComparisonOpen, planos]);

  const calculateFinancingDetails = (plan: PlanoEmbracon, value: number) => {
    const taxaAdm = (value * (plan.taxaAdministracao || plan.taxaAdmTotal || 0)) / 100;
    const fundoReserva = (value * plan.fundoReserva) / 100;
    const seguro = (value * plan.seguro) / 100;
    const taxaAdesao = (value * (plan.taxaAdesao || 0)) / 100;
    const totalTaxas = taxaAdm + fundoReserva + seguro + taxaAdesao;
    const valorFinanciado = value - totalTaxas;
    const prazo = plan.prazoMeses || plan.prazo || 1; // avoid division by zero
    const parcelaMensal = valorFinanciado / prazo;

    return {
      valorFinanciado,
      parcelaMensal,
      totalTaxas,
      taxaAdm,
      fundoReserva,
      seguro,
      taxaAdesao
    };
  };

  const calculateTraditionalFinancing = (value: number, rate: number, prazo: number) => {
    const taxaJurosAnual = rate / 100;
    const taxaJurosMensal = taxaJurosAnual / 12;
    const parcelaMensal = (value * taxaJurosMensal * Math.pow(1 + taxaJurosMensal, prazo)) / (Math.pow(1 + taxaJurosMensal, prazo) - 1);
    const totalPago = parcelaMensal * prazo;
    const jurosTotais = totalPago - value;

    return {
      parcelaMensal,
      totalPago,
      jurosTotais
    };
  };

  if (!isPlanComparisonOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-xl max-w-6xl w-full p-6 overflow-auto max-h-[90vh] border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Comparativo de Planos Embracon</h2>
          <Button onClick={() => setIsPlanComparisonOpen(false)}>Fechar</Button>
        </div>

        {/* Valor para Comparação */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor para Comparação (R$)
          </label>
          <input
            type="number"
            value={comparisonValue}
            onChange={(e) => setComparisonValue(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 100000"
          />
        </div>

        {/* Parâmetros do Financiamento */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taxa de Juros Anual (%)
            </label>
            <input
              type="number"
              value={financingRate}
              onChange={(e) => setFinancingRate(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ex: 12"
              min={0}
              step={0.1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prazo (meses)
            </label>
            <input
              type="number"
              value={financingTerm}
              onChange={(e) => setFinancingTerm(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ex: 240"
              min={1}
            />
          </div>
        </div>

        {/* Seleção de Planos por Categoria */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Selecione os Planos para Comparar</h3>
          {['Imóvel', 'Automóvel', 'Moto', 'Caminhão', 'Serviços'].map(categoria => {
            const planosCategoria = availablePlans.filter(plan =>
              (plan.categoria || plan.tipo || '').toLowerCase().includes(categoria.toLowerCase())
            );
            if (planosCategoria.length === 0) return null;

            return (
              <div key={categoria} className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">{categoria}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {planosCategoria.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <button
                        onClick={() => {
                          setSelectedPlans(prev =>
                            prev.includes(plan.id)
                              ? prev.filter(id => id !== plan.id)
                              : [...prev, plan.id]
                          );
                        }}
                        className="mt-1"
                      >
                        {selectedPlans.includes(plan.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{plan.nome}</h5>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Prazo: {plan.prazoMeses || plan.prazo} meses</p>
                          <p>Taxa Adm: {formatPercent(plan.taxaAdministracao || plan.taxaAdmTotal || 0)}</p>
                          <p>Fundo Reserva: {formatPercent(plan.fundoReserva)}</p>
                          <p>Seguro: {formatPercent(plan.seguro)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabela de Comparação Lado a Lado */}
        {selectedPlans.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Comparação Detalhada</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Plano</th>
                    <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-green-700">Consórcio Embracon</th>
                    <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-red-700">Financiamento Tradicional</th>
                    <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Diferença</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPlans.map(planId => {
                    const plan = availablePlans.find(p => p.id === planId);
                    if (!plan) return null;

                    const consorcioDetails = calculateFinancingDetails(plan, comparisonValue);
                    const financiamentoDetails = calculateTraditionalFinancing(comparisonValue, financingRate, financingTerm);
                    const economia = financiamentoDetails.totalPago - consorcioDetails.valorFinanciado;

                    return (
                      <tr key={planId} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="font-medium">{plan.nome}</div>
                          <div className="text-xs text-gray-600">
                            Prazo: {plan.prazoMeses || plan.prazo} meses
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="space-y-1 text-sm">
                            <div><strong>Valor Financiado:</strong> {formatCurrency(consorcioDetails.valorFinanciado)}</div>
                            <div><strong>Parcela Mensal:</strong> {formatCurrency(consorcioDetails.parcelaMensal)}</div>
                            <div><strong>Total Taxas:</strong> {formatCurrency(consorcioDetails.totalTaxas)}</div>
                            <div className="text-xs text-gray-600 mt-2">
                              <div>Taxa Adm: {formatCurrency(consorcioDetails.taxaAdm)}</div>
                              <div>Fundo Reserva: {formatCurrency(consorcioDetails.fundoReserva)}</div>
                              <div>Seguro: {formatCurrency(consorcioDetails.seguro)}</div>
                              <div>Taxa Adesão: {formatCurrency(consorcioDetails.taxaAdesao)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="space-y-1 text-sm">
                            <div><strong>Taxa Juros:</strong> {financingRate}% ao ano</div>
                            <div><strong>Prazo:</strong> {financingTerm} meses</div>
                            <div><strong>Valor Financiado:</strong> {formatCurrency(comparisonValue)}</div>
                            <div><strong>Parcela Mensal:</strong> {formatCurrency(financiamentoDetails.parcelaMensal)}</div>
                            <div><strong>Juros Totais:</strong> {formatCurrency(financiamentoDetails.jurosTotais)}</div>
                            <div><strong>Total a Pagar:</strong> {formatCurrency(financiamentoDetails.totalPago)}</div>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <div className={`font-semibold ${economia > 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {economia > 0 ? 'Economia' : 'Custo Extra'}
                          </div>
                          <div className={`text-lg font-bold ${economia > 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(Math.abs(economia))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Benefícios do Consórcio */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3">Por que escolher o Consórcio Embracon?</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conclusão */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">📝 Conclusão</h3>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            className="w-full text-sm text-gray-700 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Digite a conclusão aqui..."
          />
        </div>
      </div>
    </div>
  );
};

export default PlanComparisonPopup;
