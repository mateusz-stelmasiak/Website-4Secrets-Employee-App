import {push, ref, set, query, orderByChild, orderByKey, get} from "firebase/database";
import {firebaseDb} from "../firebase-config";

const webpush = require('web-push');

export const allRooms = {
    1: 'Kolekcjoner',
    4: 'Cosa Nostra',
    5: 'Skarb Czarnobrodego',
};

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
    if (!lastSeenState) return;

    //Get new reservations
    let newReservations = [];
    currentState.forEach((reservation) => {
        //reservations match
        if (lastSeenState.find((x) => (x.hour === reservation.hour) && (x.room === reservation.room))) {
            return;
        }
        newReservations.push(reservation);
    })

    //Get cancled reservations
    let canceledReservations = [];
    lastSeenState.forEach((reservation) => {
        //reservations match
        if (currentState.find((x) => (x.hour === reservation.hour) && (x.room === reservation.room))) {
            return;
        }
        canceledReservations.push(reservation);
    })
    //remove canceled from new
    newReservations = newReservations.filter((el) => !canceledReservations.includes(el));
    //Get list of all subscribed web push endpoints
    let subscribers = await getSnapshot("/subscribed");

    //nothing changed, just return
    if (newReservations.length === 0 && canceledReservations.length === 0) {
        const payload = JSON.stringify({
            title: "NIHIL NOVI!",
            body: `sul solei`,
            icon: process.env.LOGO_URL
        });

        subscribers.forEach(async (subscription) => {
            await webpush
                .sendNotification(subscription, payload)
                .catch(err => console.error(err));
        })
        return;
    }

    //iterate through new reservations and send push notifications to all subscribers
    newReservations.forEach((newReservation) => {
        const payload = JSON.stringify({
            title: "Nowa rezerwacja!",
            body: `${newReservation.hour} - ${newReservation.room}`,
            icon: process.env.LOGO_URL
        });

        subscribers.forEach(async (subscription) => {
            await webpush
                .sendNotification(subscription, payload)
                .catch(err => console.error(err));
        })
    })
    canceledReservations.forEach((canceledReservation) => {
        const payload = JSON.stringify({
            title: "Rezerwacja odwołana!",
            body: `Odwołano ${canceledReservation.hour} - ${canceledReservation.room}`,
            icon: process.env.LOGO_URL
        });

        subscribers.forEach(async (subscription) => {
            await webpush
                .sendNotification(subscription, payload)
                .catch(err => console.error(err));
        })
    })
    return response.status(200).json({});
}

function getCurrDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

async function getSnapshot(path, orderBy) {
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

export async function getRoomBookedHours(roomId, date) {
    const year = date.substr(0, 4);
    let bookedHours = [];

    try {
        const response = await fetch('https://time4secrets.pl/wp-admin/admin-ajax.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'dopbsp_calendar_schedule_get',
                dopbsp_frontend_ajax_request: true,
                id: roomId,
                year: year,
            }),
        });

        if (!response.ok) {
            console.error('ERROR GETTING FROM SERVER')
            return [] //todo error?
        }

        const data = await response.json();
        const parsedData = JSON.parse(data[date]);
        //extract hours from data

        Object.entries(parsedData['hours']).forEach((info) => {
            let roomHour = info[0];
            let roomInfo = info[1];
            if (roomInfo.status === 'booked') {
                bookedHours.push(roomHour)
            }
        })
        return bookedHours

    } catch (error) {
        return []
    }

}

export async function getAllRoomsBookedHours(date) {
    let bookedHours = [];
    for (const room of Object.entries(allRooms)) {
        let roomId = room[0];
        let currRoomName = allRooms[roomId];
        let currRoomBooked = await getRoomBookedHours(roomId, date);

        if (currRoomBooked.length === 0) continue;
        //add room name to each hour booked, making it a {hour,Roomname} object
        currRoomBooked.forEach((bookedHour) => {
            let bookingObj = {'hour': bookedHour, 'room': currRoomName};
            bookedHours.push(bookingObj)
        })

    }

    //sort by hours
    bookedHours.sort(function (a, b) {
        var keyA = a.hour,
            keyB = b.hour;
        // Compare the 2 dates
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });

    return bookedHours;
}