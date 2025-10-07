
import { db } from '../firebaseConfig';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { PlanoEmbracon } from '../types';
import {
  PlanoConsorcio,
  planosAutomovel90Meses,
  planosAutomovel100Meses,
  planosImovel200Meses,
  planosImovel220Meses,
  planosImovel240Meses
} from '../data/planosConsorcio';

export class PlanoService {
  static async adicionarPlano(plano: Omit<PlanoEmbracon, 'id' | 'userId'>, userId: string): Promise<void> {
    const novoPlano = {
      ...plano,
      userId: userId
    };
    const docRef = doc(collection(db, 'planos'));
    await setDoc(docRef, novoPlano);
  }

  static async atualizarPlano(id: string, plano: Partial<PlanoEmbracon>, userProfile: { accessLevel?: string; uid?: string } | null): Promise<void> {
    const docRef = doc(db, 'planos', id);

    // Check permissions
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    if (userProfile?.accessLevel !== 'Diretor' && userProfile?.accessLevel !== 'Gerente' && data.userId !== userProfile?.uid) {
      return; // No permission
    }

    await updateDoc(docRef, plano);
  }

  // Novo método para adicionar em lote os planos do consórcio
  static async adicionarPlanosConsorcio(userId: string): Promise<void> {
    const todosPlanos: PlanoConsorcio[] = [
      ...planosAutomovel90Meses,
      ...planosAutomovel100Meses,
      ...planosImovel200Meses,
      ...planosImovel220Meses,
      ...planosImovel240Meses
    ];

    for (const plano of todosPlanos) {
      const novoPlano = {
        nome: plano.nome,
        tipo: plano.tipo,
        credito: plano.credito,
        parcela: plano.parcela,
        prazoMeses: plano.prazoMeses,
        taxaAdmTotal: plano.taxaAdmTotal,
        fundoReserva: plano.fundoReserva,
        taxaAdesao: plano.taxaAdesao,
        seguro: plano.seguro,
        userId: userId
      };
      const docRef = doc(collection(db, 'planos'));
      await setDoc(docRef, novoPlano);
    }
  }
}
