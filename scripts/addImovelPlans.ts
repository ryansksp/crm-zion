import { PlanoService } from '../src/services/planoService';

const imovelPlans = [
  { nome: 'Imóvel 240 Meses', categoria: 'Imóvel', prazo: 240, taxaAdministracao: 28, fundoReserva: 2, seguro: 10, taxaAdesao: 1.2 },
  { nome: 'Imóvel 240 Meses', categoria: 'Imóvel', prazo: 240, taxaAdministracao: 28, fundoReserva: 2, seguro: 10, taxaAdesao: 1.2 },
  { nome: 'Imóvel 240 Meses', categoria: 'Imóvel', prazo: 240, taxaAdministracao: 28, fundoReserva: 2, seguro: 10, taxaAdesao: 1.2 },
  { nome: 'Imóvel 240 Meses', categoria: 'Imóvel', prazo: 240, taxaAdministracao: 28, fundoReserva: 2, seguro: 10, taxaAdesao: 1.2 },
  { nome: 'Imóvel 240 Meses', categoria: 'Imóvel', prazo: 240, taxaAdministracao: 28, fundoReserva: 2, seguro: 10, taxaAdesao: 1.2 },
  { nome: 'Imóvel 240 Meses', categoria: 'Imóvel', prazo: 240, taxaAdministracao: 28, fundoReserva: 2, seguro: 10, taxaAdesao: 1.2 },
  { nome: 'Imóvel 240 Meses', categoria: 'Imóvel', prazo: 240, taxaAdministracao: 28, fundoReserva: 2, seguro: 10, taxaAdesao: 1.2 },
  { nome: 'Imóvel 240 Meses', categoria: 'Imóvel', prazo: 240, taxaAdministracao: 28, fundoReserva: 2, seguro: 10, taxaAdesao: 1.2 },
  { nome: 'Imóvel 240 Meses', categoria: 'Imóvel', prazo: 240, taxaAdministracao: 28, fundoReserva: 2, seguro: 10, taxaAdesao: 1.2 },
  { nome: 'Imóvel 240 Meses', categoria: 'Imóvel', prazo: 240, taxaAdministracao: 28, fundoReserva: 2, seguro: 10, taxaAdesao: 1.2 },
];

async function addImovelPlans() {
  const userId = 'default-user-id'; // Replace with actual user ID or logic to get user ID
  for (const plan of imovelPlans) {
    await PlanoService.adicionarPlano(plan, userId);
    console.log(`Added plan: ${plan.nome} with prazo ${plan.prazo}`);
  }
}

addImovelPlans().then(() => {
  console.log('All Imóvel plans added.');
}).catch((error) => {
  console.error('Error adding Imóvel plans:', error);
});
