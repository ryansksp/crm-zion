import { db } from '../firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Simulacao } from '../types';

export class SimulacaoService {
  static async adicionarSimulacao(simulacao: Omit<Simulacao, 'id'>): Promise<void> {
    const novaSimulacao: Simulacao = {
      ...simulacao,
      id: Date.now().toString(),
      userId: simulacao.userId,
    };
    const docRef = doc(collection(db, 'simulacoes'));
    await setDoc(docRef, novaSimulacao);
  }
}
