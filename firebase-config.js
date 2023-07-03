import {initializeApp, getApps, getApp} from "firebase/app";
import {get, getDatabase, orderByChild, orderByKey, query, ref} from "firebase/database";

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


export async function getSnapshot(path, orderBy) {
    let quer = await query(ref(firebaseDb, path)
        , (orderBy ? orderByChild(orderBy) : orderByKey())
    );

    let snapshot = await get(quer);
    let items = [];
    snapshot.forEach((snap) => {
        items.unshift(snap.val());
    })
    //handle single items
    if (items.length === 0) {
        items = snapshot.val();
    }
    return items;
}

export async function getSnapshotWithKey(path, orderBy) {
    let quer = await query(ref(firebaseDb, path)
        , (orderBy ? orderByChild(orderBy) : orderByKey())
    );

    let snapshot = await get(quer);
    let items = [];
    snapshot.forEach((snap) => {
        items.unshift({'key': snap.key, 'data': snap.val()});
    })
    //handle single items
    if (items.length === 0) {
        items = {'key': snapshot.key, 'data': snapshot.val()};
    }
    return items;
}


