import {push, ref, set,query,orderByChild,orderByKey,get} from "firebase/database";
import {firebaseDb} from "../firebase-config";
import {getAllRoomsBookedHours} from "./rooms/[date]";
const webpush = require('web-push');

webpush.setVapidDetails(
    "mailto:mateusz.stelmasiak@gmail.com",
    process.env.PUBLIC_VAPID_KEY,
    process.env.PRIVATE_VAPID_KEY,
);

export default async function handler(request, response) {
    //get last reservation state from DB
    let lastSeenState = await getSnapshot("/lastState")

    //get current state
    let currentState = await getAllRoomsBookedHours(getCurrDate());

    //Overwrite state in DB
    let newItemRef = ref(firebaseDb, "/lastState");
    await set(newItemRef, currentState);

    //Last seen state was empty till now (aka. first load)
    if(!lastSeenState) return;

    //Get all differences between states
    let newReservations =[];
    currentState.forEach((reservation)=>{
        if(lastSeenState.find((x)=>(x.hour===reservation.hour) && (x.room===reservation.room))){
            return;
        }
        newReservations.push(reservation);
    })

    //nothing changed, just return
    if(newReservations.length ===0){return;}

    //Get list of all subscribed web push endpoints
    let subscribers = await getSnapshot("/subscribed");

    //iterate through new reservations and send push notifications to all subscribers
    newReservations.forEach((newReservation)=>{
        const payload = JSON.stringify({ title: "Nowa rezerwacja!" ,
            body:`${newReservation.hour} - ${newReservation.room}`,
            icon:process.env.LOGO_URL
        });

        subscribers.forEach((subscription)=>{
            webpush
                .sendNotification(subscription, payload)
                .catch(err => console.error(err));
        })
    })
    return response.status(200).json({});
}

function getCurrDate(){
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

async function getSnapshot(path,orderBy){
    let quer = await query(ref(firebaseDb, path)
        ,(orderBy ? orderByChild(orderBy) : orderByKey())
    );

    let snapshot = await get(quer);
    let items =[];
    snapshot.forEach((snap)=>{
        items.unshift(snap.val());
    })
    //handle single items
    if(items.length ===0){items = snapshot.val();}
    return items;
}