import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from "firebase/firestore";

function Timesheet() {
    const [timesheetData, setTimesheetData] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const API_URL = "https://calendarific.com/api/v2/holidays?api_key=F0uG11Vlg2H8lObUAopkdksv0R2V9rng&country=IN&year=2025";

    const convertFirestoreTimestampToDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return null;
        return new Date(timestamp.seconds * 1000);
    };

    const formatDateOnly = (timestamp) => {
        const date = convertFirestoreTimestampToDate(timestamp);
        return date ? date.toLocaleDateString("en-GB") : "No date";
    };

    const formatTimeOnly = (timestamp) => {
        const date = convertFirestoreTimestampToDate(timestamp);
        return date ? date.toLocaleTimeString("en-GB") : "No time";
    };

    const getData = async () => {
        try {
            const db = getFirestore();
            const attendanceRef = collection(db, "attendance");
            const querySnapshot = await getDocs(attendanceRef);

            if (!querySnapshot.empty) {
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                data.sort((a, b) => convertFirestoreTimestampToDate(a.Date) - convertFirestoreTimestampToDate(b.Date));
                setTimesheetData(data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    async function getUpcomingHolidays() {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            if (data.meta.code === 200) {
                setHolidays(data.response.holidays.map(holiday => holiday.date.iso));
            } else {
                setError(data.meta.error_detail || "Failed to fetch holidays");
            }
        } catch (err) {
            setError("An error occurred while fetching holidays.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getData();
        getUpcomingHolidays();
    }, []);

    return (
        // <section className="antialiased text-gray-600 w-full px-4">
        //     <div className="flex flex-col justify-start h-full">
        //         <div className="w-full mx-auto bg-white shadow-lg rounded-sm border border-gray-200">
        //             <header className="px-5 py-4 border-b border-gray-100">
        //                 <h2 className="font-semibold text-gray-800">Time Sheet</h2>
        //             </header>
        //             <div className="p-3 overflow-y-scroll h-[85vh]">
        //                 <div className="overflow-x-auto mx-2">
        //                     <table className="table-auto w-full border-collapse">
        //                         <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
        //                             <tr>
        //                                 <th className="p-2 text-center w-1/5">Date</th>
        //                                 <th className="p-2 text-center w-1/5">Check In</th>
        //                                 <th className="p-2 text-center w-1/5">Check Out</th>
        //                                 <th className="p-2 text-center w-1/5">Working Hours</th>
        //                                 <th className="p-2 text-center w-1/5">Status</th>
        //                             </tr>
        //                         </thead>
        //                         <tbody className="text-sm divide-y divide-gray-100">
        //                             {timesheetData.length > 0 ? (
        //                                 timesheetData.map((entry) => {
        //                                     const date = convertFirestoreTimestampToDate(entry.Date);
        //                                     const dateString = date?.toISOString().split("T")[0];
        //                                     const isSunday = date?.getDay() === 0;
        //                                     const isHoliday = holidays.includes(dateString);
        //                                     const isAbsent = !entry.Checkin && !entry.Checkout;

        //                                     return (
        //                                         <tr key={entry.id} className={`text-center ${isAbsent ? 'bg-red-100 text-red-600 font-semibold' : isSunday ? 'bg-blue-100 text-blue-600 font-semibold' : isHoliday ? 'bg-yellow-100 text-yellow-600 font-semibold' : 'font-semibold'}`}>
        //                                             <td className="p-2">{formatDateOnly(entry.Date)}</td>
        //                                             {isSunday ? (
        //                                                 <td colSpan="4" className="p-2 text-lg">Weekend</td>
        //                                             ) : isHoliday ? (
        //                                                 <td colSpan="4" className="p-2 text-lg">Holiday</td>
        //                                             ) : isAbsent ? (
        //                                                 <td colSpan="4" className="p-2 text-lg">Absent</td>
        //                                             ) : (
        //                                                 <>
        //                                                     <td className="p-2">{formatTimeOnly(entry.Checkin)}</td>
        //                                                     <td className="p-2">{formatTimeOnly(entry.Checkout)}</td>
        //                                                     <td className="p-2">{entry.Working_hours}</td>
        //                                                     <td className="p-2">{entry.Status || 'N/A'}</td>
        //                                                 </>
        //                                             )}
        //                                         </tr>
        //                                     );
        //                                 })
        //                             ) : (
        //                                 <tr>
        //                                     <td colSpan="5" className="p-4 text-center text-gray-500">
        //                                         No records found
        //                                     </td>
        //                                 </tr>
        //                             )}
        //                         </tbody>
        //                     </table>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </section>
        <section className="antialiased text-gray-700 w-full px-4">
            <div className="flex flex-col justify-start h-full">
                <div className="w-full mx-auto bg-white shadow-lg rounded-lg border border-gray-200">
                    <header className="px-6 py-4 border-b border-gray-200 bg-gray-100 rounded-t-lg">
                        <h2 className="font-semibold text-gray-800 text-lg">Time Sheet</h2>
                    </header>
                    <div className="overflow-y-auto h-[85vh]">
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full">
                                <thead className="text-xs font-semibold uppercase text-gray-600 bg-gray-100 sticky top-0 z-10">
                                    <tr className="border-b border-gray-300">
                                        <th className="p-3 text-center w-1/5">Date</th>
                                        <th className="p-3 text-center w-1/5">Check In</th>
                                        <th className="p-3 text-center w-1/5">Check Out</th>
                                        <th className="p-3 text-center w-1/5">Working Hours</th>
                                        <th className="p-3 text-center w-1/5">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-200 ">
                                    {timesheetData.length > 0 ? (
                                        timesheetData.map((entry) => {
                                            const date = convertFirestoreTimestampToDate(entry.Date);
                                            const dateString = date?.toISOString().split("T")[0];
                                            const isSunday = date?.getDay() === 0;
                                            const isHoliday = holidays.includes(dateString);
                                            const isAbsent = !entry.Checkin && !entry.Checkout;

                                            return (
                                                <tr
                                                    key={entry.id}
                                                    className={`text-center transition-all duration-200 
                                            ${isAbsent ? ' font-semibold' :
                                                            isSunday ? 'font-semibold' :
                                                                isHoliday ? 'bg-yellow-100 text-yellow-700 font-semibold' :
                                                                    'bg-white hover:bg-gray-50'}`
                                                    }
                                                >
                                                    <td className="">{formatDateOnly(entry.Date)}</td>
                                                    {isSunday ? (
                                                        <td colSpan="4" className="p-3 text-lg bg-blue-100 text-blue-700 ">Weekend</td>
                                                    ) : isHoliday ? (
                                                        <td colSpan="4" className="p-3 text-lg bg-yellow-100 text-yellow-700">Holiday</td>
                                                    ) : isAbsent ? (
                                                        <td colSpan="4" className="p-3 text-lg bg-red-100 text-red-700">Absent</td>
                                                    ) : (
                                                        <>
                                                            <td className="p-3">{formatTimeOnly(entry.Checkin)}</td>
                                                            <td className="p-3">{formatTimeOnly(entry.Checkout)}</td>
                                                            <td className="p-3">{entry.Working_hours}</td>
                                                            <td className="p-3">{entry.Status || 'N/A'}</td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-5 text-center text-gray-500">
                                                No records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    );
}

export default Timesheet;
