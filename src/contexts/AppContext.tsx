import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Cliente, PlanoEmbracon, Meta, Simulacao } from '../types';

interface AppState {
  clientes: Cliente[];
  planos: PlanoEmbracon[];
  metas: Meta;
  simulacoes: Simulacao[];
}

interface AppContextType extends AppState {
  adicionarCliente: (cliente: Omit<Cliente, 'id'>) => void;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => void;
  moverClienteEtapa: (id: string, novaEtapa: Cliente['etapa']) => void;
  adicionarPlano: (plano: Omit<PlanoEmbracon, 'id'>) => void;
  atualizarMetas: (metas: Partial<Meta>) => void;
  adicionarSimulacao: (simulacao: Omit<Simulacao, 'id'>) => void;
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

  const adicionarCliente = (cliente: Omit<Cliente, 'id'>) => {
    const novoCliente: Cliente = {
      ...cliente,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADICIONAR_CLIENTE', payload: novoCliente });
  };

  const atualizarCliente = (id: string, cliente: Partial<Cliente>) => {
    dispatch({ type: 'ATUALIZAR_CLIENTE', payload: { id, cliente } });
  };

  const moverClienteEtapa = (id: string, novaEtapa: Cliente['etapa']) => {
    atualizarCliente(id, { 
      etapa: novaEtapa, 
      dataUltimaInteracao: new Date().toISOString() 
    });
  };

  const adicionarPlano = (plano: Omit<PlanoEmbracon, 'id'>) => {
    const novoPlano: PlanoEmbracon = {
      ...plano,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADICIONAR_PLANO', payload: novoPlano });
  };

  const atualizarMetas = (metas: Partial<Meta>) => {
    dispatch({ type: 'ATUALIZAR_METAS', payload: metas });
  };

  const adicionarSimulacao = (simulacao: Omit<Simulacao, 'id'>) => {
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