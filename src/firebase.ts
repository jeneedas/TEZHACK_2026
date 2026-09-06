import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4qJjquGkihAjD5cAsSD8uJJ9aXMzqirY",
  authDomain: "ziva-96f35.firebaseapp.com",
  projectId: "ziva-96f35",
  storageBucket: "ziva-96f35.firebasestorage.app",
  messagingSenderId: "230169291662",
  appId: "1:230169291662:web:9324596d58fabc3edf12df",
  measurementId: "G-0TT72W8PY6"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);