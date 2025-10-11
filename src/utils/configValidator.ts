interface Config {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

export function validateFirebaseConfig(): Config {
  const config: Config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAn4pUDf2i8utW2Sg_C5lcmhns5fNYw6BQ",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "crm-zion.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "crm-zion",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "crm-zion.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "832624667664",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:832624667664:web:5b871fa257fbe7b42a6e95",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XCE4M3RS0Y"
  };

  // Only validate in production, provide fallbacks in development
  if (import.meta.env.PROD) {
    const missing = Object.entries(config).filter(([key, value]) => !value).map(([key]) => key);
    if (missing.length > 0) {
      throw new Error(`Configurações do Firebase ausentes: ${missing.join(', ')}`);
    }
  }

  return config;
}
