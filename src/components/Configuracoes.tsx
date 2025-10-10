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
    // Agrupar por tipo + prazoMeses, ex: "Imóveis - 200 Meses"
    const tipo = plano.tipo || 'Outros';
    const prazo = plano.prazoMeses || 'Indefinido';
    const cat = `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} - ${prazo} Meses`;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(plano);
    return acc;
  }, {});

  // Ordenar os planos dentro de cada categoria por crédito decrescente
  Object.keys(planosPorCategoria).forEach(cat => {
    planosPorCategoria[cat].sort((a, b) => (b.credito || 0) - (a.credito || 0));
  });

  // Ordenar as categorias: imóveis primeiro, depois automóveis, e dentro de cada tipo por prazo decrescente
  const categoriasOrdenadas = Object.keys(planosPorCategoria).sort((a, b) => {
    const tipoA = a.split(' - ')[0].toLowerCase();
    const tipoB = b.split(' - ')[0].toLowerCase();
    if (tipoA !== tipoB) {
      // Imóveis antes de Automóvel
      if (tipoA === 'imóveis') return -1;
      if (tipoB === 'imóveis') return 1;
      return tipoA.localeCompare(tipoB);
    }
    // Mesmo tipo, ordenar por prazo decrescente
    const prazoA = parseInt(a.split(' - ')[1].split(' ')[0]);
    const prazoB = parseInt(b.split(' - ')[1].split(' ')[0]);
    return prazoB - prazoA;
  });

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Configurações</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure seus planos Embracon e metas pessoais</p>
      </div>

      {/* Metas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Metas Mensais</h3>
        </div>

        <form onSubmit={handleAtualizarMetas} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meta de Vendas Mensal (R$)
            </label>
            <input
              type="number"
              name="metaMensal"
              value={metaMensal}
              onChange={(e) => setMetaMensal(Number(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Planos Embracon</h3>
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
          {categoriasOrdenadas.map(categoria => (
            <div key={categoria}>
              <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3 border-b border-gray-300 dark:border-gray-600 pb-1">{categoria}</h4>
              <div className="space-y-4 mb-6">
                {planosPorCategoria[categoria].map(plano => (
                  <div key={plano.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium text-gray-900 dark:text-white">{plano.nome}</h5>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingPlano(plano)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          aria-label={`Editar plano ${plano.nome}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 transition-colors"
                          aria-label={`Excluir plano ${plano.nome}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Prazo:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{plano.prazoMeses} meses</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Crédito:</span>
                        <p className="font-medium text-gray-900 dark:text-white">R$ {formatNumber(plano.credito)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Tx Administrativa:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{formatNumber(plano.taxaAdmTotal)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Fundo Reserva:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{formatNumber(plano.fundoReserva)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Seguro:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{formatNumber(plano.seguro)}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Taxa Adesão:</span>
                        <p className="font-medium text-gray-900 dark:text-white">{formatNumber(plano.taxaAdesao)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {planos.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <h4 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Nenhum plano cadastrado</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Adicione os planos Embracon que você mais utiliza</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Plano */}
      {showNovoPlano && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Novo Plano Embracon</h3>
            <form onSubmit={handleNovoPlano} className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Plano</label>
                <input
                  id="nome"
                  type="text"
                  name="nome"
                  required
                  placeholder="Ex: Plano Mais por Menos - Auto"
                  title="Nome do Plano"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                <input
                  id="categoria"
                  type="text"
                  name="categoria"
                  required
                  placeholder="Digite a categoria (ex: Automóvel, Imóvel, Serviços)"
                  title="Categoria do Plano"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="prazo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo (meses)</label>
                <input
                  id="prazo"
                  type="number"
                  name="prazo"
                  required
                  placeholder="Ex: 60"
                  title="Prazo em meses"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="taxaAdministracao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taxa Adm. (%)</label>
                  <input
                    id="taxaAdministracao"
                    type="text"
                    name="taxaAdministracao"
                    required
                    placeholder="Ex: 0,25"
                    title="Taxa de Administração em percentual"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="fundoReserva" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">F. Reserva (%)</label>
                  <input
                    id="fundoReserva"
                    type="text"
                    name="fundoReserva"
                    required
                    placeholder="Ex: 0,15"
                    title="Fundo de Reserva em percentual"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="seguro" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seguro (%)</label>
                  <input
                  id="seguro"
                  type="text"
                  name="seguro"
                  required
                  placeholder="Ex: 0,10"
                  title="Seguro em percentual"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="taxaAdesao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taxa de Adesão (%)</label>
                  <input
                  id="taxaAdesao"
                  type="text"
                  name="taxaAdesao"
                  required
                  placeholder="Ex: 1,00"
                  title="Taxa de Adesão em percentual"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNovoPlano(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Editar Plano {editingPlano.nome}</h3>
            <form onSubmit={handleEditarPlano} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Plano</label>
                <input
                  type="text"
                  name="nome"
                  required
                  defaultValue={editingPlano.nome}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
          <select
            id="categoria-select"
            name="categoria"
            required
            defaultValue={editingPlano.categoria || ''}
            aria-label="Selecione uma categoria"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo (meses)</label>
                <input
                  type="number"
                  name="prazo"
                  required
                  defaultValue={editingPlano.prazo}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taxa Adm. (%)</label>
                  <input
                    type="text"
                    name="taxaAdministracao"
                    required
                    defaultValue={editingPlano.taxaAdministracao}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">F. Reserva (%)</label>
                  <input
                    type="text"
                    name="fundoReserva"
                    required
                    defaultValue={editingPlano.fundoReserva}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seguro (%)</label>
                <input
                  type="text"
                  name="seguro"
                  required
                  defaultValue={editingPlano.seguro}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taxa de Adesão (%)</label>
                <input
                  type="text"
                  name="taxaAdesao"
                  required
                  defaultValue={editingPlano.taxaAdesao}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPlano(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informações do Sistema</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Versão:</span>
            <p className="font-medium text-gray-900 dark:text-white">Zion CRM v1.0</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Último backup:</span>
            <p className="font-medium text-gray-900 dark:text-white">Automático (LocalStorage)</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Clientes cadastrados:</span>
            <p className="font-medium text-gray-900 dark:text-white">{planos.length} planos configurados</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Criado em:</span>
            <p className="font-medium text-gray-900 dark:text-white">{formatDateTimeBrasilia(new Date().toISOString())}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
