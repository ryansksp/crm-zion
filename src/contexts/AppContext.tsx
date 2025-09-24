import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
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
  atualizarMetas: (metas: Partial<Meta>) => Promise<void>;
  adicionarSimulacao: (simulacao: Omit<Simulacao, 'id'>) => Promise<void>;
  obterClientesAtivos: () => Cliente[];
  obterTaxaConversao: () => number;
  carregarUserProfile: () => Promise<void>;
  atualizarUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  podeAlterarPermissao: (novoNivel: 'Operador' | 'Gerente' | 'Diretor') => boolean;
  podeGerenciarUsuarios: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type Action =
  | { type: 'SET_CLIENTES'; payload: Cliente[] }
  | { type: 'SET_PLANOS'; payload: PlanoEmbracon[] }
  | { type: 'SET_METAS'; payload: Meta }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile | null }
  | { type: 'ADICIONAR_SIMULACAO'; payload: Simulacao };

const initialState: Omit<AppState, 'userProfile'> = {
  clientes: [],
  planos: [],
  metas: { mensal: 0, vendidoNoMes: 0, comissaoEstimada: 0 },
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

  // Carregar dados do localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('cronos-pro-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.clientes && parsed.planos && parsed.metas) {
          dispatch({ type: 'SET_CLIENTES', payload: parsed.clientes });
          dispatch({ type: 'SET_PLANOS', payload: parsed.planos });
          dispatch({ type: 'SET_METAS', payload: parsed.metas });
        }
      } catch (err) {
        console.error("Erro ao carregar localStorage:", err);
      }
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('cronos-pro-data', JSON.stringify(state));
  }, [state]);

  // Carregar perfil do usuário
  const carregarUserProfile = async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfile(docSnap.data() as UserProfile);
    } else {
      const defaultProfile: UserProfile = {
        id: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        phone: '',
        accessLevel: 'Operador'
      };
      await setDoc(docRef, defaultProfile);
      setUserProfile(defaultProfile);
    }
  };

  useEffect(() => {
    carregarUserProfile();
  }, [user]);

  // Carregar dados do Firestore em tempo real
  useEffect(() => {
    if (!user) return;

    // Clientes - Diretores veem todos, outros veem apenas os seus
    let qClientes;
    if (userProfile?.accessLevel === 'Diretor') {
      qClientes = query(collection(db, 'clientes'));
    } else {
      qClientes = query(collection(db, 'clientes'), where('userId', '==', user.uid));
    }

    const unsubscribeClientes = onSnapshot(qClientes, (querySnapshot) => {
      const clientesFirestore: Cliente[] = [];
      querySnapshot.forEach((docSnap) => {
        clientesFirestore.push({ id: docSnap.id, ...docSnap.data() } as Cliente);
      });
      dispatch({ type: 'SET_CLIENTES', payload: clientesFirestore });
    });

    // Planos - Diretores veem todos, outros veem apenas os seus
    let qPlanos;
    if (userProfile?.accessLevel === 'Diretor') {
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

    // Metas - Diretores veem todas, outros veem apenas as suas
    let docRefMetas;
    if (userProfile?.accessLevel === 'Diretor') {
      // Para diretores, vamos carregar metas de todos os usuários
      // Por enquanto, vamos manter as metas individuais por usuário
      docRefMetas = doc(db, 'metas', user.uid);
    } else {
      docRefMetas = doc(db, 'metas', user.uid);
    }

    const unsubscribeMetas = onSnapshot(docRefMetas, (docSnap) => {
      if (docSnap.exists()) {
        dispatch({ type: 'SET_METAS', payload: docSnap.data() as Meta });
      }
    });

    return () => {
      unsubscribeClientes();
      unsubscribePlanos();
      unsubscribeMetas();
    };
  }, [user, userProfile]);

  const atualizarUserProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
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
    const novoPlano: PlanoEmbracon = {
      ...plano,
      id: Date.now().toString(),
      userId: user.uid
    };
    const docRef = doc(collection(db, 'planos'));
    await setDoc(docRef, novoPlano);
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
    const novaSimulacao: Simulacao = {
      ...simulacao,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADICIONAR_SIMULACAO', payload: novaSimulacao });
  };

  const obterClientesAtivos = () => {
    return state.clientes.filter(c => c.etapa === 'Venda Ganha');
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
    return userProfile?.accessLevel === 'Diretor';
  };

  return (
    <AppContext.Provider value={{
      ...state,
      userProfile,
      adicionarCliente,
      atualizarCliente,
      moverClienteEtapa,
      adicionarPlano,
      atualizarMetas,
      adicionarSimulacao,
      obterClientesAtivos,
      obterTaxaConversao,
      carregarUserProfile,
      atualizarUserProfile,
      podeAlterarPermissao,
      podeGerenciarUsuarios
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
