// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTr86LV8S196qTuVcVl9jwpTzYML4xRk4",
  authDomain: "studyahh-2ddd9.firebaseapp.com",
  projectId: "studyahh-2ddd9",
  storageBucket: "studyahh-2ddd9.firebasestorage.app",
  messagingSenderId: "618735598254",
  appId: "1:618735598254:web:f06a34ebb92632e01e4b3f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
