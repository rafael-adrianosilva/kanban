import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCyOYkJoqQN0pSjPYGbpxozaM1jhtB7Zag",
  authDomain: "zengrid-seven.firebaseapp.com",
  projectId: "zengrid-seven",
  storageBucket: "zengrid-seven.firebasestorage.app",
  messagingSenderId: "420833810188",
  appId: "1:420833810188:web:b624f23ad2b88e54c75b29",
  measurementId: "G-DPCHJN4SG9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
