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

    let formatDateForApi = (date) =>{
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

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
        let formatedDate = formatDateForApi(date);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/rooms/${formatedDate}`);
        const data = await response.json();
        return data;
    }


    return {getAllBookingsToday,getAllBookingsByDate,loading,setLoading}
};

export default useSecretsAPI;
