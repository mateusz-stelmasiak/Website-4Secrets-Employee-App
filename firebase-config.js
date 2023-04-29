import {initializeApp, getApps, getApp} from "firebase/app";
import {getDatabase} from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBKYlsFCZpFZ-5sQLBGKLvideYUvZ87BiU",
    authDomain: "secrets-56bdc.firebaseapp.com",
    databaseURL: "https://secrets-56bdc-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "secrets-56bdc",
    storageBucket: "secrets-56bdc.appspot.com",
    messagingSenderId: "104266531696",
    appId: "1:104266531696:web:ab811490a9b98d5068c5b5"
};


let firebase = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const firebaseApp = firebase;
export const firebaseDb = getDatabase(firebaseApp);





