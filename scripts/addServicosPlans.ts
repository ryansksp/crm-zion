import { PlanoService } from '../src/services/planoService';

const servicosPlans = [
  { nome: 'Serviços 15k', categoria: 'Serviços', prazo: 40, taxaAdministracao: 21, fundoReserva: 5, seguro: 10, taxaAdesao: 1.2, valorCredito: 15000 },
  { nome: 'Serviços 20k', categoria: 'Serviços', prazo: 40, taxaAdministracao: 21, fundoReserva: 5, seguro: 10, taxaAdesao: 1.2, valorCredito: 20000 },
  { nome: 'Serviços 25k', categoria: 'Serviços', prazo: 40, taxaAdministracao: 21, fundoReserva: 5, seguro: 10, taxaAdesao: 1.2, valorCredito: 25000 },
  { nome: 'Serviços 30k', categoria: 'Serviços', prazo: 40, taxaAdministracao: 21, fundoReserva: 5, seguro: 10, taxaAdesao: 1.2, valorCredito: 30000 },
];

async function addServicosPlans() {
  const userId = 'default-user-id'; // Replace with actual user ID or logic to get user ID
  for (const plan of servicosPlans) {
    await PlanoService.adicionarPlano(plan, userId);
    console.log(`Added plan: ${plan.nome} with prazo ${plan.prazo}`);
  }
}

addServicosPlans().then(() => {
  console.log('All Serviços plans added.');
}).catch((error) => {
  console.error('Error adding Serviços plans:', error);
});
