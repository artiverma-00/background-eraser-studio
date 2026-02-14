import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAEEklq-T-qfncepZVLTuoB42C9m4Sd1Ho",
  authDomain: "bg-remover-b1298.firebaseapp.com",
  databaseURL: "https://bg-remover-b1298-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bg-remover-b1298",
  storageBucket: "bg-remover-b1298.firebasestorage.app",
  messagingSenderId: "14636253561",
  appId: "1:14636253561:web:a9118ad52c45455613efa8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export default app;
