import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { formatCurrency } from '../utils/formatters';
import { PlanoEmbracon } from '../types';

const PlanComparisonPopup: React.FC = () => {
  const { isPlanComparisonOpen, setIsPlanComparisonOpen, planos } = useApp();
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [comparisonValue, setComparisonValue] = useState<number>(100000);
  const [availablePlans, setAvailablePlans] = useState<PlanoEmbracon[]>([]);

  useEffect(() => {
    if (isPlanComparisonOpen && planos.length > 0) {
      // Get plans from the first category (or you can determine category from simulation)
      const category = planos[0]?.categoria || 'Imóvel';
      const categoryPlans = planos.filter(plan => plan.categoria === category).slice(0, 3);
      setAvailablePlans(categoryPlans);
      setSelectedPlans(categoryPlans.map(plan => plan.id));
    }
  }, [isPlanComparisonOpen, planos]);

  const calculateFinancingDetails = (plan: PlanoEmbracon, value: number) => {
    const taxaAdm = (value * plan.taxaAdministracao) / 100;
    const fundoReserva = (value * plan.fundoReserva) / 100;
    const seguro = (value * plan.seguro) / 100;
    const taxaAdesao = (value * (plan.taxaAdesao || 0)) / 100;
    const totalTaxas = taxaAdm + fundoReserva + seguro + taxaAdesao;
    const valorFinanciado = value - totalTaxas;
    const parcelaMensal = valorFinanciado / plan.prazo;

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

  const calculateTraditionalFinancing = (value: number, prazo: number = 240) => {
    const taxaJurosAnual = 0.12; // 12% ao ano
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
      <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full p-6 overflow-auto max-h-[90vh]">
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

        {/* Seleção de Planos */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Selecione os Planos para Comparar</h3>
          <div className="grid grid-cols-3 gap-4">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className={`cursor-pointer transition-all ${selectedPlans.includes(plan.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                onClick={() => {
                  setSelectedPlans(prev =>
                    prev.includes(plan.id)
                      ? prev.filter(id => id !== plan.id)
                      : [...prev, plan.id]
                  );
                }}
              >
                <Card className="p-4">
                  <h4 className="font-semibold">{plan.nome}</h4>
                  <p className="text-sm text-gray-600">Prazo: {plan.prazo} meses</p>
                  <p className="text-sm text-gray-600">Taxa Adm: {plan.taxaAdministracao}%</p>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Comparação Detalhada */}
        <div className="space-y-6">
          {selectedPlans.map(planId => {
            const plan = availablePlans.find(p => p.id === planId);
            if (!plan) return null;

            const consorcioDetails = calculateFinancingDetails(plan, comparisonValue);
            const financiamentoDetails = calculateTraditionalFinancing(comparisonValue, plan.prazo);
            const economia = financiamentoDetails.totalPago - consorcioDetails.valorFinanciado;

            return (
              <Card key={planId} className="p-6">
                <h3 className="text-xl font-bold mb-4 text-center">{plan.nome}</h3>

                <div className="grid grid-cols-2 gap-6">
                  {/* Consórcio Embracon */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-700">Consórcio Embracon</h4>
                    <div className="space-y-2 text-sm">
                      <p>Valor Financiado: <strong>{formatCurrency(consorcioDetails.valorFinanciado)}</strong></p>
                      <p>Parcela Mensal: <strong>{formatCurrency(consorcioDetails.parcelaMensal)}</strong></p>
                      <p>Total de Taxas: <strong>{formatCurrency(consorcioDetails.totalTaxas)}</strong></p>
                      <div className="ml-4 text-xs text-gray-600">
                        <p>Taxa Adm: {formatCurrency(consorcioDetails.taxaAdm)}</p>
                        <p>Fundo Reserva: {formatCurrency(consorcioDetails.fundoReserva)}</p>
                        <p>Seguro: {formatCurrency(consorcioDetails.seguro)}</p>
                        <p>Taxa Adesão: {formatCurrency(consorcioDetails.taxaAdesao)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financiamento Tradicional */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-red-700">Financiamento Tradicional</h4>
                    <div className="space-y-2 text-sm">
                      <p>Valor Financiado: <strong>{formatCurrency(comparisonValue)}</strong></p>
                      <p>Parcela Mensal: <strong>{formatCurrency(financiamentoDetails.parcelaMensal)}</strong></p>
                      <p>Juros Totais: <strong>{formatCurrency(financiamentoDetails.jurosTotais)}</strong></p>
                      <p>Total a Pagar: <strong>{formatCurrency(financiamentoDetails.totalPago)}</strong></p>
                    </div>
                  </div>
                </div>

                {/* Vantagem do Consórcio */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Por que escolher o Consórcio Embracon?</h4>
                  <div className="space-y-1 text-sm">
                    <p className={economia > 0 ? 'text-green-700' : 'text-red-700'}>
                      {economia > 0 ? 'Economia' : 'Custo Extra'}: <strong>{formatCurrency(Math.abs(economia))}</strong>
                    </p>
                    <p>• Sem juros abusivos - apenas taxas administrativas transparentes</p>
                    <p>• Possibilidade de lance para antecipar a contemplação</p>
                    <p>• Poder de compra à vista sem comprometer seu orçamento mensal</p>
                    <p>• Renda extra através do fundo de reserva durante o plano</p>
                    <p>• Seguro incluso para maior segurança</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Conclusão */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Conclusão</h3>
          <p className="text-sm text-gray-700">
            O Consórcio Embracon oferece uma alternativa inteligente e econômica ao financiamento tradicional.
            Com taxas transparentes e benefícios exclusivos, você realiza seu sonho de forma mais vantajosa e segura.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanComparisonPopup;
