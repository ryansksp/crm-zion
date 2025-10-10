import { Building } from 'lucide-react';

export function ProfileConfiguring() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <Building className="w-24 h-24 text-blue-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            CRM Zion
          </h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Perfil em Configuração
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Seu perfil está sendo configurado pelo administrador do sistema.
            Você receberá acesso às funcionalidades assim que a configuração for concluída.
          </p>
          <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
