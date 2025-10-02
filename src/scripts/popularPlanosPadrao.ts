import { PlanoService } from '../services/planoService';

// Função para popular a coleção "planos" com os planos padrão
export async function popularPlanosPadrao(userId: string): Promise<void> {
  try {
    await PlanoService.adicionarPlanosConsorcio(userId);
    console.log('Planos padrão adicionados com sucesso.');
  } catch (error) {
    console.error('Erro ao adicionar planos padrão:', error);
  }
}

// Exemplo de uso:
// popularPlanosPadrao('ID_DO_USUARIO_AQUI');
