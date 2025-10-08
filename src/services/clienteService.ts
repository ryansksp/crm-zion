import { db } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { Cliente } from '../types';
import { getCurrentDateTimeBrasiliaISO } from '../utils/date';

export class ClienteService {
  static async adicionarCliente(cliente: Omit<Cliente, 'id'>): Promise<string> {
    const novoCliente: Cliente = {
      ...cliente,
      id: '', // Será definido com o ID do Firestore
      userId: cliente.userId
    };
    const docRef = doc(collection(db, 'clientes'));
    await setDoc(docRef, { ...novoCliente, id: docRef.id });
    return docRef.id;
  }

  static async atualizarCliente(id: string, cliente: Partial<Cliente>): Promise<void> {
    try {
      const docRef = doc(db, 'clientes', id);

      // Verificar se o documento existe
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error(`Documento cliente com ID ${id} não encontrado no Firestore`);
        throw new Error(`Cliente não encontrado: ${id}`);
      }

      console.log('Atualizando cliente:', id, 'com dados:', cliente);
      await updateDoc(docRef, cliente);
      console.log('Cliente atualizado com sucesso:', id);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  static async moverClienteEtapa(id: string, novaEtapa: Cliente['etapa'], userProfile: { accessLevel?: string; uid?: string } | null): Promise<void> {
    // Primeiro, buscar o cliente para obter o valor e etapa atual
    let q;
    if (userProfile?.accessLevel === 'Diretor' || novaEtapa === 'Venda Ganha') {
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
    const updateData: Partial<Cliente> = {
      etapa: novaEtapa,
      dataUltimaInteracao: new Date().toISOString()
    };

    // Definir dataVenda quando mover para Venda Ganha
    if (novaEtapa === 'Venda Ganha' && etapaAnterior !== 'Venda Ganha') {
      updateData.dataVenda = getCurrentDateTimeBrasiliaISO();
    }

    // Definir dataPerda quando mover para Venda Perdida
    if (novaEtapa === 'Venda Perdida' && etapaAnterior !== 'Venda Perdida') {
      updateData.dataPerda = getCurrentDateTimeBrasiliaISO();
    }

    // Atualizar userId quando mover para Venda Ganha para dar crédito ao vendedor
    if (novaEtapa === 'Venda Ganha' && userProfile?.uid) {
      updateData.userId = userProfile.uid;
    }

    await this.atualizarCliente(id, updateData);

    // Atualizar o vendidoNoMes se necessário
    if (cliente.valorCredito && (etapaAnterior === 'Venda Ganha' || novaEtapa === 'Venda Ganha')) {
      // Dar crédito ao usuário que moveu para Venda Ganha
      const userIdParaMetas = userProfile?.uid;
      if (!userIdParaMetas) return; // Skip if no user ID
      const docRefMetas = doc(db, 'metas', userIdParaMetas);
      const docSnap = await getDoc(docRefMetas);

      const novasMetas: Partial<{ vendidoNoMes: number }> = {};

      if (docSnap.exists()) {
        const metasAtuais = docSnap.data() as { vendidoNoMes?: number };
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

  static async reatribuirLead(id: string, novoUserId: string): Promise<void> {
    try {
      const docRef = doc(db, 'clientes', id);

      // Verificar se o documento existe
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error(`Documento cliente com ID ${id} não encontrado no Firestore`);
        throw new Error(`Cliente não encontrado: ${id}`);
      }

      console.log('Reatribuindo lead:', id, 'para usuário:', novoUserId);
      await updateDoc(docRef, {
        userId: novoUserId,
        dataUltimaInteracao: new Date().toISOString()
      });
      console.log('Lead reatribuído com sucesso:', id);
    } catch (error) {
      console.error('Erro ao reatribuir lead:', error);
      throw error;
    }
  }
}
