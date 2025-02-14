
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

console.log(process.env.REACT_APP_FIREBASE_KEY)
const firebaseConfig = {
  apiKey:"AIzaSyAZaZMp2CEPQQyuRUG0zPNXd0SyaChTwJc",
  authDomain: "hotel-project-5dc93.firebaseapp.com",
  projectId: "hotel-project-5dc93",
  storageBucket: "hotel-project-5dc93.appspot.com",
  messagingSenderId: "1041628659171",
  appId: "1:1041628659171:web:af3d439a114c0759ce34d6",
  measurementId: "G-5LYEECGSPC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);
export const auth =getAuth();
export const storage = getStorage(app);