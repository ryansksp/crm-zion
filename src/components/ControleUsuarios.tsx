import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { Shield, Users, Edit, Save, X, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import { formatPhone } from '../utils/formatters';

interface UserPermissions {
  canViewDashboard: boolean;
  canViewFunil: boolean;
  canViewLeads: boolean;
  canViewSimulador: boolean;
  canViewClientesAtivos: boolean;
  canViewClientesPerdidos: boolean;
  canViewPagamentos: boolean;
  canViewDesempenho: boolean;
  canViewAllClients: boolean;
  canViewAllLeads: boolean;
  canViewAllSimulations: boolean;
  canViewAllReports: boolean;
  canManageUsers: boolean;
  canChangeSettings: boolean;
  canEditProfile: boolean;
}

interface UserProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
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
    totalSoldValue: number;
    totalLost: number;
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
  const { userProfile, podeGerenciarUsuarios, metasPorUsuario, atualizarMetaUsuario } = useApp();

  console.log('ControleUsuarios userProfile:', userProfile);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAccessLevel, setEditAccessLevel] = useState<'Operador' | 'Gerente' | 'Diretor'>('Operador');
  const [editPermissions, setEditPermissions] = useState<UserPermissions | null>(null);
  const [editMeta, setEditMeta] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleEmails, setVisibleEmails] = useState<Set<string>>(new Set());

  const maskEmail = (email: string) => email.replace(/./g, '•');

  const toggleEmailVisibility = (userId: string) => {
    setVisibleEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const db = getFirestore();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);

      const usersData: UserProfile[] = [];
      const pendingUsersData: PendingUser[] = [];
      const rejectedUsersData: PendingUser[] = [];
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const userId = docSnap.id; // Use document ID as UID
        if (data.status === 'approved') {
          // Calcular estatísticas reais do usuário
          console.log(`Processando usuário: ${data.name || 'Unknown'} (UID: ${userId})`);

          const clientsQuery = collection(db, 'clientes');
          const clientsSnapshot = await getDocs(clientsQuery);
          let totalClients = 0;
          let totalLeads = 0;
          let totalSales = 0;
          let totalSoldValue = 0;
          let totalLost = 0;
          const clientIds: string[] = [];
          let matchingClients = 0;
          clientsSnapshot.forEach((clientDoc) => {
            const client = clientDoc.data();
            console.log(`Cliente ID: ${clientDoc.id}, userId: "${client.userId}", etapa: "${client.etapa}", comparando com userId: "${userId}"`);
            if (client.userId === userId) {
              matchingClients++;
              totalClients++;
              clientIds.push(client.id);
              if (client.etapa === 'Lead') totalLeads++;
              if (client.etapa === 'Venda Ganha') {
                totalSales++;
                totalSoldValue += Number(client.valorCredito || 0);
              }
              if (client.etapa === 'Venda Perdida') totalLost++;
              console.log(`Match encontrado! Total clients: ${totalClients}, Leads: ${totalLeads}, Sales: ${totalSales}`);
            }
          });
          console.log(`Total matching clients para ${data.name}: ${matchingClients}, Final stats: clients=${totalClients}, leads=${totalLeads}, sales=${totalSales}, soldValue=${totalSoldValue}, lost=${totalLost}`);

          const simulationsQuery = collection(db, 'simulacoes');
          const simulationsSnapshot = await getDocs(simulationsQuery);
          let totalSimulations = 0;
          simulationsSnapshot.forEach((simDoc) => {
            const sim = simDoc.data();
            if (clientIds.includes(sim.clienteId)) totalSimulations++;
          });
          console.log(`Total simulations para ${data.name}: ${totalSimulations}`);

          usersData.push({
            id: docSnap.id,
            uid: userId,
            name: data.name || '',
            email: data.email || '',
            accessLevel: data.accessLevel || 'Operador',
            permissions: data.permissions,
            createdAt: data.createdAt?.toDate() || new Date(),
            lastLogin: data.lastLogin?.toDate(),
            active: data.active !== false,
            stats: {
              totalClients,
              totalLeads,
              totalSimulations,
              totalSales,
              totalSoldValue,
              totalLost,
            },
          });
        } else if (data.status === 'pending') {
          pendingUsersData.push({
            id: docSnap.id,
            uid: userId,
            name: data.name || '',
            email: data.email || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            status: 'pending',
          });
        } else if (data.status === 'rejected') {
          rejectedUsersData.push({
            id: docSnap.id,
            uid: userId,
            name: data.name || '',
            email: data.email || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            status: 'rejected',
          });
        }
      }

      setUsers(usersData);
      setPendingUsers(pendingUsersData);
      setRejectedUsers(rejectedUsersData);
      console.log('Usuários carregados:', usersData.map(u => ({ name: u.name, stats: u.stats })));
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (podeGerenciarUsuarios()) {
      loadUsers();
    }
  }, [loadUsers, podeGerenciarUsuarios]);

  const handleEditUser = (user: UserProfile) => {
    console.log('handleEditUser userProfile.accessLevel:', userProfile?.accessLevel);
    // Permitir editar usuário somente se o usuário logado for Diretor
    if (userProfile?.accessLevel === 'Diretor') {
      setEditingUser(user.id);
      setEditName(user.name);
      setEditPhone(user.phone || '');
      setEditAccessLevel(user.accessLevel);
      setEditMeta(metasPorUsuario[user.id]?.mensal?.toString() || '');
      const defaultPermissions = {
        canViewDashboard: false,
        canViewFunil: false,
        canViewLeads: false,
        canViewSimulador: false,
        canViewClientesAtivos: false,
        canViewClientesPerdidos: false,
        canViewPagamentos: false,
        canViewDesempenho: false,
        canViewAllClients: false,
        canViewAllLeads: false,
        canViewAllSimulations: false,
        canViewAllReports: false,
        canManageUsers: false,
        canChangeSettings: false,
        canEditProfile: false,
      };
      setEditPermissions(user.permissions ? { ...user.permissions } : defaultPermissions);
    } else {
      alert('Apenas usuários com nível Diretor podem editar usuários.');
    }
  };

  const handleSaveUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        name: editName,
        phone: editPhone,
        accessLevel: editAccessLevel,
        permissions: editPermissions,
        updatedAt: new Date(),
      });

      // Atualizar meta
      await atualizarMetaUsuario(userId, { mensal: editMeta ? Number(editMeta) : 0 });

      // Atualizar estado local
      setUsers(users.map(user =>
        user.id === userId
          ? {
              ...user,
              name: editName,
              phone: editPhone,
              accessLevel: editAccessLevel,
              permissions: editPermissions!
            }
          : user
      ));

      setEditingUser(null);
      setEditName('');
      setEditPhone('');
      setEditAccessLevel('Operador');
      setEditPermissions(null);
      setEditMeta('');
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário. Tente novamente.');
    }
  };

  const toggleUserAccess = async (userId: string, currentStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      // Toggle status between 'approved' and 'pending'
      const newStatus = currentStatus ? 'pending' : 'approved';
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Update local state accordingly
      if (newStatus === 'approved') {
        // Reload users to reflect status change
        await loadUsers();
      } else {
        // Remove user from approved users list and add to pendingUsers
        setUsers(users.filter(user => user.id !== userId));
        // Optionally, reload pending users
        await loadUsers();
      }
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
    setEditName('');
    setEditPhone('');
    setEditAccessLevel('Operador');
    setEditPermissions(null);
    setEditMeta(0);
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
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

  const handleReactivateUser = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'pending',
        updatedAt: new Date(),
      });
      // Atualizar localmente para refletir a mudança
      setRejectedUsers(rejectedUsers.filter(user => user.id !== userId));
      await loadUsers();
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      alert('Erro ao reativar usuário. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span>Controle de Usuários</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
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
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <Users className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 font-semibold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.accessLevel === 'Diretor'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                        : user.accessLevel === 'Gerente'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {user.accessLevel}
                    </span>
                    {user.accessLevel === 'Diretor' && (
                      <Shield className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <p className="text-gray-600 dark:text-gray-400">
                      {visibleEmails.has(user.id) ? user.email : maskEmail(user.email)}
                    </p>
                    <button
                      onClick={() => toggleEmailVisibility(user.id)}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      {visibleEmails.has(user.id) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{user.stats.totalClients}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Clientes</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{user.stats.totalLeads}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Leads</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{user.stats.totalSimulations}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Simulações</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{user.stats.totalSales}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Vendas</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">R$ {user.stats.totalSoldValue.toLocaleString('pt-BR')}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Vendido</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{user.stats.totalLost}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Perdidos</div>
                    </div>
                  </div>

                  {/* Permissões */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Permissões</span>
                    </h4>

                    {editingUser === user.id ? (
                      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                            <input
                              type="text"
                              value={editPhone}
                              onChange={(e) => setEditPhone(formatPhone(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nível de Acesso</label>
                            <select
                              value={editAccessLevel}
                              onChange={(e) => setEditAccessLevel(e.target.value as 'Operador' | 'Gerente' | 'Diretor')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            >
                              <option value="Operador">Operador</option>
                              <option value="Gerente">Gerente</option>
                              <option value="Diretor">Diretor</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Mensal (R$)</label>
                            <input
                              type="text"
                              value={editMeta}
                              onChange={(e) => setEditMeta(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissões</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(editPermissions!).map(([key, value]) => (
                              <label key={key} className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={value}
                                  onChange={(e) => handlePermissionChange(key as keyof UserPermissions, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {key === 'canViewDashboard' && 'Ver Dashboard'}
                                  {key === 'canViewFunil' && 'Ver Funil de Vendas'}
                                  {key === 'canViewLeads' && 'Ver Leads'}
                                  {key === 'canViewSimulador' && 'Ver Simulador'}
                                  {key === 'canViewClientesAtivos' && 'Ver Clientes Ativos'}
                                  {key === 'canViewClientesPerdidos' && 'Ver Clientes Perdidos'}
                                  {key === 'canViewPagamentos' && 'Ver Pagamentos'}
                                  {key === 'canViewDesempenho' && 'Ver Desempenho'}
                                  {key === 'canViewAllClients' && 'Ver todos os clientes'}
                                  {key === 'canViewAllLeads' && 'Ver todos os leads'}
                                  {key === 'canViewAllSimulations' && 'Ver todas as simulações'}
                                  {key === 'canViewAllReports' && 'Ver relatórios completos'}
                                  {key === 'canManageUsers' && 'Gerenciar usuários'}
                                  {key === 'canChangeSettings' && 'Alterar configurações'}
                                  {key === 'canEditProfile' && 'Editar perfil'}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => handleSaveUser(user.id)}
                            className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            <span>Salvar</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center space-x-2 px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors dark:bg-gray-600 dark:text-gray-300"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancelar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.permissions && Object.entries(user.permissions).map(([key, value]) => (
                          <span
                            key={key}
                            className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${
                              value
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {value ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>
                              {key === 'canViewDashboard' && 'Dashboard'}
                              {key === 'canViewFunil' && 'Funil'}
                              {key === 'canViewLeads' && 'Leads'}
                              {key === 'canViewSimulador' && 'Simulador'}
                              {key === 'canViewClientesAtivos' && 'Clientes Ativos'}
                              {key === 'canViewClientesPerdidos' && 'Clientes Perdidos'}
                              {key === 'canViewPagamentos' && 'Pagamentos'}
                              {key === 'canViewDesempenho' && 'Desempenho'}
                              {key === 'canViewAllClients' && 'Todos Clientes'}
                              {key === 'canViewAllLeads' && 'Todos Leads'}
                              {key === 'canViewAllSimulations' && 'Todas Simulações'}
                              {key === 'canViewAllReports' && 'Relatórios'}
                              {key === 'canManageUsers' && 'Usuários'}
                              {key === 'canChangeSettings' && 'Configurações'}
                              {key === 'canEditProfile' && 'Perfil'}
                            </span>
                          </span>
                        ))}
                        {!user.permissions && (
                          <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded-full">
                            <span>Permissões não configuradas</span>
                          </span>
                        )}
                        <button
                          onClick={() => handleEditUser(user)}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => toggleUserAccess(user.id, user.active)}
                          className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${
                            user.active ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                          } hover:bg-opacity-80 transition-colors`}
                        >
                          {user.active ? 'Desabilitar' : 'Habilitar'}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
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
          <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Usuários Pendentes</h2>
          <div className="grid gap-6">
            {pendingUsers.map((user) => (
              <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
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

      {/* Lista de usuários rejeitados */}
      {rejectedUsers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Usuários Rejeitados</h2>
          <div className="grid gap-6">
            {rejectedUsers.map((user) => (
              <div key={user.id} className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm border border-red-200 dark:border-red-700 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-400 font-semibold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">{user.name}</h3>
                    <p className="text-red-600 dark:text-red-400">{user.email}</p>
                    <p className="text-sm text-red-500 dark:text-red-300 mt-1">
                      Rejeitado - pode ser reativado se necessário
                    </p>
                  </div>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleReactivateUser(user.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Reativar
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Excluir
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
