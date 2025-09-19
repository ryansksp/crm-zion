import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Cliente, PlanoEmbracon, Meta, Simulacao } from '../types';
import { db } from '../firebaseConfig';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  addDoc,
  deleteDoc
} from 'firebase/firestore';

interface AppState {
  clientes: Cliente[];
  planos: PlanoEmbracon[];
  metas: Meta;
  simulacoes: Simulacao[];
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type Action = 
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'ADICIONAR_CLIENTE'; payload: Cliente }
  | { type: 'ATUALIZAR_CLIENTE'; payload: { id: string; cliente: Partial<Cliente> } }
  | { type: 'ADICIONAR_PLANO'; payload: PlanoEmbracon }
  | { type: 'ATUALIZAR_METAS'; payload: Partial<Meta> }
  | { type: 'ADICIONAR_SIMULACAO'; payload: Simulacao };

const initialState: AppState = {
  clientes: [],
  planos: [],
  metas: { mensal: 0, vendidoNoMes: 0, comissaoEstimada: 0 },
  simulacoes: []
};

function appReducer(state: AppState, action: Action): AppState {
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

  // Sincronizar dados com Firestore
  useEffect(() => {
    const unsubscribeClientes = onSnapshot(collection(db, 'clientes'), snapshot => {
      const clientesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Cliente[];
      dispatch({ type: 'SET_STATE', payload: { ...state, clientes: clientesData } });
    });

    const unsubscribePlanos = onSnapshot(collection(db, 'planos'), snapshot => {
      const planosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PlanoEmbracon[];
      dispatch({ type: 'SET_STATE', payload: { ...state, planos: planosData } });
    });

    const unsubscribeMetas = onSnapshot(doc(db, 'metas', 'meta'), docSnap => {
      if (docSnap.exists()) {
        const metasData = docSnap.data() as Meta;
        dispatch({ type: 'SET_STATE', payload: { ...state, metas: metasData } });
      }
    });

    const unsubscribeSimulacoes = onSnapshot(collection(db, 'simulacoes'), snapshot => {
      const simulacoesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Simulacao[];
      dispatch({ type: 'SET_STATE', payload: { ...state, simulacoes: simulacoesData } });
    });

    return () => {
      unsubscribeClientes();
      unsubscribePlanos();
      unsubscribeMetas();
      unsubscribeSimulacoes();
    };
  }, []);

  const adicionarCliente = async (cliente: Omit<Cliente, 'id'>) => {
    await addDoc(collection(db, 'clientes'), cliente);
  };

  const atualizarCliente = async (id: string, cliente: Partial<Cliente>) => {
    const clienteRef = doc(db, 'clientes', id);
    await updateDoc(clienteRef, cliente);
  };

  const moverClienteEtapa = async (id: string, novaEtapa: Cliente['etapa']) => {
    const updates: Partial<Cliente> = {
      etapa: novaEtapa,
      dataUltimaInteracao: new Date().toISOString()
    };

    if (novaEtapa === 'Venda Perdida') {
      updates.dataPerda = new Date().toISOString();
    }

    await atualizarCliente(id, updates);
  };

  const adicionarPlano = async (plano: Omit<PlanoEmbracon, 'id'>) => {
    await addDoc(collection(db, 'planos'), plano);
  };

  const atualizarMetas = async (metas: Partial<Meta>) => {
    const metasRef = doc(db, 'metas', 'meta');
    await updateDoc(metasRef, metas);
  };

  const adicionarSimulacao = async (simulacao: Omit<Simulacao, 'id'>) => {
    await addDoc(collection(db, 'simulacoes'), simulacao);
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
      adicionarCliente,
      atualizarCliente,
      moverClienteEtapa,
      adicionarPlano,
      atualizarMetas,
      adicionarSimulacao,
      obterClientesAtivos,
      obterTaxaConversao
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
