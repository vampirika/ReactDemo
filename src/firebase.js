// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // ✅ This is missing
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCX2EWgcRtr3F5G6PJna3-JHUc7ju28_E0",
  authDomain: "my-react-a76d6.firebaseapp.com",
  projectId: "my-react-a76d6",
  storageBucket: "my-react-a76d6.firebasestorage.app",
  messagingSenderId: "1062819639552",
  appId: "1:1062819639552:web:d85aad8781b216514103e5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);