import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { auditLogger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idleTimeout, setIdleTimeout] = useState<NodeJS.Timeout | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<{ count: number; lastAttempt: number }>({ count: 0, lastAttempt: 0 });

  const clearError = () => setError(null);

  const resetIdleTimer = () => {
    if (idleTimeout) clearTimeout(idleTimeout);
    if (user) {
      setIdleTimeout(setTimeout(async () => {
        await logout();
        alert('Sessão expirada por inatividade.');
      }, 30 * 60 * 1000)); // 30 minutes
    }
  };

  const handleActivity = () => {
    resetIdleTimer();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          await auditLogger.logAuth(user.uid, 'LOGIN', `Usuário ${user.email} fez login`);
          resetIdleTimer();
        } else {
          if (idleTimeout) clearTimeout(idleTimeout);
          await auditLogger.log('unknown', 'AUTH_LOGOUT', 'Usuário fez logout');
        }
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Erro no AuthStateChanged:', error);
        setError('Erro na autenticação');
        setLoading(false);
      }
    );

    // Add activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      unsubscribe();
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (idleTimeout) clearTimeout(idleTimeout);
    };
  }, []);

  const loginWithGoogle = async () => {
    setError(null);

    // Rate limiting: 5 attempts per 15 minutes
    const now = Date.now();
    const timeWindow = 15 * 60 * 1000; // 15 minutes
    if (loginAttempts.count >= 5 && now - loginAttempts.lastAttempt < timeWindow) {
      setError('Muitas tentativas de login. Tente novamente em 15 minutos.');
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Reset attempts on success
      setLoginAttempts({ count: 0, lastAttempt: 0 });
    } catch (error: unknown) {
      console.error('Erro no login com Google:', error);
      const err = error as { code?: string };
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelado pelo usuário');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup bloqueado pelo navegador');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
      // Increment attempts on failure
      setLoginAttempts(prev => ({ count: prev.count + 1, lastAttempt: now }));
      throw error;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.error('Erro no logout:', error);
      setError('Erro ao fazer logout');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
