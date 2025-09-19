import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAn4pUDf2i8utW2Sg_C5lcmhns5fNYw6BQ",
  authDomain: "crm-zion.firebaseapp.com",
  projectId: "crm-zion",
  storageBucket: "crm-zion.firebasestorage.app",
  messagingSenderId: "832624667664",
  appId: "1:832624667664:web:5b871fa257fbe7b42a6e95",
  measurementId: "G-XCE4M3RS0Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
