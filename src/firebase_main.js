import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBa1M0iQ_yjtp4N811UWA58lre0N29PKb4",
  authDomain: "inflectionpoints.firebaseapp.com",
  projectId: "inflectionpoints",
  storageBucket: "inflectionpoints.appspot.com",
  messagingSenderId: "890751594170",
  appId: "1:890751594170:web:483b5ddb847a3166231c83",
  measurementId: "G-KL2SRH5K8E"
};
 
// init firebase
firebase.initializeApp(firebaseConfig);

// init services
const projectFirestore = firebase.firestore();
const projectAuth = firebase.auth();
const projectStorage = firebase.storage();
const usersRef = projectFirestore.collection("users");   
const ratingsRef = projectFirestore.collection("ratings");   

// Initialize the FirebaseUI Widget using Firebase.
const ui = new firebaseui.auth.AuthUI(firebase.auth());

// Set up sign-in methods
const uiConfig = {
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  signInSuccessUrl: ["#/sign-in-success"],
  // Other config options...
};

export {
  ui,
  uiConfig,
  projectFirestore,
  projectAuth,
  projectStorage, 
  usersRef,
  ratingsRef
};
