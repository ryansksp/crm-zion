import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Calculator, TrendingUp, Info, Eye } from 'lucide-react';
import calculate from '../utils/CalculatorLogic';
import { formatCurrency, formatPercent } from '../utils/formatters';
import PlanComparisonPopup from './PlanComparisonPopup';
import { PlanoEmbracon } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface FormularioSimulacao {
  valorCredito: string;
  prazo: string;
  taxaAdm: string;
  fundoReserva: string;
  taxaAdesao: string;
  lanceEmbutido: string;
  lanceProprio: string;
  entrada: string;
  taxaJuros: string;
  prazoFinanciamento: string;
}

interface ResultadoSimulacao {
  consorcio: {
    creditoLiberado: number;
    primeiraParcela: number;
    segundaA12Parcela: number;
    demaisParcelas: number;
    valorLanceProprio: number;
    custoTotalConsorcio: number;
    custoAoMesPercent: number;
  };
  financiamento: {
    valorFinanciado: number;
    parcelaMensal: number;
    jurosTotais: number;
    custoTotalFinanciamento: number;
  };
  economia: {
    valor: number;
    percentual: number;
  };
}

export function Simulador() {
  const { planos, setIsPlanComparisonOpen } = useApp();
  console.log('Planos data:', planos);
  const [selectedPlano, setSelectedPlano] = useState<PlanoEmbracon | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');

  // Obter categorias únicas
  const uniqueCategories = Array.from(new Set(planos.map(p => p.categoria || p.tipo).filter(Boolean)));

  // Obter planos únicos para o select
  const uniquePlanos = Array.from(
    new Map<string, PlanoEmbracon>(
      planos.map(plano => [`${String(plano.nome)}-${String(parseInt(String(plano.prazoMeses || plano.prazo || 0)))}-${String(plano.categoria || plano.tipo)}-${String(plano.credito)}`, plano])
    ).values()
  );

  // Obter valores únicos de crédito disponíveis nos planos, filtrados por categoria
  const uniqueCredits = Array.from(new Set(
    planos
      .filter(p => !selectedCategoria || (p.categoria || p.tipo || '').toLowerCase().includes(selectedCategoria.toLowerCase()))
      .map(p => p.credito)
      .filter((c): c is number => c != null)
  )).sort((a, b) => a - b);
  const [formData, setFormData] = useState<FormularioSimulacao>({

    valorCredito: '',
    prazo: '',
    taxaAdm: '',
    fundoReserva: '',
    taxaAdesao: '',
    lanceEmbutido: '',
    lanceProprio: '',
    entrada: '',
    taxaJuros: '12',
    prazoFinanciamento: '240'
  });
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);

  // Atualizar campos quando um plano é selecionado
  useEffect(() => {
    if (selectedPlano) {
      setFormData(prev => ({
        ...prev,
        prazo: selectedPlano.prazoMeses?.toString() || selectedPlano.prazo?.toString() || '',
        taxaAdm: selectedPlano.taxaAdministracao?.toString() || selectedPlano.taxaAdmTotal?.toString() || '',
        fundoReserva: selectedPlano.fundoReserva?.toString() || '',
        taxaAdesao: selectedPlano.taxaAdesao?.toString() || '',
        valorCredito: selectedPlano.credito?.toString() || selectedPlano.valorCredito?.toString() || ''
      }));
    }
  }, [selectedPlano]);

  // Calcular automaticamente quando os dados mudam
  useEffect(() => {
    if (formData.valorCredito && formData.prazo && formData.taxaAdm && formData.fundoReserva) {
      try {
        const calcResult = calculate(formData);
        setResultado(calcResult);
      } catch (error) {
        console.error('Erro no cálculo:', error);
        setResultado(null);
      }
    } else {
      setResultado(null);
    }
  }, [formData]);

  const handleInputChange = (field: keyof FormularioSimulacao, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlanoSelect = (planoId: string) => {
    const plano = planos.find(p => p.id === planoId);
    setSelectedPlano(plano || null);
  };

  const openComparison = () => {
    setIsPlanComparisonOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="w-8 h-8 text-blue-600" />
          Simulador de Consórcio
        </h1>
        <Button onClick={openComparison} className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Comparar Planos
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Plano */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Seleção de Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plano Embracon
              </label>
              <select
                value={selectedPlano?.id || ''}
                onChange={(e) => handlePlanoSelect(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um plano...</option>
                {uniquePlanos.map((plano) => (
                  <option key={plano.id} value={plano.id}>
                    {String(plano.nome)} - {String(plano.categoria || plano.tipo)} - Prazo: {String(plano.prazoMeses || plano.prazo)} meses
                  </option>
                ))}
              </select>
            </div>

            {selectedPlano && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Detalhes do Plano Selecionado</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Nome:</strong> {selectedPlano.nome}</p>
                  <p><strong>Categoria:</strong> {selectedPlano.categoria || selectedPlano.tipo}</p>
                  <p><strong>Prazo:</strong> {selectedPlano.prazoMeses || selectedPlano.prazo} meses</p>
                  <p><strong>Taxa Adm:</strong> {formatPercent(selectedPlano.taxaAdministracao || selectedPlano.taxaAdmTotal || 0)}</p>
                  <p><strong>Fundo Reserva:</strong> {formatPercent(selectedPlano.fundoReserva)}</p>
                  <p><strong>Seguro:</strong> {formatPercent(selectedPlano.seguro)}</p>
                  {selectedPlano.taxaAdesao && (
                    <p><strong>Taxa Adesão:</strong> {formatPercent(selectedPlano.taxaAdesao)}</p>
                  )}
                  {selectedPlano.credito && (
                    <p><strong>Crédito Sugerido:</strong> {formatCurrency(selectedPlano.credito)}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulário de Simulação */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Parâmetros da Simulação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={selectedCategoria}
                  onChange={(e) => {
                    setSelectedCategoria(e.target.value);
                    setFormData(prev => ({ ...prev, valorCredito: '' })); // reset credit
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  {uniqueCategories.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor do Crédito (R$)
                </label>
                <select
                  value={formData.valorCredito}
                  onChange={(e) => handleInputChange('valorCredito', e.target.value)}
                  disabled={!selectedCategoria}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prazo (meses)
                </label>
                <input
                  type="number"
                  value={formData.prazo}
                  onChange={(e) => handleInputChange('prazo', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa Adm (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.taxaAdm}
                  onChange={(e) => handleInputChange('taxaAdm', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 0.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fundo Reserva (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fundoReserva}
                  onChange={(e) => handleInputChange('fundoReserva', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa Adesão (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.taxaAdesao}
                  onChange={(e) => handleInputChange('taxaAdesao', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 0.05"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lance Embutido (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lanceEmbutido}
                  onChange={(e) => handleInputChange('lanceEmbutido', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lance Próprio (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lanceProprio}
                  onChange={(e) => handleInputChange('lanceProprio', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 0.2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entrada (R$)
                </label>
                <input
                  type="number"
                  value={formData.entrada}
                  onChange={(e) => handleInputChange('entrada', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa Juros Financ. (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.taxaJuros}
                  onChange={(e) => handleInputChange('taxaJuros', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ex: 12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prazo Financ. (meses)
                </label>
                <input
                  type="number"
                  value={formData.prazoFinanciamento}
                  onChange={(e) => handleInputChange('prazoFinanciamento', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ex: 240"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultados da Simulação */}
      {resultado && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consórcio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Consórcio Embracon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Crédito Liberado:</span>
                  <span className="font-semibold">{formatCurrency(resultado.consorcio.creditoLiberado)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Primeira Parcela:</span>
                  <span className="font-semibold">{formatCurrency(resultado.consorcio.primeiraParcela)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Demais Parcelas:</span>
                  <span className="font-semibold">{formatCurrency(resultado.consorcio.demaisParcelas)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor Lance Próprio:</span>
                  <span className="font-semibold">{formatCurrency(resultado.consorcio.valorLanceProprio)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo Total:</span>
                  <span className="font-semibold text-green-700">{formatCurrency(resultado.consorcio.custoTotalConsorcio)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo ao Mês (%):</span>
                  <span className="font-semibold">{formatPercent(resultado.consorcio.custoAoMesPercent)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financiamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Financiamento Tradicional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Valor Financiado:</span>
                  <span className="font-semibold">{formatCurrency(resultado.financiamento.valorFinanciado)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Parcela Mensal:</span>
                  <span className="font-semibold">{formatCurrency(resultado.financiamento.parcelaMensal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Juros Totais:</span>
                  <span className="font-semibold text-red-700">{formatCurrency(resultado.financiamento.jurosTotais)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo Total:</span>
                  <span className="font-semibold text-red-700">{formatCurrency(resultado.financiamento.custoTotalFinanciamento)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Economia */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-center text-lg font-bold">
                {resultado.economia.valor > 0 ? '🎉 Você Economiza!' : '⚠️ Custo Extra'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: resultado.economia.valor > 0 ? '#16a34a' : '#dc2626' }}>
                {formatCurrency(Math.abs(resultado.economia.valor))}
              </div>
              <div className="text-lg text-gray-600">
                {resultado.economia.percentual > 0 ? 'de economia' : 'de custo extra'} ({formatPercent(Math.abs(resultado.economia.percentual))})
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Comparação entre Consórcio Embracon e Financiamento Tradicional
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <PlanComparisonPopup />
    </div>
  );
};
