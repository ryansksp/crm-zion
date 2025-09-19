import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { Cliente, PlanoEmbracon, Meta, Simulacao, UserProfile } from '../types';
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
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
  adicionarPlano: (plano: Omit<PlanoEmbracon, 'id'>) => Promise<void>;
  atualizarMetas: (metas: Partial<Meta>) => Promise<void>;
  adicionarSimulacao: (simulacao: Omit<Simulacao, 'id'>) => Promise<void>;
  obterClientesAtivos: () => Cliente[];
  obterTaxaConversao: () => number;
  carregarUserProfile: () => Promise<void>;
  atualizarUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type Action = 
  | { type: 'SET_STATE'; payload: Omit<AppState, 'userProfile'> }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile | null }
  | { type: 'ADICIONAR_CLIENTE'; payload: Cliente }
  | { type: 'ATUALIZAR_CLIENTE'; payload: { id: string; cliente: Partial<Cliente> } }
  | { type: 'ADICIONAR_PLANO'; payload: PlanoEmbracon }
  | { type: 'ATUALIZAR_METAS'; payload: Partial<Meta> }
  | { type: 'ADICIONAR_SIMULACAO'; payload: Simulacao };

const initialState: Omit<AppState, 'userProfile'> = {
  clientes: [],
  planos: [],
  metas: { mensal: 0, vendidoNoMes: 0, comissaoEstimada: 0 },
  simulacoes: []
};

function appReducer(state: Omit<AppState, 'userProfile'>, action: Action): Omit<AppState, 'userProfile'> {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'ADICIONAR_CLIENTE':
      return { ...state, clientes: [...state.clientes, action.payload] };
    case 'ATUALIZAR_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.map(c => 
          c.id === action.payload.id ? { ...c, ...action.payload.cliente } : c
        )
      };
    case 'ADICIONAR_PLANO':
      return { ...state, planos: [...state.planos, action.payload] };
    case 'ATUALIZAR_METAS':
      return { ...state, metas: { ...state.metas, ...action.payload } };
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
      dispatch({ type: 'SET_STATE', payload: JSON.parse(savedData) });
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('cronos-pro-data', JSON.stringify(state));
  }, [state]);

  // Carregar perfil do usuário do Firestore
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
      // Criar perfil padrão se não existir
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

  // Carregar clientes do Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'clientes'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clientesFirestore: Cliente[] = [];
      querySnapshot.forEach((doc) => {
        clientesFirestore.push(doc.data() as Cliente);
      });
      dispatch({ type: 'SET_STATE', payload: { ...state, clientes: clientesFirestore, planos: state.planos, metas: state.metas, simulacoes: state.simulacoes } });
    });
    return () => unsubscribe();
  }, [user]);

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
    const q = query(collection(db, 'clientes'), where('id', '==', id), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, cliente);
    }
  };

  const moverClienteEtapa = async (id: string, novaEtapa: Cliente['etapa']) => {
    await atualizarCliente(id, { 
      etapa: novaEtapa, 
      dataUltimaInteracao: new Date().toISOString() 
    });
  };

  const adicionarPlano = async (plano: Omit<PlanoEmbracon, 'id'>) => {
    const novoPlano: PlanoEmbracon = {
      ...plano,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADICIONAR_PLANO', payload: novoPlano });
  };

  const atualizarMetas = async (metas: Partial<Meta>) => {
    dispatch({ type: 'ATUALIZAR_METAS', payload: metas });
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
      atualizarUserProfile
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
