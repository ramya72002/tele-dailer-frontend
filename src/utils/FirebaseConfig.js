// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4MH8MLi03ylmlU67VEqkCo66v5fBA-XM",
  authDomain: "tele-dailer.firebaseapp.com",
  projectId: "tele-dailer",
  storageBucket: "tele-dailer.firebasestorage.app",
  messagingSenderId: "767551878000",
  appId: "1:767551878000:web:a6ac2334f3a75691aed5b5",
  measurementId: "G-RPFQNHMRJK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseAuth=getAuth(app)