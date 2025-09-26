import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatDateTimeBrasilia } from '../utils/date';
import { Settings, Plus, Trash2, Target, DollarSign, Edit } from 'lucide-react';
import { PlanoEmbracon } from '../types';

export function Configuracoes() {
  const { planos, metas, adicionarPlano, atualizarPlano, atualizarMetas } = useApp();
  const [showNovoPlano, setShowNovoPlano] = useState(false);
  const [editingPlano, setEditingPlano] = useState<PlanoEmbracon | null>(null);
  const [metaMensal, setMetaMensal] = useState(metas.mensal);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  const categorias = ['Automóvel', 'Imóvel', 'Serviços'];

  const planosPorCategoria = planos.reduce((acc: Record<string, PlanoEmbracon[]>, plano) => {
    const cat = plano.categoria || 'Outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(plano);
    return acc;
  }, {});

  useEffect(() => {
    setMetaMensal(metas.mensal);
  }, [metas]);

  const parseNumber = (value: FormDataEntryValue | null) => {
    if (!value || typeof value !== 'string') return 0;
    return Number(value.replace(',', '.'));
  };

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return '0';
    return value.toString().replace('.', ',');
  };

  const handleNovoPlano = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    adicionarPlano({
      nome: formData.get('nome') as string,
      categoria: formData.get('categoria') as string,
      prazo: Number(formData.get('prazo')),
      taxaAdministracao: parseNumber(formData.get('taxaAdministracao')),
      fundoReserva: parseNumber(formData.get('fundoReserva')),
      seguro: parseNumber(formData.get('seguro')),
      taxaAdesao: parseNumber(formData.get('taxaAdesao'))
    });

    setShowNovoPlano(false);
  };

  const handleEditarPlano = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlano) return;

    const formData = new FormData(e.target as HTMLFormElement);

    await atualizarPlano(editingPlano.id, {
      nome: formData.get('nome') as string,
      categoria: formData.get('categoria') as string,
      prazo: Number(formData.get('prazo')),
      taxaAdministracao: parseNumber(formData.get('taxaAdministracao')),
      fundoReserva: parseNumber(formData.get('fundoReserva')),
      seguro: parseNumber(formData.get('seguro')),
      taxaAdesao: parseNumber(formData.get('taxaAdesao'))
    });

    setEditingPlano(null);
  };

  const handleAtualizarMetas = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      await atualizarMetas({
        mensal: metaMensal
      });
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (error) {
      setErro('Erro ao salvar metas. Tente novamente.');
      console.error('Erro ao atualizar metas:', error);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurações</h2>
        <p className="text-gray-600">Configure seus planos Embracon e metas pessoais</p>
      </div>

      {/* Metas */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Metas Mensais</h3>
        </div>

        <form onSubmit={handleAtualizarMetas} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta de Vendas Mensal (R$)
            </label>
            <input
              type="number"
              name="metaMensal"
              value={metaMensal}
              onChange={(e) => setMetaMensal(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ex: 100000"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={salvando}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {salvando ? 'Salvando...' : 'Atualizar Metas'}
            </button>
            {sucesso && (
              <p className="text-green-600 text-sm mt-2">Metas atualizadas com sucesso!</p>
            )}
            {erro && (
              <p className="text-red-600 text-sm mt-2">{erro}</p>
            )}
          </div>
        </form>
      </div>

      {/* Planos Embracon */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Planos Embracon</h3>
          </div>
          <button
            onClick={() => setShowNovoPlano(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Plano</span>
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(planosPorCategoria).map(([categoria, planosCategoria]) => (
            <div key={categoria}>
              <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-1">{categoria}</h4>
              <div className="space-y-4 mb-6">
                {planosCategoria.map(plano => (
                  <div key={plano.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium text-gray-900">{plano.nome}</h5>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setEditingPlano(plano)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Prazo:</span>
                        <p className="font-medium">{plano.prazo} meses</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Taxa Admin:</span>
                        <p className="font-medium">{formatNumber(plano.taxaAdministracao)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Fundo Reserva:</span>
                        <p className="font-medium">{formatNumber(plano.fundoReserva)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Seguro:</span>
                        <p className="font-medium">{formatNumber(plano.seguro)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Taxa Adesão:</span>
                        <p className="font-medium">{formatNumber(plano.taxaAdesao)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {planos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-medium mb-2">Nenhum plano cadastrado</h4>
              <p className="text-sm">Adicione os planos Embracon que você mais utiliza</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Plano */}
      {showNovoPlano && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Novo Plano Embracon</h3>
            <form onSubmit={handleNovoPlano} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Plano</label>
                <input
                  type="text"
                  name="nome"
                  required
                  placeholder="Ex: Plano Mais por Menos - Auto"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  name="categoria"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo (meses)</label>
                <input
                  type="number"
                  name="prazo"
                  required
                  placeholder="Ex: 60"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taxa Adm. (%)</label>
                  <input
                    type="text"
                    name="taxaAdministracao"
                    required
                    placeholder="Ex: 0,25"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">F. Reserva (%)</label>
                  <input
                    type="text"
                    name="fundoReserva"
                    required
                    placeholder="Ex: 0,15"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seguro (%)</label>
                <input
                  type="text"
                  name="seguro"
                  required
                  placeholder="Ex: 0,10"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taxa de Adesão (%)</label>
                <input
                  type="text"
                  name="taxaAdesao"
                  required
                  placeholder="Ex: 1,00"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNovoPlano(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Adicionar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Plano */}
      {editingPlano && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Editar Plano {editingPlano.nome}</h3>
            <form onSubmit={handleEditarPlano} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Plano</label>
                <input
                  type="text"
                  name="nome"
                  required
                  defaultValue={editingPlano.nome}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  name="categoria"
                  required
                  defaultValue={editingPlano.categoria || ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo (meses)</label>
                <input
                  type="number"
                  name="prazo"
                  required
                  defaultValue={editingPlano.prazo}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taxa Adm. (%)</label>
                  <input
                    type="text"
                    name="taxaAdministracao"
                    required
                    defaultValue={editingPlano.taxaAdministracao}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">F. Reserva (%)</label>
                  <input
                    type="text"
                    name="fundoReserva"
                    required
                    defaultValue={editingPlano.fundoReserva}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seguro (%)</label>
                <input
                  type="text"
                  name="seguro"
                  required
                  defaultValue={editingPlano.seguro}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taxa de Adesão (%)</label>
                <input
                  type="text"
                  name="taxaAdesao"
                  required
                  defaultValue={editingPlano.taxaAdesao}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPlano(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Atualizar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Informações da Conta */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Informações do Sistema</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Versão:</span>
            <p className="font-medium">Zion CRM v1.0</p>
          </div>
          <div>
            <span className="text-gray-600">Último backup:</span>
            <p className="font-medium">Automático (LocalStorage)</p>
          </div>
          <div>
            <span className="text-gray-600">Clientes cadastrados:</span>
            <p className="font-medium">{planos.length} planos configurados</p>
          </div>
          <div>
            <span className="text-gray-600">Criado em:</span>
            <p className="font-medium">{formatDateTimeBrasilia(new Date().toISOString())}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
