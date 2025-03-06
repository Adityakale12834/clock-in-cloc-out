// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxQSGE0cK8l7AQtZwupU0-ktOSiQb8kOY",
  authDomain: "auth-app-c2ef0.firebaseapp.com",
  projectId: "auth-app-c2ef0",
  storageBucket: "auth-app-c2ef0.firebasestorage.app",
  messagingSenderId: "482563221663",
  appId: "1:482563221663:web:c49c7ab12be0f0a5481aaa",
  databaseURL : "https://auth-app-c2ef0-default-rtdb.firebaseio.com",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };