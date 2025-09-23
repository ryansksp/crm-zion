interface FormData {
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

export default function calculate(formData: FormData) {
  // Parse inputs
  const valorCredito = parseFloat(formData.valorCredito?.toString().replace(",", ".") || "0");
  const prazo = parseInt(formData.prazo || "0");
  const taxaAdm = parseFloat(formData.taxaAdm?.toString().replace(",", ".") || "0") / 100;
  const fundoReserva = parseFloat(formData.fundoReserva?.toString().replace(",", ".") || "0") / 100;
  const taxaAdesao = parseFloat(formData.taxaAdesao?.toString().replace(",", ".") || "0") / 100;
  const lanceEmbutido = parseFloat(formData.lanceEmbutido?.toString().replace(",", ".") || "0") / 100;
  const lanceProprio = parseFloat(formData.lanceProprio?.toString().replace(",", ".") || "0") / 100;
  const entrada = parseFloat(formData.entrada?.toString().replace(",", ".") || "0");
  const taxaJuros = parseFloat(formData.taxaJuros?.toString().replace(",", ".") || "0") / 100;
  const prazoFinanciamento = parseInt(formData.prazoFinanciamento || "0");

  // Consórcio
  const valorLanceEmbutido = valorCredito * lanceEmbutido;
  const valorLanceProprio = valorCredito * lanceProprio;
  const creditoLiberado = valorCredito - valorLanceEmbutido;
  const taxaTotal = taxaAdm + fundoReserva + taxaAdesao;
  const custoTaxas = valorCredito * taxaTotal;
  const saldoDevedor = valorCredito - valorLanceProprio;
  const custoTotalConsorcio = saldoDevedor + custoTaxas;
  const primeiraParcela = (valorCredito * taxaAdm) / prazo + (valorCredito / prazo);
  const segundaA12Parcela = primeiraParcela; // simplificado
  const demaisParcelas = primeiraParcela; // simplificado
  const custoAoMesPercent = ((custoTotalConsorcio / prazo) / valorCredito) * 100;

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