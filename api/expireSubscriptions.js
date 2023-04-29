import {ref, set} from "firebase/database";
import {firebaseDb} from "../firebase-config";

export default async function handler(request, response) {
    //Overwrite state in DB with empty object
    let newItemRef = ref(firebaseDb, "/subscriptions");
    await set(newItemRef, {});
}