import { PlanoService } from '../src/services/planoService.js';

const automovelPlans = [
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 45000, parcela: 370.36 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 50000, parcela: 411.50 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 55000, parcela: 452.66 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 60000, parcela: 493.80 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 65000, parcela: 534.96 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 70000, parcela: 576.10 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 75000, parcela: 617.26 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 80000, parcela: 658.40 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 85000, parcela: 699.56 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 90000, parcela: 740.70 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 95000, parcela: 781.86 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 100000, parcela: 823.00 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 110000, parcela: 905.30 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 120000, parcela: 987.60 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 130000, parcela: 1069.90 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 140000, parcela: 1152.20 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 150000, parcela: 1234.50 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 160000, parcela: 1316.80 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 170000, parcela: 1399.10 },
  { nome: 'Automóvel 100 Meses', categoria: 'Automóvel', prazo: 100, taxaAdministracao: 22, fundoReserva: 3, seguro: 10, taxaAdesao: 1.2, valorCredito: 180000, parcela: 1481.40 },
];

async function addAutomovelPlans() {
  const userId = 'default-user-id'; // Replace with actual user ID or logic to get user ID
  for (const plan of automovelPlans) {
    await PlanoService.adicionarPlano(plan, userId);
    console.log(`Added plan: ${plan.nome} with prazo ${plan.prazo}`);
  }
}

addAutomovelPlans().then(() => {
  console.log('All Automóvel plans added.');
}).catch((error) => {
  console.error('Error adding Automóvel plans:', error);
});
