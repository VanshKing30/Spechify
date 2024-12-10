import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2VXIiET-0Xu_8qADRq72VUuviMMde_SM",
  authDomain: "soul-app-14923.firebaseapp.com",
  databaseURL: "https://soul-app-14923-default-rtdb.firebaseio.com",
  projectId: "soul-app-14923",
  storageBucket: "soul-app-14923.firebasestorage.app",
  messagingSenderId: "104324304296",
  appId: "1:104324304296:web:72fb44967c1294152ce19d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

