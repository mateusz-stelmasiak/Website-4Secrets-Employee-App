import {ref, set} from "firebase/database";
import {firebaseDb} from "../firebase-config";
import {getAllRoomsBookedHours} from "./notifyNewBookings";

export default async function handler(request, response) {
    //Overwrite state in DB with empty object
    let newItemRef = ref(firebaseDb, "/subscriptions");
    await set(newItemRef, {});

    //get booked rooms for the day
    let currentState = await getAllRoomsBookedHours(getCurrDate());

    //Overwrite state in DB
    newItemRef = ref(firebaseDb, "/lastState");
    await set(newItemRef, currentState);
}

function getCurrDate(){
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}