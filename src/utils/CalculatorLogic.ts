import { parseNumber } from './formatters';

interface FormData {
  valorCredito: string;
  prazo: string;
  taxaAdm: string;
  fundoReserva: string;
  taxaAdesao: string;
  antecipacao1?: string;
  antecipacao2a12?: string;
  lanceEmbutido: string;
  lanceProprio: string;
  entrada: string;
  taxaJuros: string;
  prazoFinanciamento: string;
}

interface ConsortiumResult {
  creditoLiberado: number;
  primeiraParcela: number;
  segundaA12Parcela: number;
  demaisParcelas: number;
  valorLanceProprio: number;
  custoTotalConsorcio: number;
  custoAoMesPercent: number;
  taxaAdesaoValor: number;
  valorTaxaAdm: number;
  valorFundoReserva: number;
}

interface FinancingResult {
  valorFinanciado: number;
  parcelaMensal: number;
  jurosTotais: number;
  custoTotalFinanciamento: number;
}

interface CalculationResult {
  consorcio: ConsortiumResult;
  financiamento: FinancingResult;
  economia: {
    valor: number;
    percentual: number;
  };
}

export default function calculate(formData: FormData): CalculationResult | null {
  // Parse inputs
  const valorCredito = parseFloat(formData.valorCredito?.toString().replace(",", ".") || "0");
  const prazo = parseInt(formData.prazo || "0");
  const taxaAdm = parseFloat(formData.taxaAdm?.toString().replace(",", ".") || "0") / 100;
  const fundoReserva = parseFloat(formData.fundoReserva?.toString().replace(",", ".") || "0") / 100;
  const taxaAdesao = parseFloat(formData.taxaAdesao?.toString().replace(",", ".") || "0") / 100;
  const antecipacao1 = parseFloat(formData.antecipacao1?.toString().replace(",", ".") || "0") / 100;
  const antecipacao2a12 = parseFloat(formData.antecipacao2a12?.toString().replace(",", ".") || "0") / 100;
  const lanceEmbutido = parseFloat(formData.lanceEmbutido?.toString().replace(",", ".") || "0") / 100;
  const lanceProprio = parseFloat(formData.lanceProprio?.toString().replace(",", ".") || "0") / 100;
  const entrada = parseFloat(formData.entrada?.toString().replace(",", ".") || "0");
  const taxaJuros = parseFloat(formData.taxaJuros?.toString().replace(",", ".") || "0") / 100;
  const prazoFinanciamento = parseInt(formData.prazoFinanciamento || "0");

  // Consórcio
  // Taxa de administração mensal (sobre o valor do crédito)
  const taxaAdmMensal = (valorCredito * taxaAdm) / 100;

  // Fundo de reserva mensal (sobre o valor do crédito)
  const fundoReservaMensal = (valorCredito * fundoReserva) / 100;

  // Taxa de adesão (valor único na primeira parcela)
  const taxaAdesaoValor = (valorCredito * taxaAdesao) / 100;

  // Valor do lance próprio
  const valorLanceProprio = (valorCredito * lanceProprio) / 100;

  // Crédito liberado (valor do crédito menos o lance próprio)
  const creditoLiberado = valorCredito - valorLanceProprio;

  // Cálculo das parcelas
  const parcelaNormal = taxaAdmMensal + fundoReservaMensal;

  // 1ª Parcela (inclui taxa de adesão e antecipação)
  const primeiraParcela = parcelaNormal + taxaAdesaoValor + (parcelaNormal * antecipacao1);

  // 2ª a 12ª Parcela (inclui antecipação)
  const segundaA12Parcela = parcelaNormal + (parcelaNormal * antecipacao2a12);

  // Demais parcelas (valor normal)
  const demaisParcelas = parcelaNormal;

  // Custo total do consórcio
  const custoTotalConsorcio = primeiraParcela + (segundaA12Parcela * 11) + (demaisParcelas * (prazo - 12)) + valorLanceProprio;

  // Custo efetivo mensal (percentual)
  const custoAoMesPercent = ((custoTotalConsorcio - valorCredito) / valorCredito / prazo) * 100;

  // Financiamento
  const valorFinanciado = valorCredito - entrada;
  // Fórmula de parcela fixa: PMT = PV * [i*(1+i)^n] / [(1+i)^n - 1]
  const i = taxaJuros;
  const n = prazoFinanciamento;
  const parcelaMensal = i > 0
    ? valorFinanciado * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1)
    : valorFinanciado / n;
  const jurosTotais = parcelaMensal * n - valorFinanciado;
  const custoTotalFinanciamento = entrada + parcelaMensal * n;

  // Economia
  const economiaValor = custoTotalFinanciamento - custoTotalConsorcio;
  const economiaPercentual = economiaValor / custoTotalFinanciamento * 100;

  return {
    consorcio: {
      creditoLiberado,
      primeiraParcela,
      segundaA12Parcela,
      demaisParcelas,
      valorLanceProprio,
      custoTotalConsorcio,
      custoAoMesPercent,
      taxaAdesaoValor,
      valorTaxaAdm: taxaAdmMensal,
      valorFundoReserva: fundoReservaMensal,
    },
    financiamento: {
      valorFinanciado,
      parcelaMensal,
      jurosTotais,
      custoTotalFinanciamento,
    },
    economia: {
      valor: economiaValor,
      percentual: economiaPercentual,
    },
  };
}

// Função auxiliar para calcular impacto de lances
export function calcularImpactoLance(
  valorCredito: number,
  percentualLance: number,
  prazoOriginal: number,
  taxaAdm: number,
  fundoReserva: number
) {
  const valorLance = (valorCredito * percentualLance) / 100;
  const creditoLiberado = valorCredito - valorLance;

  // Estimativa de redução no prazo (30% do percentual do lance)
  const reducaoPrazo = Math.floor(prazoOriginal * (percentualLance / 100) * 0.3);
  const novoPrazo = Math.max(prazoOriginal - reducaoPrazo, 12);

  const parcelaNormal = ((valorCredito * taxaAdm) / 100) + ((valorCredito * fundoReserva) / 100);
  const economiaTotal = parcelaNormal * reducaoPrazo;

  return {
    valorLance,
    creditoLiberado,
    novoPrazo,
    reducaoPrazo,
    economiaTotal,
    parcelaMensal: parcelaNormal
  };
}
