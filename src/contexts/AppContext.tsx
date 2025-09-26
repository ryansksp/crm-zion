import { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { Cliente, PlanoEmbracon, Meta, Simulacao, UserProfile } from '../types';
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();

  const [clientesPorUsuario, setClientesPorUsuario] = useState<Record<string, Cliente[]>>({});
  const [metasPorUsuario, setMetasPorUsuario] = useState<Record<string, Meta>>({});
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});



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
          photoURL: user.photoURL || '',
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
      const planosSnapshot = await getDocs(query(collection(db, 'planos'), where('userId', '==', user.uid)));
      if (planosSnapshot.empty) {
        const defaultPlans: Omit<PlanoEmbracon, 'id' | 'userId'>[] = [
          // Auto category
          {
            nome: 'Plano Auto Básico',
            categoria: 'Auto',
            prazo: 100,
            taxaAdministracao: 0.28,
            fundoReserva: 0.02,
            seguro: 0.10,
            taxaAdesao: 1.2
          },
          {
            nome: 'Plano Auto Premium',
            categoria: 'Auto',
            prazo: 100,
            taxaAdministracao: 0.28,
            fundoReserva: 0.02,
            seguro: 0.10,
            taxaAdesao: 2.0
          },
          // Imóveis category
          {
            nome: 'Plano Imóveis Padrão',
            categoria: 'Imóveis',
            prazo: 240,
            taxaAdministracao: 0.28,
            fundoReserva: 0.02,
            seguro: 0.10,
            taxaAdesao: 1.2
          },
          {
            nome: 'Plano Imóveis Avançado',
            categoria: 'Imóveis',
            prazo: 240,
            taxaAdministracao: 0.28,
            fundoReserva: 0.02,
            seguro: 0.10,
            taxaAdesao: 2.0
          },
          // Serviços category
          {
            nome: 'Plano Serviços Básico',
            categoria: 'Serviços',
            prazo: 40,
            taxaAdministracao: 0.28,
            fundoReserva: 0.02,
            seguro: 0.10,
            taxaAdesao: 1.2
          },
          {
            nome: 'Plano Serviços Premium',
            categoria: 'Serviços',
            prazo: 40,
            taxaAdministracao: 0.28,
            fundoReserva: 0.02,
            seguro: 0.10,
            taxaAdesao: 2.0
          }
        ];

        for (const plano of defaultPlans) {
          await adicionarPlano(plano);
        }
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

    // Planos - Master e Diretores veem todos, outros veem apenas os seus
    let qPlanos;
    if (userProfile?.isMaster || userProfile?.accessLevel === 'Diretor' || userProfile?.accessLevel === 'Gerente') {
      qPlanos = query(collection(db, 'planos'));
    } else {
      qPlanos = query(collection(db, 'planos'), where('userId', '==', user.uid));
    }

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
      let newPermissions = {
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

      // Usar type assertion para evitar erro de propriedade inexistente
      (profile as any).permissions = newPermissions;
    }

    await updateDoc(docRef, profile);
    setUserProfile(prev => prev ? { ...prev, ...profile } as UserProfile : null);
  };

  const adicionarCliente = async (cliente: Omit<Cliente, 'id'>) => {
    if (!user) return;
    const novoCliente: Cliente = {
      ...cliente,
      id: Date.now().toString(),
      userId: user.uid
    };
    const docRef = doc(collection(db, 'clientes'));
    await setDoc(docRef, novoCliente);
  };

  const atualizarCliente = async (id: string, cliente: Partial<Cliente>) => {
    if (!user) return;

    let q;
    if (userProfile?.accessLevel === 'Diretor') {
      q = query(collection(db, 'clientes'), where('id', '==', id));
    } else {
      q = query(collection(db, 'clientes'), where('id', '==', id), where('userId', '==', user.uid));
    }

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, cliente);
    }
  };

  const moverClienteEtapa = async (id: string, novaEtapa: Cliente['etapa']) => {
    if (!user) return;

    // Primeiro, buscar o cliente para obter o valor e etapa atual
    let q;
    if (userProfile?.accessLevel === 'Diretor') {
      q = query(collection(db, 'clientes'), where('id', '==', id));
    } else {
      q = query(collection(db, 'clientes'), where('id', '==', id), where('userId', '==', user.uid));
    }

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return;

    const clienteDoc = querySnapshot.docs[0];
    const cliente = { id: clienteDoc.id, ...clienteDoc.data() } as Cliente;
    const etapaAnterior = cliente.etapa;

    // Atualizar a etapa do cliente
    await atualizarCliente(id, {
      etapa: novaEtapa,
      dataUltimaInteracao: new Date().toISOString()
    });

    // Atualizar o vendidoNoMes se necessário
    if (cliente.valorCredito && (etapaAnterior === 'Venda Ganha' || novaEtapa === 'Venda Ganha')) {
      // Para diretores, atualizar as metas do usuário que criou o cliente
      // Para outros, atualizar suas próprias metas
      const userIdParaMetas = userProfile?.accessLevel === 'Diretor' ? cliente.userId : user.uid;
      const docRefMetas = doc(db, 'metas', userIdParaMetas);
      const docSnap = await getDoc(docRefMetas);

      let novasMetas: Partial<Meta> = {};

      if (docSnap.exists()) {
        const metasAtuais = docSnap.data() as Meta;
        let vendidoNoMesAtual = metasAtuais.vendidoNoMes || 0;

        // Se estava em 'Venda Ganha' e agora não está mais, subtrair
        if (etapaAnterior === 'Venda Ganha' && novaEtapa !== 'Venda Ganha') {
          vendidoNoMesAtual = Math.max(0, vendidoNoMesAtual - cliente.valorCredito);
        }
        // Se não estava em 'Venda Ganha' e agora está, adicionar
        else if (etapaAnterior !== 'Venda Ganha' && novaEtapa === 'Venda Ganha') {
          vendidoNoMesAtual += cliente.valorCredito;
        }

        novasMetas.vendidoNoMes = vendidoNoMesAtual;
      } else if (novaEtapa === 'Venda Ganha') {
        // Se o documento não existe e estamos adicionando a primeira venda
        novasMetas.vendidoNoMes = cliente.valorCredito;
      }

      if (Object.keys(novasMetas).length > 0) {
        await setDoc(docRefMetas, novasMetas, { merge: true });
      }
    }
  };

  const adicionarPlano = async (plano: Omit<PlanoEmbracon, 'id' | 'userId'>) => {
    if (!user) return;
    const novoPlano = {
      ...plano,
      userId: user.uid
    };
    const docRef = doc(collection(db, 'planos'));
    await setDoc(docRef, novoPlano);
  };

  const atualizarPlano = async (id: string, plano: Partial<PlanoEmbracon>) => {
    if (!user) return;

    const docRef = doc(db, 'planos', id);

    // Check permissions
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    if (userProfile?.accessLevel !== 'Diretor' && userProfile?.accessLevel !== 'Gerente' && data.userId !== user.uid) {
      return; // No permission
    }

    await updateDoc(docRef, plano);
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
    const novaSimulacao: Simulacao = {
      ...simulacao,
      id: Date.now().toString(),
      userId: user.uid,
    };
    const docRef = doc(collection(db, 'simulacoes'));
    await setDoc(docRef, novaSimulacao);
  };

  const obterClientesAtivos = () => {
    if (!userProfile) return [];
    if (userProfile.accessLevel === 'Diretor' || userProfile.accessLevel === 'Gerente') {
      return state.clientes.filter(c => c.etapa === 'Venda Ganha');
    }
    // @ts-ignore
    return state.clientes.filter(c => c.etapa === 'Venda Ganha' && c.userId === userProfile.uid);
  };

  const obterTaxaConversao = () => {
    const totalClientes = state.clientes.length;
    const vendas = state.clientes.filter(c => c.etapa === 'Venda Ganha').length;
    return totalClientes > 0 ? (vendas / totalClientes) * 100 : 0;
  };

  const obterLeads = () => {
    if (!userProfile) return [];
    if (userProfile.accessLevel === 'Diretor' || userProfile.accessLevel === 'Gerente') {
      return state.clientes.filter(c => c.etapa === 'Lead');
    }
    // @ts-ignore
    return state.clientes.filter(c => c.etapa === 'Lead' && c.userId === userProfile.uid);
  };

  const obterClientesPerdidos = () => {
    if (!userProfile) return [];
    if (userProfile.accessLevel === 'Diretor' || userProfile.accessLevel === 'Gerente') {
      return state.clientes.filter(c => c.etapa === 'Venda Perdida');
    }
    // @ts-ignore
    return state.clientes.filter(c => c.etapa === 'Venda Perdida' && c.userId === userProfile.uid);
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
      userProfiles
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
