import { db } from '../firebaseConfig';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { PlanoEmbracon } from '../types';

export class PlanoService {
  static async adicionarPlano(plano: Omit<PlanoEmbracon, 'id' | 'userId'>, userId: string): Promise<void> {
    const novoPlano = {
      ...plano,
      userId: userId
    };
    const docRef = doc(collection(db, 'planos'));
    await setDoc(docRef, novoPlano);
  }

  static async atualizarPlano(id: string, plano: Partial<PlanoEmbracon>, userProfile: any): Promise<void> {
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
}
