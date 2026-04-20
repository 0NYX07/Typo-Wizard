import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCdbwOR7P_kYBxxdm_noJVWmY90C6-2hX0",
  authDomain: "typowizard.firebaseapp.com",
  projectId: "typowizard",
  storageBucket: "typowizard.firebasestorage.app",
  messagingSenderId: "195285997664",
  appId: "1:195285997664:web:72c66ef8eac674a581cb05"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
