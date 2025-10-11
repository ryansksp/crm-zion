import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Cliente } from '../types';
import { UserPlus, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatPhone } from '../utils/formatters';

interface CadastroLeadsProps {
  onClose?: () => void;
}

export function CadastroLeads({ onClose }: CadastroLeadsProps) {
  const { adicionarCliente, userProfiles, userProfile, planos } = useApp();
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    planoInteresse: '',
    valorCredito: '',
    userId: ''
  });
  const [loading, setLoading] = useState(false);

  // Organizar planos por tipo, agrupando por nome e prazo, mostrando faixa de crédito
  const planosOrganizados = planos.reduce((acc: Record<string, Record<string, { min: number; max: number; planos: typeof planos }>>, plano) => {
    const tipo = plano.tipo || 'Outros';
    if (!acc[tipo]) acc[tipo] = {};

    const prazo = plano.prazoMeses || plano.prazo || 0;
    const key = `${plano.nome}-${prazo}`;
    if (!acc[tipo][key]) {
      acc[tipo][key] = { min: plano.credito || 0, max: plano.credito || 0, planos: [] };
    }
    acc[tipo][key].min = Math.min(acc[tipo][key].min, plano.credito || 0);
    acc[tipo][key].max = Math.max(acc[tipo][key].max, plano.credito || 0);
    acc[tipo][key].planos.push(plano);
    return acc;
  }, {});

  // Ordenar tipos e dentro de cada tipo ordenar por prazo
  const tiposOrdenados = Object.keys(planosOrganizados).sort();
  const planosPorCategoria = tiposOrdenados.reduce((acc: Record<string, { nome: string; label: string; value: string }[]>, tipo) => {
    acc[tipo] = Object.entries(planosOrganizados[tipo])
      .sort(([, a], [, b]) => {
        const prazoA = a.planos[0]?.prazoMeses || a.planos[0]?.prazo || 0;
        const prazoB = b.planos[0]?.prazoMeses || b.planos[0]?.prazo || 0;
        return prazoA - prazoB;
      })
      .map(([, data]) => ({
        nome: data.planos[0].nome,
        label: data.min === data.max
          ? `${data.planos[0].nome} (R$ ${data.min.toLocaleString('pt-BR')})`
          : `${data.planos[0].nome} (R$ ${data.min.toLocaleString('pt-BR')} - R$ ${data.max.toLocaleString('pt-BR')})`,
        value: data.planos[0].nome
      }));
    return acc;
  }, {});

  // Get users: Directors can assign to anyone, others only to Operador or Gerente
  const colaboradores = Object.values(userProfiles).filter(user =>
    userProfile?.accessLevel === 'Diretor' ||
    user.accessLevel === 'Operador' || user.accessLevel === 'Gerente'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.telefone || !formData.email || !formData.userId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const novoCliente: Omit<Cliente, 'id'> = {
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        planoInteresse: formData.planoInteresse,
        valorCredito: formData.valorCredito ? parseFloat(formData.valorCredito) : undefined,
        etapa: 'Novo Cliente',
        userId: formData.userId,
        dataCriacao: new Date().toISOString(),
        dataUltimaInteracao: new Date().toISOString(),
        historico: [{
          id: `cadastro-${Date.now()}`,
          tipo: 'Cadastro',
          descricao: 'Lead cadastrado manualmente',
          data: new Date().toISOString()
        }],
        simulacoes: []
      };

      await adicionarCliente(novoCliente);

      // Reset form
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        planoInteresse: '',
        valorCredito: '',
        userId: ''
      });

      alert('Lead cadastrado com sucesso!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Erro ao cadastrar lead:', error);
      alert('Erro ao cadastrar lead. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Cadastro de Leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', formatPhone(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Plano de Interesse
              </label>
              <select
                value={formData.planoInteresse}
                onChange={(e) => handleInputChange('planoInteresse', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Selecione um plano</option>
                {Object.entries(planosPorCategoria).map(([categoria, planosCategoria]) => (
                  <optgroup key={categoria} label={categoria}>
                    {planosCategoria.map((plano) => (
                      <option key={plano.value} value={plano.value}>
                        {plano.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor do Crédito (R$)
              </label>
              <input
                type="number"
                value={formData.valorCredito}
                onChange={(e) => handleInputChange('valorCredito', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="50000"
                min="0"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Atribuir para Colaborador *
              </label>
              <select
                value={formData.userId}
                onChange={(e) => handleInputChange('userId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Selecione um colaborador</option>
                {colaboradores.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.accessLevel})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Cadastrar Lead'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
