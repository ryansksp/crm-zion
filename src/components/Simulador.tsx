import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatDateTimeBrasilia } from '../utils/date';
import { Calculator, Download, TrendingUp } from 'lucide-react';
import calculate from '../utils/CalculatorLogic';
import { formatCurrency, formatPercent, parseNumber } from '../utils/formatters';

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
  const { clientes, adicionarSimulacao } = useApp();
  const [formData, setFormData] = useState<FormularioSimulacao>({
    valorCredito: '120000',
    prazo: '240',
    taxaAdm: '0.28',
    fundoReserva: '0.02',
    taxaAdesao: '1.2',
    lanceEmbutido: '25',
    lanceProprio: '25',
    entrada: '30000',
    taxaJuros: '1.2',
    prazoFinanciamento: '240'
  });
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('');
  const [percentualLance, setPercentualLance] = useState<number>(0);
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);

  const handleChange = (field: keyof FormularioSimulacao, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calcularSimulacao = () => {
    const newResults = calculate(formData);
    setResultado(newResults);
  };

  const salvarSimulacao = () => {
    if (!resultado || !clienteSelecionado) return;

    adicionarSimulacao({
      clienteId: clienteSelecionado,
      planoId: 'simulacao-' + Date.now(),
      valorCredito: parseNumber(formData.valorCredito),
      parcela: resultado.consorcio.demaisParcelas,
      dataSimulacao: new Date().toISOString(),
      analiselance: percentualLance > 0 ? {
        percentualLance,
        novoVencimento: parseNumber(formData.prazo)
      } : undefined
    });

    alert('Simulação salva com sucesso!');
  };

  const gerarComparativo = () => {
    if (!resultado) return;

    const valorCredito = parseNumber(formData.valorCredito);

    const conteudoPDF = `
COMPARATIVO EMBRACON - ${new Date().toLocaleDateString('pt-BR')}

=== SIMULAÇÃO CONSÓRCIO EMBRACON ===
Valor do Crédito: ${formatCurrency(valorCredito)}
Crédito Liberado: ${formatCurrency(resultado.consorcio.creditoLiberado)}
1ª Parcela: ${formatCurrency(resultado.consorcio.primeiraParcela)}
2ª a 12ª Parcela: ${formatCurrency(resultado.consorcio.segundaA12Parcela)}
Demais Parcelas: ${formatCurrency(resultado.consorcio.demaisParcelas)}
Lance Próprio: ${formatCurrency(resultado.consorcio.valorLanceProprio)}
Custo Total: ${formatCurrency(resultado.consorcio.custoTotalConsorcio)}

=== COMPARATIVO VS FINANCIAMENTO ===
Financiamento Tradicional:
- Valor Financiado: ${formatCurrency(resultado.financiamento.valorFinanciado)}
- Parcela Mensal: ${formatCurrency(resultado.financiamento.parcelaMensal)}
- Juros Totais: ${formatCurrency(resultado.financiamento.jurosTotais)}
- Custo Total: ${formatCurrency(resultado.financiamento.custoTotalFinanciamento)}

${resultado.economia.valor > 0 ? 'ECONOMIA' : 'CUSTO EXTRA'} COM EMBRACON: ${formatCurrency(Math.abs(resultado.economia.valor))}
Percentual: ${formatPercent(Math.abs(resultado.economia.percentual))}

${percentualLance > 0 ? `
=== ANÁLISE DE LANCES ===
Lance de ${percentualLance}%: ${formatCurrency((valorCredito * percentualLance) / 100)}
Impacto estimado no prazo e custos
` : ''}
    `;

    const blob = new Blob([conteudoPDF], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparativo-embracon-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Simulador Embracon</h2>
        <p className="text-gray-600">Calcule simulações rápidas para seus clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Simulação Rápida</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor do Crédito (R$)
              </label>
              <input
                type="number"
                value={formData.valorCredito}
                onChange={(e) => handleChange('valorCredito', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prazo (meses)
              </label>
              <select
                value={formData.prazo}
                onChange={(e) => handleChange('prazo', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o prazo</option>
                <option value="200">200 Meses (Imóvel)</option>
                <option value="220">220 Meses (Imóvel)</option>
                <option value="240">240 Meses (Imóvel)</option>
                <option value="100">100 Meses (Automóvel)</option>
                <option value="40">40 Meses (Serviços)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxa Adm (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.taxaAdm}
                  onChange={(e) => handleChange('taxaAdm', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.28"
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
                  onChange={(e) => handleChange('fundoReserva', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.02"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lance Próprio (%)
              </label>
              <input
                type="number"
                value={formData.lanceProprio}
                onChange={(e) => handleChange('lanceProprio', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente (Opcional)
              </label>
              <select
                value={clienteSelecionado}
                onChange={(e) => setClienteSelecionado(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={calcularSimulacao}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Calcular Simulação
            </button>
          </div>
        </div>

        {/* Resultado */}
        {resultado && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Resultado da Simulação</span>
            </h3>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Crédito Liberado</h4>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(resultado.consorcio.creditoLiberado)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">1ª Parcela:</span>
                  <span className="font-medium">{formatCurrency(resultado.consorcio.primeiraParcela)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">2ª a 12ª Parcela:</span>
                  <span className="font-medium">{formatCurrency(resultado.consorcio.segundaA12Parcela)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Demais Parcelas:</span>
                  <span className="font-medium">{formatCurrency(resultado.consorcio.demaisParcelas)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lance Próprio:</span>
                  <span className="font-medium">{formatCurrency(resultado.consorcio.valorLanceProprio)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Custo Total:</span>
                  <span className="font-bold">{formatCurrency(resultado.consorcio.custoTotalConsorcio)}</span>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Comparação vs Financiamento</h4>
                <div className="space-y-1 text-sm">
                  <p>Financiamento: <strong>{formatCurrency(resultado.financiamento.custoTotalFinanciamento)}</strong></p>
                  <p>Consórcio: <strong>{formatCurrency(resultado.consorcio.custoTotalConsorcio)}</strong></p>
                  <p className={resultado.economia.valor > 0 ? 'text-green-700' : 'text-red-700'}>
                    {resultado.economia.valor > 0 ? 'Economia' : 'Custo Extra'}: <strong>{formatCurrency(Math.abs(resultado.economia.valor))}</strong>
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={salvarSimulacao}
                  disabled={!clienteSelecionado}
                  className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  Salvar Simulação
                </button>
                <button
                  onClick={gerarComparativo}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Análise de Lances */}
      {resultado && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Análise de Lances</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Percentual do Lance (%)
              </label>
              <input
                type="number"
                value={percentualLance}
                onChange={(e) => setPercentualLance(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 20"
                max="50"
                min="0"
              />
            </div>

            {percentualLance > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Análise de Lance</h4>
                <div className="space-y-1 text-sm">
                  <p>Valor do Lance: <strong>{formatCurrency((parseNumber(formData.valorCredito) * percentualLance) / 100)}</strong></p>
                  <p>Percentual: <strong>{percentualLance}%</strong></p>
                  <p className="text-gray-600">* Análise detalhada disponível em breve</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}