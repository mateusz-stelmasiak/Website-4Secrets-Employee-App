import {useState} from "react";

const useSecretsAPI = () => {
    let [loading,setLoading] = useState(false);

    let getCurrDate = () =>{
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    let getAllBookingsToday = async ()=>{
        let currDate = getCurrDate();
        return await getAllBookingsByDate(currDate);
    }

    //date in format "YYYY-MM-DD"
    let getAllBookingsByDate = async(date)=>{
        if(!date){
            console.error("missing date arg")
            return
        }
        await setLoading(true)
        const response = await fetch(`${process.env.REACT_APP_API_URL}/rooms/${date}`);
        const data = await response.json();
        await setLoading(false)
        return data;
    }


    return {getAllBookingsToday,getAllBookingsByDate,loading}
};

export default useSecretsAPI;
