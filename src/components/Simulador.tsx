import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatDateTimeBrasilia } from '../utils/date';
import { Calculator, Download, TrendingUp } from 'lucide-react';
import calculate from '../utils/CalculatorLogic';
import { formatCurrency, formatPercent, parseNumber } from '../utils/formatters';
import PlanComparisonPopup from './PlanComparisonPopup';

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
  const { setIsPlanComparisonOpen } = useApp();

  return (
    <>
      <PlanComparisonPopup />
    </>
  );
};
