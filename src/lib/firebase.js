// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "uber4things.firebaseapp.com",
  databaseURL: "https://uber4things.firebaseio.com",
  projectId: "uber4things",
  storageBucket: "uber4things.appspot.com",
  messagingSenderId: "269078947820",
  appId: "1:269078947820:web:e78318cd4e8fb44354c2c9",
  measurementId: "G-LW7HN2YY44"
};

// Initialize Firebase

export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const functions = getFunctions(app);

