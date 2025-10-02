// Interface para os dados dos planos
export interface PlanoConsorcio {
  tipo: 'automovel' | 'imovel';
  credito: number;
  parcela: number;
  prazoMeses: number;
  taxaAdmTotal: number; // em porcentagem
  fundoReserva: number; // em porcentagem
}

// ########## PLANOS DE AUTOMÓVEL ##########

// Automóvel - 90 Meses
export const planosAutomovel90Meses: PlanoConsorcio[] = [
  { tipo: 'automovel', credito: 45000, parcela: 401.54, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 50000, parcela: 446.15, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 55000, parcela: 490.77, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 60000, parcela: 535.38, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 65000, parcela: 580.00, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 70000, parcela: 624.61, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 75000, parcela: 669.23, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 80000, parcela: 713.84, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 85000, parcela: 758.46, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 90000, parcela: 803.07, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 95000, parcela: 847.69, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 100000, parcela: 892.30, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 110000, parcela: 981.53, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 120000, parcela: 1070.76, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 130000, parcela: 1159.99, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 140000, parcela: 1249.22, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 150000, parcela: 1338.45, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 160000, parcela: 1427.68, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 170000, parcela: 1516.91, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
  { tipo: 'automovel', credito: 180000, parcela: 1606.14, prazoMeses: 90, taxaAdmTotal: 21, fundoReserva: 3 },
];

// Automóvel - 100 Meses
export const planosAutomovel100Meses: PlanoConsorcio[] = [
  { tipo: 'automovel', credito: 45000, parcela: 370.36, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 50000, parcela: 411.50, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 55000, parcela: 452.66, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 60000, parcela: 493.80, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 65000, parcela: 534.96, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 70000, parcela: 576.10, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 75000, parcela: 617.26, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 80000, parcela: 658.40, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 85000, parcela: 699.56, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 90000, parcela: 740.70, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 95000, parcela: 781.86, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 100000, parcela: 823.00, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 110000, parcela: 905.30, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 120000, parcela: 987.60, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 130000, parcela: 1069.90, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 140000, parcela: 1152.20, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 150000, parcela: 1234.50, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 160000, parcela: 1315.80, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 170000, parcela: 1399.10, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
  { tipo: 'automovel', credito: 180000, parcela: 1481.40, prazoMeses: 100, taxaAdmTotal: 22, fundoReserva: 3 },
];

// ########## PLANOS DE IMÓVEL (ATUALIZADO) ##########

// Imóvel - 200 Meses
export const planosImovel200Meses: PlanoConsorcio[] = [
  { tipo: 'imovel', credito: 120000, parcela: 574.80, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 130000, parcela: 622.70, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 140000, parcela: 670.60, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 150000, parcela: 718.50, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 160000, parcela: 766.40, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 170000, parcela: 814.30, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 180000, parcela: 862.20, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 190000, parcela: 910.10, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 200000, parcela: 958.00, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 210000, parcela: 1005.90, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 220000, parcela: 1053.80, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 230000, parcela: 1101.70, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 240000, parcela: 1149.60, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 250000, parcela: 1197.50, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 260000, parcela: 1245.40, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 270000, parcela: 1293.30, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 280000, parcela: 1341.20, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 290000, parcela: 1389.10, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
  { tipo: 'imovel', credito: 300000, parcela: 1437.00, prazoMeses: 200, taxaAdmTotal: 26, fundoReserva: 2 },
];

// Imóvel - 220 Meses
export const planosImovel220Meses: PlanoConsorcio[] = [
  { tipo: 'imovel', credito: 120000, parcela: 538.80, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 130000, parcela: 583.70, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 140000, parcela: 628.60, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 150000, parcela: 673.50, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 160000, parcela: 718.40, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 170000, parcela: 763.30, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 180000, parcela: 808.20, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 190000, parcela: 853.10, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 200000, parcela: 898.00, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 210000, parcela: 942.90, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 220000, parcela: 987.80, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 230000, parcela: 1032.70, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 240000, parcela: 1077.60, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 250000, parcela: 1122.50, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 260000, parcela: 1167.40, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 270000, parcela: 1212.30, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 280000, parcela: 1257.20, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 290000, parcela: 1302.10, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
  { tipo: 'imovel', credito: 300000, parcela: 1347.00, prazoMeses: 220, taxaAdmTotal: 27, fundoReserva: 2 },
];

// Imóvel - 240 Meses
export const planosImovel240Meses: PlanoConsorcio[] = [
  { tipo: 'imovel', credito: 120000, parcela: 508.92, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 130000, parcela: 551.33, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 140000, parcela: 593.74, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 150000, parcela: 636.15, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 160000, parcela: 678.56, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 170000, parcela: 720.97, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 180000, parcela: 763.38, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 190000, parcela: 805.79, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 200000, parcela: 848.20, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 210000, parcela: 890.61, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 220000, parcela: 933.02, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 230000, parcela: 975.43, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 240000, parcela: 1017.84, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 250000, parcela: 1060.25, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 260000, parcela: 1102.66, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 270000, parcela: 1145.07, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 280000, parcela: 1187.48, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 290000, parcela: 1229.89, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
  { tipo: 'imovel', credito: 300000, parcela: 1272.30, prazoMeses: 240, taxaAdmTotal: 28, fundoReserva: 2 },
];
