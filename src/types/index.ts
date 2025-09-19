export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  planoInteresse: string;
  valorCredito?: number;
  etapa: EtapaFunil;
  dataUltimaInteracao: string;
  historico: Interacao[];
  simulacoes: Simulacao[];
  dataVenda?: string;
  dataPerda?: string;
  grupoECota?: string;
  statusConsorcio?: 'Ativo' | 'Contemplado' | 'Cancelado';
  aniversario?: string;
  userId: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  phone?: string;
  accessLevel: 'Operador' | 'Gerente' | 'Diretor';
}

export type EtapaFunil =
  | 'Novo Cliente'
  | 'Lead'
  | 'Contato Inicial'
  | 'Envio de Simulação'
  | 'Follow-up'
  | 'Negociação Final'
  | 'Venda Ganha'
  | 'Venda Perdida';

export interface Interacao {
  id: string;
  data: string;
  tipo: 'Ligação' | 'WhatsApp' | 'Email' | 'Reunião';
  descricao: string;
}

export interface PlanoEmbracon {
  id: string;
  nome: string;
  prazo: number; // em meses
  taxaAdministracao: number; // percentual
  fundoReserva: number; // percentual
  seguro: number; // percentual
  userId: string;
}

export interface Simulacao {
  id: string;
  clienteId: string;
  planoId: string;
  valorCredito: number;
  parcela: number;
  dataSimulacao: string;
  analiselance?: {
    percentualLance: number;
    novoVencimento: number;
  };
}

export interface Meta {
  mensal: number;
  vendidoNoMes: number;
  comissaoEstimada: number;
}
