import { db } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { Cliente } from '../types';

export class ClienteService {
  static async adicionarCliente(cliente: Omit<Cliente, 'id'>): Promise<void> {
    const novoCliente: Cliente = {
      ...cliente,
      id: Date.now().toString(),
      userId: cliente.userId
    };
    const docRef = doc(collection(db, 'clientes'));
    await setDoc(docRef, novoCliente);
  }

  static async atualizarCliente(id: string, cliente: Partial<Cliente>): Promise<void> {
    const docRef = doc(db, 'clientes', id);
    await updateDoc(docRef, cliente);
  }

  static async moverClienteEtapa(id: string, novaEtapa: Cliente['etapa'], userProfile: any): Promise<void> {
    // Primeiro, buscar o cliente para obter o valor e etapa atual
    let q;
    if (userProfile?.accessLevel === 'Diretor') {
      q = query(collection(db, 'clientes'), where('id', '==', id));
    } else {
      q = query(collection(db, 'clientes'), where('id', '==', id), where('userId', '==', userProfile?.uid));
    }

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return;

    const clienteDoc = querySnapshot.docs[0];
    const cliente = { id: clienteDoc.id, ...clienteDoc.data() } as Cliente;
    const etapaAnterior = cliente.etapa;

    // Atualizar a etapa do cliente
    await this.atualizarCliente(id, {
      etapa: novaEtapa,
      dataUltimaInteracao: new Date().toISOString()
    });

    // Atualizar o vendidoNoMes se necessário
    if (cliente.valorCredito && (etapaAnterior === 'Venda Ganha' || novaEtapa === 'Venda Ganha')) {
      // Para diretores, atualizar as metas do usuário que criou o cliente
      // Para outros, atualizar suas próprias metas
      const userIdParaMetas = userProfile?.accessLevel === 'Diretor' ? cliente.userId : userProfile?.uid;
      const docRefMetas = doc(db, 'metas', userIdParaMetas);
      const docSnap = await getDoc(docRefMetas);

      let novasMetas: Partial<any> = {};

      if (docSnap.exists()) {
        const metasAtuais = docSnap.data() as any;
        let vendidoNoMesAtual = metasAtuais.vendidoNoMes || 0;

        // Se estava em 'Venda Ganha' e agora não está mais, subtrair
        if (etapaAnterior === 'Venda Ganha' && novaEtapa !== 'Venda Ganha') {
          vendidoNoMesAtual = Math.max(0, vendidoNoMesAtual - cliente.valorCredito);
        }
        // Se não estava em 'Venda Ganha' e agora está, adicionar
        else if (etapaAnterior !== 'Venda Ganha' && novaEtapa === 'Venda Ganha') {
          vendidoNoMesAtual += cliente.valorCredito;
        }

        novasMetas.vendidoNoMes = vendidoNoMesAtual;
      } else if (novaEtapa === 'Venda Ganha') {
        // Se o documento não existe e estamos adicionando a primeira venda
        novasMetas.vendidoNoMes = cliente.valorCredito;
      }

      if (Object.keys(novasMetas).length > 0) {
        await setDoc(docRefMetas, novasMetas, { merge: true });
      }
    }
  }
}
