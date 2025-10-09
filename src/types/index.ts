export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  planoInteresse: string;
  valorCredito?: number;
  etapa: EtapaFunil;
  dataUltimaInteracao: string;
  dataCriacao: string;
  historico: Interacao[];
  simulacoes: Simulacao[];
  dataVenda?: string;
  dataPerda?: string;
  motivoPerda?: string;
  gruposECotas?: string[];
  grupo?: string;
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
  status?: 'pending' | 'approved' | 'rejected';
  isMaster?: boolean;
  theme?: 'light' | 'dark';
  permissions?: {
    canViewAllClients: boolean;
    canViewAllLeads: boolean;
    canViewAllSimulations: boolean;
    canViewAllReports: boolean;
    canManageUsers: boolean;
    canChangeSettings: boolean;
    canEditProfile: boolean;
  };
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
  tipo: 'Ligação' | 'WhatsApp' | 'Email' | 'Reunião' | 'Cadastro';
  descricao: string;
}

export interface PlanoEmbracon {
  id: string;
  nome: string;
  tipo?: string; // Ex: 'automovel', 'imovel', 'servicos'
  categoria?: string; // Ex: 'Auto', 'Imóveis', 'Serviços'
  prazoMeses?: number; // em meses
  prazo?: number; // em meses (para compatibilidade)
  taxaAdmTotal?: number; // percentual
  taxaAdministracao?: number; // percentual (para compatibilidade)
  fundoReserva: number; // percentual
  seguro: number; // percentual
  taxaAdesao?: number; // percentual
  credito?: number; // valor do crédito
  valorCredito?: number; // valor do crédito (para compatibilidade)
  parcela?: number; // valor da parcela
  userId: string;
}

export interface Simulacao {
  id: string;
  clienteId: string;
  planoId: string;
  valorCredito: number;
  parcela: number;
  dataSimulacao: string;
  userId: string;
  analiselance?: {
    percentualLance: number;
    novoVencimento: number;
  };
}

export interface Meta {
  mensal: number;
  vendidoNoMes: number;
}
