import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

export function Profile() {
  const { userProfile, atualizarUserProfile } = useApp();
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
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    await atualizarUserProfile(formData);
    setEditMode(false);
  };

  if (!userProfile) {
    return <p>Carregando perfil...</p>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Perfil do Usuário</h2>
      <div className="flex items-center space-x-4 mb-4">
        {userProfile.photoURL ? (
          <img src={userProfile.photoURL} alt="Foto do usuário" className="w-16 h-16 rounded-full" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
            Sem Foto
          </div>
        )}
        <div>
          <p className="font-semibold">{userProfile.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">Nome</label>
          {editMode ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p>{userProfile.name}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Telefone</label>
          {editMode ? (
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p>{userProfile.phone || '-'}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Nível de Acesso</label>
          {editMode ? (
            <select
              name="accessLevel"
              value={formData.accessLevel}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="Operador">Operador</option>
              <option value="Gerente">Gerente</option>
              <option value="Diretor">Diretor</option>
            </select>
          ) : (
            <p>{userProfile.accessLevel}</p>
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
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
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
