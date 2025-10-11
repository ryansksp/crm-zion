import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface AuditLog {
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
  ip?: string; // For client-side, hard to get, but can use a service
  userAgent: string;
}

export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(userId: string, action: string, details: string = '') {
    const log: Omit<AuditLog, 'timestamp'> = {
      userId,
      action,
      details,
      userAgent: navigator.userAgent,
    };

    console.log(`[AUDIT] ${userId}: ${action} - ${details}`);

    try {
      await addDoc(collection(db, 'audit_logs'), {
        ...log,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao salvar log de auditoria:', error);
    }
  }

  logAuth(userId: string, action: string, details: string = '') {
    this.log(userId, `AUTH_${action}`, details);
  }

  logAction(userId: string, module: string, action: string, details: string = '') {
    this.log(userId, `${module}_${action}`, details);
  }
}

export const auditLogger = AuditLogger.getInstance();
