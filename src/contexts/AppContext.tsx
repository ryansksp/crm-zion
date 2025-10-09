import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { Cliente, PlanoEmbracon, Meta, Simulacao, UserProfile } from '../types';
import { db } from '../firebaseConfig';
import { collection, doc, getDocs, setDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';


interface AppState {
  clientes: Cliente[];
  planos: PlanoEmbracon[];
  metas: Meta;
  simulacoes: Simulacao[];
  userProfile: UserProfile | null;
}

interface AppContextType extends AppState {
  adicionarCliente: (cliente: Omit<Cliente, 'id'>) => Promise<void>;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  moverClienteEtapa: (id: string, novaEtapa: Cliente['etapa']) => Promise<void>;
  reatribuirLead: (id: string, novoUserId: string) => Promise<void>;
  adicionarPlano: (plano: Omit<PlanoEmbracon, 'id' | 'userId'>) => Promise<void>;
  atualizarPlano: (id: string, plano: Partial<PlanoEmbracon>) => Promise<void>;
  atualizarMetas: (metas: Partial<Meta>) => Promise<void>;
  adicionarSimulacao: (simulacao: Omit<Simulacao, 'id'>) => Promise<void>;
  obterClientesAtivos: () => Cliente[];
  obterTaxaConversao: () => number;
  atualizarUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  podeAlterarPermissao: (novoNivel: 'Operador' | 'Gerente' | 'Diretor') => boolean;
  podeGerenciarUsuarios: () => boolean;

  clientesPorUsuario: Record<string, Cliente[]>;
  metasPorUsuario: Record<string, Meta>;
  userProfiles: Record<string, UserProfile>;

  isPlanComparisonOpen: boolean;
  setIsPlanComparisonOpen: React.Dispatch<React.SetStateAction<boolean>>;

  theme: 'light' | 'dark';
  toggleTheme: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

type Action =
  | { type: 'SET_CLIENTES'; payload: Cliente[] }
  | { type: 'SET_PLANOS'; payload: PlanoEmbracon[] }
  | { type: 'SET_METAS'; payload: Meta }
  | { type: 'SET_SIMULACOES'; payload: Simulacao[] }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile | null }
  | { type: 'ADICIONAR_SIMULACAO'; payload: Simulacao };

const initialState: Omit<AppState, 'userProfile'> = {
  clientes: [],
  planos: [],
  metas: { mensal: 0, vendidoNoMes: 0 },
  simulacoes: []
};

function appReducer(state: Omit<AppState, 'userProfile'>, action: Action): Omit<AppState, 'userProfile'> {
  switch (action.type) {
    case 'SET_CLIENTES':
      return { ...state, clientes: action.payload };
    case 'SET_PLANOS':
      return { ...state, planos: action.payload };
    case 'SET_METAS':
      return { ...state, metas: action.payload };
    case 'SET_SIMULACOES':
      return { ...state, simulacoes: action.payload };
    case 'ADICIONAR_SIMULACAO':
      return { ...state, simulacoes: [...state.simulacoes, action.payload] };
    default:
      return state;
  }
}

import { ClienteService } from '../services/clienteService';
import { PlanoService } from '../services/planoService';
import { SimulacaoService } from '../services/simulacaoService';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();

  const [clientesPorUsuario, setClientesPorUsuario] = useState<Record<string, Cliente[]>>({});
  const [metasPorUsuario, setMetasPorUsuario] = useState<Record<string, Meta>>({});
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  const [isPlanComparisonOpen, setIsPlanComparisonOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (userProfile?.theme) {
      setTheme(userProfile.theme);
    } else {
      setTheme('light');
    }
  }, [userProfile?.theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await atualizarUserProfile({ theme: newTheme });
  };

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    const docRef = doc(db, 'users', user.uid);

    // Real-time listener to user profile document
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userProfileData: UserProfile = {
          ...(data as UserProfile),
          isMaster: data.isMaster || false,
        };
        setUserProfile(userProfileData);
      } else {
        const defaultProfile: UserProfile = {
          id: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          phone: '',
          accessLevel: 'Operador',
          status: 'pending' // Novo campo para controle de aprovação
        };
        setDoc(docRef, defaultProfile);
        setUserProfile(defaultProfile);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Carregar dados do Firestore em tempo real
  useEffect(() => {
    if (!user) return;

    // Seed default plans if none exist
    const seedDefaultPlans = async () => {
      const planosSnapshot = await getDocs(collection(db, 'planos'));
      if (planosSnapshot.empty) {
        await PlanoService.adicionarPlanosConsorcio(user.uid);
      }
    };

    seedDefaultPlans();

    // Clientes - Master e Diretores veem todos, outros veem apenas os seus
    let qClientes;
    if (userProfile?.isMaster || userProfile?.accessLevel === 'Diretor' || userProfile?.accessLevel === 'Gerente') {
      qClientes = query(collection(db, 'clientes'));
    } else {
      qClientes = query(collection(db, 'clientes'), where('userId', '==', user.uid));
    }

    const unsubscribeClientes = onSnapshot(qClientes, (querySnapshot) => {
      const clientesFirestore: Cliente[] = [];
      const clientesPorUser: Record<string, Cliente[]> = {};
      querySnapshot.forEach((docSnap) => {
        const cliente = { id: docSnap.id, ...docSnap.data() } as Cliente;
        clientesFirestore.push(cliente);
        if (!clientesPorUser[cliente.userId]) {
          clientesPorUser[cliente.userId] = [];
        }
        clientesPorUser[cliente.userId].push(cliente);
      });
      dispatch({ type: 'SET_CLIENTES', payload: clientesFirestore });
      setClientesPorUsuario(clientesPorUser);
    });

    // Planos - Todos os usuários veem todos os planos (planos são globais)
    const qPlanos = query(collection(db, 'planos'));

    const unsubscribePlanos = onSnapshot(qPlanos, (querySnapshot) => {
      const planosFirestore: PlanoEmbracon[] = [];
      querySnapshot.forEach((docSnap) => {
        planosFirestore.push({ id: docSnap.id, ...docSnap.data() } as PlanoEmbracon);
      });
      dispatch({ type: 'SET_PLANOS', payload: planosFirestore });
    });

    // Simulacoes - Master e Diretores veem todas, outros veem apenas as suas
    let qSimulacoes;

    if (userProfile?.isMaster || userProfile?.accessLevel === 'Diretor' || userProfile?.accessLevel === 'Gerente') {
      qSimulacoes = query(collection(db, 'simulacoes'));
    } else {
      qSimulacoes = query(collection(db, 'simulacoes'), where('userId', '==', user.uid));
    }

    const unsubscribeSimulacoes = onSnapshot(qSimulacoes, (querySnapshot) => {
      const simulacoesFirestore: Simulacao[] = [];
      querySnapshot.forEach((docSnap) => {
        simulacoesFirestore.push({ id: docSnap.id, ...docSnap.data() } as Simulacao);
      });
      dispatch({ type: 'SET_SIMULACOES', payload: simulacoesFirestore });
    });

    // Metas - Diretores e Gerentes veem todas, outros veem apenas as suas
    let metasCollectionRef;
    if (userProfile?.accessLevel === 'Diretor' || userProfile?.accessLevel === 'Gerente') {
      metasCollectionRef = collection(db, 'metas');
    } else {
      metasCollectionRef = collection(db, 'metas');
    }

    const unsubscribeMetas = onSnapshot(metasCollectionRef, (querySnapshot) => {
      const metasPorUser: Record<string, Meta> = {};
      querySnapshot.forEach((docSnap) => {
        metasPorUser[docSnap.id] = docSnap.data() as Meta;
      });

      // Agregar metas para exibição geral
      const metasAgregadas = Object.values(metasPorUser).reduce((acc, meta) => {
        acc.mensal += meta.mensal || 0;
        acc.vendidoNoMes += meta.vendidoNoMes || 0;
        return acc;
      }, { mensal: 0, vendidoNoMes: 0 });

      dispatch({ type: 'SET_METAS', payload: metasAgregadas });
      setMetasPorUsuario(metasPorUser);
    });

    // Load user profiles for Diretor and Gerente
    let unsubscribeUsers: import('firebase/firestore').Unsubscribe | undefined;
    if (userProfile?.accessLevel === 'Diretor' || userProfile?.accessLevel === 'Gerente') {
      unsubscribeUsers = onSnapshot(collection(db, 'users'), (querySnapshot) => {
        const profiles: Record<string, UserProfile> = {};
        querySnapshot.forEach((docSnap) => {
          profiles[docSnap.id] = { id: docSnap.id, ...docSnap.data() } as UserProfile;
        });
        setUserProfiles(profiles);
      });
    }

    return () => {
      unsubscribeClientes();
      unsubscribePlanos();
      unsubscribeSimulacoes();
      unsubscribeMetas();
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, [user, userProfile]);

  const atualizarUserProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);

    // Se o nível de acesso foi alterado, atualizar as permissões padrão
    if (profile.accessLevel) {
      let newPermissions: UserProfile['permissions'] = {
        canViewAllClients: false,
        canViewAllLeads: false,
        canViewAllSimulations: false,
        canViewAllReports: false,
        canManageUsers: false,
        canChangeSettings: false,
        canEditProfile: false,
      };

      if (profile.accessLevel === 'Diretor') {
        newPermissions = {
          canViewAllClients: true,
          canViewAllLeads: true,
          canViewAllSimulations: true,
          canViewAllReports: true,
          canManageUsers: true,
          canChangeSettings: true,
          canEditProfile: true,
        };
      } else if (profile.accessLevel === 'Gerente') {
        newPermissions = {
          canViewAllClients: false,
          canViewAllLeads: false,
          canViewAllSimulations: false,
          canViewAllReports: false,
          canManageUsers: false,
          canChangeSettings: true,
          canEditProfile: true,
        };
      }

      (profile as Partial<UserProfile>).permissions = newPermissions;
    }

    await updateDoc(docRef, profile);
    setUserProfile(prev => prev ? { ...prev, ...profile } as UserProfile : null);
  };

  const adicionarCliente = async (cliente: Omit<Cliente, 'id'>) => {
    if (!user) return;
    const clienteId = await ClienteService.adicionarCliente(cliente);
    // Atualizar o estado local com o novo cliente
    const novoCliente: Cliente = {
      ...cliente,
      id: clienteId,
      userId: cliente.userId
    };
    dispatch({ type: 'SET_CLIENTES', payload: [...state.clientes, novoCliente] });
  };

  const atualizarCliente = async (id: string, cliente: Partial<Cliente>) => {
    if (!user) return;
    await ClienteService.atualizarCliente(id, cliente);
  };

  const moverClienteEtapa = async (id: string, novaEtapa: Cliente['etapa']) => {
    if (!user) return;
    await ClienteService.moverClienteEtapa(id, novaEtapa, userProfile);
  };

  const reatribuirLead = async (id: string, novoUserId: string) => {
    if (!user) return;
    await ClienteService.reatribuirLead(id, novoUserId);
  };

  const adicionarPlano = async (plano: Omit<PlanoEmbracon, 'id' | 'userId'>) => {
    if (!user) return;
    await PlanoService.adicionarPlano(plano, user.uid);
  };

  const atualizarPlano = async (id: string, plano: Partial<PlanoEmbracon>) => {
    if (!user) return;
    await PlanoService.atualizarPlano(id, plano, userProfile);
  };

  const atualizarMetas = async (metas: Partial<Meta>) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'metas', user.uid);
      await setDoc(docRef, metas, { merge: true });
    } catch (error) {
      console.error('Erro ao atualizar metas:', error);
      throw error;
    }
  };

  const adicionarSimulacao = async (simulacao: Omit<Simulacao, 'id'>) => {
    if (!user) return;
    await SimulacaoService.adicionarSimulacao({ ...simulacao, userId: user.uid });
  };

  const obterClientesAtivos = () => {
    if (!userProfile) return [];
    if (userProfile.accessLevel === 'Diretor' || userProfile.accessLevel === 'Gerente') {
      return state.clientes.filter(c => c.etapa === 'Venda Ganha');
    }
    return state.clientes.filter(c => c.etapa === 'Venda Ganha' && c.userId === userProfile.id);
  };

  const obterTaxaConversao = () => {
    const totalClientes = state.clientes.length;
    const vendas = state.clientes.filter(c => c.etapa === 'Venda Ganha').length;
    return totalClientes > 0 ? (vendas / totalClientes) * 100 : 0;
  };

  const podeAlterarPermissao = (novoNivel: 'Operador' | 'Gerente' | 'Diretor') => {
    if (!userProfile) return false;

    // Operadores não podem alterar para níveis superiores
    if (userProfile.accessLevel === 'Operador') {
      return false;
    }

    // Gerentes só podem alterar para Operador
    if (userProfile.accessLevel === 'Gerente') {
      return novoNivel === 'Operador';
    }

    // Diretores podem alterar para qualquer nível
    if (userProfile.accessLevel === 'Diretor') {
      return true;
    }

    return false;
  };

  const podeGerenciarUsuarios = () => {
    return (userProfile?.accessLevel === 'Diretor' || userProfile?.accessLevel === 'Gerente') && userProfile?.status === 'approved';
  };

  return (
    <AppContext.Provider value={{
      ...state,
      userProfile,
      adicionarCliente,
      atualizarCliente,
      moverClienteEtapa,
      reatribuirLead,
      adicionarPlano,
      atualizarPlano,
      atualizarMetas,
      adicionarSimulacao,
      obterClientesAtivos,
      obterTaxaConversao,
      atualizarUserProfile,
      podeAlterarPermissao,
      podeGerenciarUsuarios,
      clientesPorUsuario,
      metasPorUsuario,
      userProfiles,
      isPlanComparisonOpen,
      setIsPlanComparisonOpen,
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
};
