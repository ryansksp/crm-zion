import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Shield, AlertTriangle } from 'lucide-react';
import { formatPhone } from '../utils/formatters';

export function Profile() {
  const { userProfile, atualizarUserProfile, podeAlterarPermissao } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    accessLevel: 'Operador' | 'Gerente' | 'Diretor';
  }>({
    name: '',
    phone: '',
    accessLevel: 'Operador',
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        accessLevel: userProfile.accessLevel || 'Operador',
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'phone' ? formatPhone(e.target.value) : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSave = async () => {
    if (!userProfile) return;
    // Verificar se a mudança de accessLevel é permitida
    if (formData.accessLevel !== userProfile.accessLevel && !podeAlterarPermissao(formData.accessLevel)) {
      setError('Você não tem permissão para alterar para este nível de acesso.');
      return;
    }
    await atualizarUserProfile(formData);
    setEditMode(false);
  };

  if (!userProfile) {
    return <p>Carregando perfil...</p>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Perfil do Usuário</h2>
      <div className="flex items-center space-x-4 mb-4">
        {userProfile.photoURL ? (
          <img src={userProfile.photoURL} alt="Foto do usuário" className="w-16 h-16 rounded-full" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400">
            Sem Foto
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{userProfile.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300">Nome</label>
          {editMode ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{userProfile.name}</p>
          )}
        </div>

        <div>
          <label className="block font-medium text-gray-700 dark:text-gray-300">Telefone</label>
          {editMode ? (
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{userProfile.phone || '-'}</p>
          )}
        </div>

        <div>
          <label className="block font-medium flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <span>Nível de Acesso</span>
            {userProfile.accessLevel === 'Diretor' && (
              <Shield className="w-4 h-4 text-blue-600" />
            )}
          </label>
          {editMode && (userProfile.permissions?.canEditProfile || userProfile.accessLevel === 'Diretor') ? (
            <div className="space-y-2">
              <select
                name="accessLevel"
                value={formData.accessLevel}
                onChange={(e) => {
                  const novoNivel = e.target.value as 'Operador' | 'Gerente' | 'Diretor';
                  if (podeAlterarPermissao(novoNivel)) {
                    setError('');
                    handleChange(e);
                  } else {
                    setError('Você não tem permissão para alterar para este nível de acesso.');
                  }
                }}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
              >
                <option value="Operador">Operador</option>
                <option value="Gerente">Gerente</option>
                <option value="Diretor">Diretor</option>
              </select>
              {error && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <p className="text-gray-900 dark:text-white">{userProfile.accessLevel}</p>
              {userProfile.accessLevel === 'Diretor' && (
                <Shield className="w-4 h-4 text-blue-600" />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex space-x-4">
        {editMode ? (
          <>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Salvar
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white"
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Editar Perfil
          </button>
        )}
      </div>
    </div>
  );
}
