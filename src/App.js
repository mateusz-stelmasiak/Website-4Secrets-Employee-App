import './App.css';
import {useEffect, useState} from "react";
import useSecretsAPI from "./useSecretsAPI";
import usePushNotifications from "./usePushNotifications";
import {Button, List} from "antd";
import {
    BellOutlined,
    BellFilled
} from '@ant-design/icons';
import Avatar from "antd/es/avatar/avatar";

function App() {
    const {register,featureAvailable} = usePushNotifications()
    const {getAllBookingsToday,getAllBookingsByDate,loading} = useSecretsAPI()
    const [todaysBookings,setTodaysBookings] = useState([])
    const roomIcons = {
        "Cosa Nostra":"https://time4secrets.pl/wp-content/uploads/2015/09/Kopiuj-z-cosa-nostra.jpg",
        "Kolekcjoner":"https://time4secrets.pl/wp-content/uploads/2015/09/Kopiuj-z-kolekcjoner1.jpg",
        "Skarb Czarnobrodego":"https://time4secrets.pl/wp-content/uploads/2015/09/Kopiuj-z-skarb-Czarnobrodego.jpg"
    }
    const weekdays = ["","pon.","wt.","śr.","czw.","pt.","sob.","ndz."]

    useEffect(()=>{
        getBookingsList()
    },[])

    let getBookingsList = async ()=>{
        let temp= await getAllBookingsToday();
        setTodaysBookings(()=>temp)
    }
    let getCurrentDateFormatted = () =>{
        const today = new Date();
        let weekday = weekdays[today.getDay()];

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${weekday}, ${day}/${month}/${year}`;
    }

    return (
        <main>
            <section>

                <div className={"sectionHeader"}>
                    <div className={"sectionTitle"}>
                        <h2>REZERWACJE</h2>
                        <span>({getCurrentDateFormatted()})</span>
                    </div>
                    <button className={"pushSubcribe"} onClick={register} disabled={!featureAvailable}>
                        <BellOutlined />
                    </button>
                </div>


                <List
                    locale={{emptyText: <span className={"itemTitle"}>--<br/> brak rezerwacji</span>}}
                    itemLayout="horizontal"
                    loading={loading}
                    dataSource={todaysBookings}
                    renderItem={(item, index) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={roomIcons[item.room]}/>}
                                title={<span className={"itemTitle"}>{item.hour}</span>}
                                description={<span className={"itemDesc"}>{item.room}</span>}
                            />
                        </List.Item>
                    )}
                />
            </section>

            {/*<section>*/}
            {/*    <div className={"sectionTitle"}>*/}
            {/*        <h2>Powiadomienia</h2>*/}
            {/*        <span>({getCurrentDateFormatted()})</span>*/}
            {/*    </div>*/}
            {/*    /!*<Button onClick={register} disabled={!featureAvailable}>*!/*/}
            {/*    /!*    DOSTAWAJ DZISIAJ POWIADOMIENIA*!/*/}
            {/*    /!*</Button>*!/*/}
            {/*</section>*/}

        </main>

    );
}

export default App;
