import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Shield, Users, Edit, Save, X, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, getFirestore } from 'firebase/firestore';

interface UserPermissions {
  canViewAllClients: boolean;
  canViewAllLeads: boolean;
  canViewAllSimulations: boolean;
  canViewAllReports: boolean;
  canManageUsers: boolean;
  canChangeSettings: boolean;
}

interface UserProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  accessLevel: 'Operador' | 'Gerente' | 'Diretor';
  permissions: UserPermissions;
  createdAt: Date;
  lastLogin?: Date;
  active: boolean;
  stats: {
    totalClients: number;
    totalLeads: number;
    totalSimulations: number;
    totalSales: number;
  };
}

interface PendingUser {
  id: string;
  uid: string;
  name: string;
  email: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export function ControleUsuarios() {
  const { userProfile, podeGerenciarUsuarios } = useApp();

  console.log('ControleUsuarios userProfile:', userProfile);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<UserPermissions | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const db = getFirestore();

  useEffect(() => {
    if (podeGerenciarUsuarios()) {
      loadUsers();
    }
  }, [userProfile]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);

      const usersData: UserProfile[] = [];
      const pendingUsersData: PendingUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'approved') {
      usersData.push({
        id: doc.id,
        uid: data.uid,
        name: data.name || '',
        email: data.email || '',
        accessLevel: data.accessLevel || 'Operador',
        permissions: data.permissions || {
          canViewAllClients: data.accessLevel === 'Diretor',
          canViewAllLeads: data.accessLevel === 'Diretor',
          canViewAllSimulations: data.accessLevel === 'Diretor',
          canViewAllReports: data.accessLevel === 'Diretor',
          canManageUsers: data.accessLevel === 'Diretor',
          canChangeSettings: data.accessLevel !== 'Operador',
        },
        createdAt: data.createdAt?.toDate() || new Date(),
        lastLogin: data.lastLogin?.toDate(),
        active: data.active !== false,
        stats: data.stats || {
          totalClients: 0,
          totalLeads: 0,
          totalSimulations: 0,
          totalSales: 0,
        },
      });
        } else if (data.status === 'pending') {
          pendingUsersData.push({
            id: doc.id,
            uid: data.uid,
            name: data.name || '',
            email: data.email || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            status: 'pending',
          });
        }
      });

      setUsers(usersData);
      setPendingUsers(pendingUsersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermissions = (userId: string, currentPermissions: UserPermissions, userAccessLevel: 'Operador' | 'Gerente' | 'Diretor') => {
    console.log('handleEditPermissions userProfile.accessLevel:', userProfile?.accessLevel, 'userAccessLevel:', userAccessLevel);
    // Permitir editar permissões somente se o usuário logado for Diretor
    if (userProfile?.accessLevel === 'Diretor') {
      setEditingUser(userId);
      setEditPermissions({ ...currentPermissions });
    } else {
      alert('Apenas usuários com nível Diretor podem alterar permissões.');
    }
  };

  const handleSavePermissions = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        permissions: editPermissions,
        updatedAt: new Date(),
      });

      // Atualizar estado local
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, permissions: editPermissions! }
          : user
      ));

      setEditingUser(null);
      setEditPermissions(null);
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      alert('Erro ao salvar permissões. Tente novamente.');
    }
  };

  const toggleUserAccess = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        active: !currentStatus,
        updatedAt: new Date(),
      });

      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, active: !currentStatus }
          : user
      ));
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      alert('Erro ao alterar status do usuário. Tente novamente.');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário. Tente novamente.');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditPermissions(null);
  };

  const handlePermissionChange = (permission: keyof UserPermissions, value: boolean) => {
    if (editPermissions) {
      setEditPermissions({
        ...editPermissions,
        [permission]: value,
      });
    }
  };


  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!podeGerenciarUsuarios()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar o controle de usuários.
          </p>
        </div>
      </div>
    );
  }

  // Funções para aprovar ou rejeitar usuários pendentes
  const handleApproveUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'approved',
        updatedAt: new Date(),
      });
      // Atualizar localmente para refletir a mudança
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      await loadUsers();
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      alert('Erro ao aprovar usuário. Tente novamente.');
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'rejected',
        updatedAt: new Date(),
      });
      // Atualizar localmente para refletir a mudança
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      await loadUsers();
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      alert('Erro ao rejeitar usuário. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span>Controle de Usuários</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie permissões e visualize estatísticas dos usuários
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Users className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
{filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.accessLevel === 'Diretor'
                        ? 'bg-purple-100 text-purple-800'
                        : user.accessLevel === 'Gerente'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.accessLevel}
                    </span>
                    {user.accessLevel === 'Diretor' && (
                      <Shield className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{user.email}</p>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{user.stats.totalClients}</div>
                      <div className="text-sm text-gray-600">Clientes</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{user.stats.totalLeads}</div>
                      <div className="text-sm text-gray-600">Leads</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{user.stats.totalSimulations}</div>
                      <div className="text-sm text-gray-600">Simulações</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{user.stats.totalSales}</div>
                      <div className="text-sm text-gray-600">Vendas</div>
                    </div>
                  </div>

                  {/* Permissões */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Permissões</span>
                    </h4>

{editingUser === user.id ? (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(editPermissions!).map(([key, value]) => (
                            <label key={key} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handlePermissionChange(key as keyof UserPermissions, e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">
                                {key === 'canViewAllClients' && 'Ver todos os clientes'}
                                {key === 'canViewAllLeads' && 'Ver todos os leads'}
                                {key === 'canViewAllSimulations' && 'Ver todas as simulações'}
                                {key === 'canViewAllReports' && 'Ver relatórios completos'}
                                {key === 'canManageUsers' && 'Gerenciar usuários'}
                                {key === 'canChangeSettings' && 'Alterar configurações'}
                              </span>
                            </label>
                          ))}
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => handleSavePermissions(user.id)}
                            className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            <span>Salvar</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center space-x-2 px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancelar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(user.permissions).map(([key, value]) => (
                          <span
                            key={key}
                            className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${
                              value
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {value ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>
                              {key === 'canViewAllClients' && 'Clientes'}
                              {key === 'canViewAllLeads' && 'Leads'}
                              {key === 'canViewAllSimulations' && 'Simulações'}
                              {key === 'canViewAllReports' && 'Relatórios'}
                              {key === 'canManageUsers' && 'Usuários'}
                              {key === 'canChangeSettings' && 'Configurações'}
                            </span>
                          </span>
                        ))}
                        <button
                          onClick={() => handleEditPermissions(user.id, user.permissions, user.accessLevel)}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => toggleUserAccess(user.id, user.active)}
                          className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${
                            user.active ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          } hover:bg-opacity-80 transition-colors`}
                        >
                          {user.active ? 'Desabilitar' : 'Habilitar'}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Tente ajustar os termos de busca'
              : 'Os usuários aparecerão aqui conforme se cadastrarem no sistema'
            }
          </p>
        </div>
      )}

      {/* Lista de usuários pendentes */}
      {pendingUsers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Usuários Pendentes</h2>
          <div className="grid gap-6">
            {pendingUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleApproveUser(user.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleRejectUser(user.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
