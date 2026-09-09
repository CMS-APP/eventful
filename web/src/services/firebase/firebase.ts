import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCcAHVVo3FIJrSK1FVQ_hPRmQm635jbdlQ",
  authDomain: "eventful-23690.firebaseapp.com",
  projectId: "eventful-23690",
  storageBucket: "eventful-23690.firebasestorage.app",
  messagingSenderId: "165003650822",
  appId: "1:165003650822:web:88a7fa08ae63985891a087"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
