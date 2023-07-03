import {
    push,
    ref,
    set,
} from "firebase/database";
import {firebaseDb, getSnapshot} from "../firebase-config";
import {allowCors} from "./CORS";
const webpush = require('web-push');

webpush.setVapidDetails(
    "mailto:mateusz.stelmasiak@gmail.com",
    process.env.PUBLIC_VAPID_KEY,
    process.env.PRIVATE_VAPID_KEY,
);

module.exports = allowCors(handler)

export default async function handler(request, response) {
    const subscription = request.body;

    if(!subscription){
        return response.status(402).json({"Error":"Missing arguments"});
    }

    //Check if isn't already subscribed
    let subscribers = await getSnapshot("/subscribed");
    if(subscribers){
        let duplicate = subscribers.find((iterSub)=>{
            return areSubscriptionsEqual(iterSub,subscription)
        })
        if(duplicate){
            return response.status(406).json({"Error":"This device is already registered"});
        }
    }

    //ADD to DB
    let newItemRef = push(ref(firebaseDb, "/subscribed"));
    await set(newItemRef, subscription);

    // Notify user that they have been subscribed
    const payload = JSON.stringify({ title: "Powiadomienia przez 24H" ,
        body:"Będziesz dostawał powiadomienia o nowych pokojach do końca dnia!",
        icon: "http://image.ibb.co/frYOFd/tmlogo.png"
    });

    await webpush
        .sendNotification(subscription, payload)
        .catch(err => console.error(err));

    return response.status(201).json({});
}


function areSubscriptionsEqual(sub1, sub2){
    if (!sub1 || !sub2) return false;

    return (
        sub1.endpoint === sub2.endpoint &&
        sub1.keys.auth === sub2.keys.auth &&
        sub1.keys.p256dh === sub2.keys.p256dh
    );
};
