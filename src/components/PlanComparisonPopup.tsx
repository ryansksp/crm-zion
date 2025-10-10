import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { PlanoEmbracon } from '../types';
import { CheckSquare, Square, X, Calculator, TrendingUp, Home, Car, Truck, Wrench, Bike } from 'lucide-react';

const PlanComparisonPopup: React.FC = () => {
  const { isPlanComparisonOpen, setIsPlanComparisonOpen, planos } = useApp();

  // Função para normalizar strings removendo acentos e convertendo para minúsculo
  const normalizeString = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };
  const [selectedPlans, setSelectedPlans] = useState<{ [key: string]: string[] }>({
    'Imóvel': [],
    'Automóvel': [],
    'Moto': [],
    'Caminhão': [],
    'Serviços': []
  });
  const [availablePlans, setAvailablePlans] = useState<PlanoEmbracon[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Imóvel']);
  const [formData, setFormData] = useState({
    valorCredito: '120000',
    prazo: '240',
    taxaAdm: '0',
    fundoReserva: '0',
    taxaAdesao: '0',
    lanceEmbutido: '0',
    lanceProprio: '0',
    entrada: '0',
    taxaJuros: '1',
    prazoFinanciamento: '240',
  });

  // Obter valores únicos de crédito disponíveis nos planos, filtrados por categorias selecionadas
  const uniqueCredits = Array.from(new Set(
    planos
      .filter(p => selectedCategories.some(cat => {
        const planCategory = p.categoria || p.tipo || '';
        const normalizedPlanCategory = normalizeString(planCategory);
        const normalizedCat = normalizeString(cat);
        return normalizedPlanCategory.includes(normalizedCat);
      }))
      .map(p => p.credito)
      .filter((c): c is number => c != null)
  )).sort((a, b) => a - b);
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
      setAvailablePlans(planos);
    }
  }, [isPlanComparisonOpen, planos]);

  const calculateConsorcioTotal = (plan: PlanoEmbracon, valorCredito: number) => {
    const taxaAdm = valorCredito * ((plan.taxaAdministracao || plan.taxaAdmTotal || 0) / 100);
    const fundoReserva = valorCredito * (plan.fundoReserva / 100);
    const taxaAdesao = valorCredito * (parseFloat(formData.taxaAdesao) / 100);
    const lanceEmbutido = valorCredito * (parseFloat(formData.lanceEmbutido) / 100);
    const lanceProprio = valorCredito * (parseFloat(formData.lanceProprio) / 100);
    
    // Valor total a pagar = crédito + taxas (não subtrai as taxas do crédito)
    const totalAPagar = valorCredito + taxaAdm + fundoReserva + taxaAdesao;
    const creditoDisponivel = valorCredito - lanceEmbutido; // Lance embutido reduz o crédito disponível
    const prazo = plan.prazoMeses || plan.prazo || 240;
    const parcelaMensal = totalAPagar / prazo;

    return {
      creditoDisponivel,
      totalAPagar,
      taxaAdm,
      fundoReserva,
      taxaAdesao,
      lanceEmbutido,
      lanceProprio,
      parcelaMensal,
      prazo
    };
  };

  const calculateFinanciamentoTotal = (valorCredito: number) => {
    const entrada = parseFloat(formData.entrada) || 0;
    const valorFinanciado = valorCredito - entrada;
    const taxaJurosMensal = parseFloat(formData.taxaJuros) / 100;
    const prazo = parseInt(formData.prazoFinanciamento) || 240;
    
    let parcelaMensal = 0;
    let totalPago = entrada;
    let jurosTotais = 0;

    if (taxaJurosMensal > 0) {
      parcelaMensal = valorFinanciado * (taxaJurosMensal * Math.pow(1 + taxaJurosMensal, prazo)) / 
                      (Math.pow(1 + taxaJurosMensal, prazo) - 1);
      totalPago = entrada + (parcelaMensal * prazo);
      jurosTotais = totalPago - valorCredito;
    } else {
      parcelaMensal = valorFinanciado / prazo;
      totalPago = valorCredito;
    }

    return {
      valorFinanciado,
      entrada,
      parcelaMensal,
      totalPago,
      jurosTotais,
      taxaJurosAnual: parseFloat(formData.taxaJuros) * 12
    };
  };

  if (!isPlanComparisonOpen) return null;

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      setIsPlanComparisonOpen(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePlanSelection = (category: string, planId: string) => {
    setSelectedPlans(prev => {
      const categoryPlans = prev[category] || [];
      if (categoryPlans.includes(planId)) {
        return {
          ...prev,
          [category]: categoryPlans.filter(id => id !== planId)
        };
      }
      const maxPlans = category === 'Automóvel' ? 2 : 3;
      if (categoryPlans.length >= maxPlans) {
        return {
          ...prev,
          [category]: [...categoryPlans.slice(1), planId]
        };
      }
      return {
        ...prev,
        [category]: [...categoryPlans, planId]
      };
    });
  };

  const getAllSelectedPlans = () => {
    const allPlans: string[] = [];
    Object.values(selectedPlans).forEach(categoryPlans => {
      allPlans.push(...categoryPlans);
    });
    return allPlans;
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Imóvel': return <Home className="w-4 h-4" />;
      case 'Automóvel': return <Car className="w-4 h-4" />;
      case 'Moto': return <Bike className="w-4 h-4" />;
      case 'Caminhão': return <Truck className="w-4 h-4" />;
      case 'Serviços': return <Wrench className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-7xl w-full p-6 overflow-auto max-h-[95vh]">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Calculator className="w-8 h-8 text-blue-600" />
            Simulador e Comparativo de Planos Embracon
          </h2>
          <Button
            onClick={() => setIsPlanComparisonOpen(false)}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Seção de Parâmetros dividida em duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Parâmetros do Consórcio */}
          <div className="bg-green-50 dark:bg-green-900 p-5 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-200 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Parâmetros do Consórcio
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor do Crédito (R$)</label>
                <select
                  name="valorCredito"
                  value={formData.valorCredito}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecione um valor...</option>
                  {uniqueCredits.map((credito) => (
                    <option key={credito} value={credito.toString()}>
                      {formatCurrency(credito)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taxa de Adesão (%)</label>
                <input
                  type="number"
                  name="taxaAdesao"
                  value={formData.taxaAdesao}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lance Embutido (%)</label>
                <input
                  type="number"
                  name="lanceEmbutido"
                  value={formData.lanceEmbutido}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lance Próprio (%)</label>
                <input
                  type="number"
                  name="lanceProprio"
                  value={formData.lanceProprio}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 0"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Parâmetros do Financiamento */}
          <div className="bg-red-50 dark:bg-red-900 p-5 rounded-lg border border-red-200 dark:border-red-700">
            <h3 className="text-lg font-semibold mb-4 text-red-800 dark:text-red-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Parâmetros do Financiamento
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entrada (R$)</label>
                <input
                  type="number"
                  name="entrada"
                  value={formData.entrada}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 0"
                  step="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taxa de Juros Mensal (%)</label>
                <input
                  type="number"
                  name="taxaJuros"
                  value={formData.taxaJuros}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 1"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo Financiamento (meses)</label>
                <input
                  type="number"
                  name="prazoFinanciamento"
                  value={formData.prazoFinanciamento}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 240"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros de Categoria */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Categorias</h3>
          <div className="flex flex-wrap gap-2">
            {['Imóvel', 'Automóvel', 'Moto', 'Caminhão', 'Serviços'].map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-full border flex items-center gap-2 transition-all ${
                  selectedCategories.includes(category)
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                {getCategoryIcon(category)}
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Seleção de Planos por Categoria */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Selecione até 3 Planos por Categoria</h3>
          {selectedCategories.map(categoria => {
            const valorCredito = parseFloat(formData.valorCredito) || 0;
            const planosCategoria = availablePlans
              .filter(plan => {
                const planCategory = plan.categoria || plan.tipo || '';
                const normalizedPlanCategory = normalizeString(planCategory);
                const normalizedCategoria = normalizeString(categoria);
                return normalizedPlanCategory.includes(normalizedCategoria) && plan.credito === valorCredito;
              })
              .filter((plan, index, self) =>
                index === self.findIndex(p =>
                  p.nome === plan.nome &&
                  parseInt(String(p.prazoMeses || p.prazo || 0)) === parseInt(String(plan.prazoMeses || plan.prazo || 0)) &&
                  p.credito === plan.credito
                )
              )
              .sort((a, b) => (b.prazoMeses || b.prazo || 0) - (a.prazoMeses || a.prazo || 0));

            if (planosCategoria.length === 0) {
              return (
                <div key={categoria} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                    {getCategoryIcon(categoria)}
                    {categoria}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum plano disponível nesta categoria</p>
                </div>
              );
            }

            return (
              <div key={categoria} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  {getCategoryIcon(categoria)}
                  {categoria}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({selectedPlans[categoria]?.length || 0}/{categoria === 'Automóvel' ? 2 : 3} selecionados)
                  </span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {planosCategoria.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-3 border rounded-lg transition-all cursor-pointer ${
                        selectedPlans[categoria]?.includes(plan.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => togglePlanSelection(categoria, plan.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          {selectedPlans[categoria]?.includes(plan.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-gray-900 dark:text-white">{plan.nome}</h5>
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                            <p>Prazo: {String(plan.prazoMeses || plan.prazo)} meses</p>
                            <p>Taxa Adm: {formatPercent(plan.taxaAdministracao || plan.taxaAdmTotal || 0)}</p>
                            <p>Fundo: {formatPercent(plan.fundoReserva)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabela de Comparação */}
        {getAllSelectedPlans().length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Comparação Detalhada</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Plano</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-green-700 dark:text-green-400">
                      Consórcio Embracon
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-red-700 dark:text-red-400">
                      Financiamento Tradicional
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                      Economia/Custo Extra
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getAllSelectedPlans().map(planId => {
                    const plan = availablePlans.find(p => p.id === planId);
                    if (!plan) return null;

                    const valorCredito = parseFloat(formData.valorCredito) || 0;
                    const consorcio = calculateConsorcioTotal(plan, valorCredito);
                    const financiamento = calculateFinanciamentoTotal(valorCredito);
                    const diferenca = financiamento.totalPago - consorcio.totalAPagar;

                    return (
                      <tr key={planId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{plan.nome}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {String(plan.categoria || plan.tipo || '')} • {String(plan.prazoMeses || plan.prazo || 0)} meses
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                          <div className="space-y-2 text-sm text-gray-900 dark:text-white">
                            <div className="font-semibold text-green-700 dark:text-green-400">
                              Crédito: {formatCurrency(valorCredito)}
                            </div>
                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                              <div>Taxa Adm: {formatCurrency(consorcio.taxaAdm)}</div>
                              <div>Fundo Reserva: {formatCurrency(consorcio.fundoReserva)}</div>
                              {consorcio.taxaAdesao > 0 && (
                                <div>Taxa Adesão: {formatCurrency(consorcio.taxaAdesao)}</div>
                              )}
                              {consorcio.lanceEmbutido > 0 && (
                                <div>Lance Embutido: {formatCurrency(consorcio.lanceEmbutido)}</div>
                              )}
                              {consorcio.lanceProprio > 0 && (
                                <div>Lance Próprio: {formatCurrency(consorcio.lanceProprio)}</div>
                              )}
                            </div>
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                              <div className="font-semibold text-gray-900 dark:text-white">Total: {formatCurrency(consorcio.totalAPagar)}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Parcela: {formatCurrency(consorcio.parcelaMensal)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                          <div className="space-y-2 text-sm text-gray-900 dark:text-white">
                            <div className="font-semibold text-red-700 dark:text-red-400">
                              Crédito: {formatCurrency(valorCredito)}
                            </div>
                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                              {financiamento.entrada > 0 && (
                                <div>Entrada: {formatCurrency(financiamento.entrada)}</div>
                              )}
                              <div>Financiado: {formatCurrency(financiamento.valorFinanciado)}</div>
                              <div>Taxa: {financiamento.taxaJurosAnual.toFixed(2)}% a.a.</div>
                              <div>Juros Total: {formatCurrency(financiamento.jurosTotais)}</div>
                            </div>
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                              <div className="font-semibold text-gray-900 dark:text-white">Total: {formatCurrency(financiamento.totalPago)}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Parcela: {formatCurrency(financiamento.parcelaMensal)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                          <div className={`font-bold text-lg ${diferenca > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {diferenca > 0 ? 'Economia' : 'Custo Extra'}
                          </div>
                          <div className={`text-2xl font-bold ${diferenca > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(Math.abs(diferenca))}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {((Math.abs(diferenca) / financiamento.totalPago) * 100).toFixed(1)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Benefícios */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">✓ Vantagens do Consórcio Embracon</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-900 dark:text-white">
                    <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conclusão */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📝 Conclusão</h3>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            className="w-full text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows={3}
            placeholder="Digite a conclusão aqui..."
          />
        </div>
      </div>
    </div>
  );
};

export default PlanComparisonPopup;
