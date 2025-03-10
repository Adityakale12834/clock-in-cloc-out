import React, { useState, useEffect } from 'react';
import { addDoc, collection, doc, getFirestore, updateDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import Holiday from './Holiday';
import WeatherChart from './Chart';
import { Timestamp } from "firebase/firestore";

function Home() {
    const [time, setTime] = useState(new Date());

    const [clockIn, setClockIn] = useState(false);
    const [clockOut, setClockOut] = useState(false);

    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);

    const [attendanceId, setAttendanceId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [dailyData, setDailyData] = useState([]);
    const [averageWorkingHour, setAverageWorkingHour] = useState("");
    const [data, setData] = useState([]);

    const [elapsedTime, setElapsedTime] = useState(0); // Time in seconds
    const [isRunning, setIsRunning] = useState(false); // Track if stopwatch is running

    const db = getFirestore();

    useEffect(() => {
        if (!isRunning) {
            const interval = setInterval(() => setTime(new Date()), 1000);
            return () => clearInterval(interval);
        }
    }, [isRunning]);

    useEffect(() => {
        if (checkInTime) {
            const now = new Date();
            const timeDifference = Math.floor((now - checkInTime) / 1000); // Get elapsed seconds
            setElapsedTime(timeDifference);
            // setIsRunning(true);
        }
    }, [checkInTime]);
    
    // Stopwatch Effect
    useEffect(() => {
        let interval;
        
        if (isRunning && !checkOutTime) {
            interval = setInterval(() => {
                setElapsedTime((prevTime) => prevTime + 1);
            }, 1000);
        }
    
        return () => clearInterval(interval);
    }, [isRunning, checkOutTime]); 

    useEffect(() => {
        const checkAttendance = async () => {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Normalize to start of day
                const todayTimestamp = Timestamp.fromDate(today); // Convert to Firestore Timestamp

                const attendanceQuery = query(
                    collection(db, "attendance"),
                    where("Date", ">=", todayTimestamp),
                    where("Date", "<", Timestamp.fromDate(new Date(today.getTime() + 86400000))) // Next day start
                );

                const querySnapshot = await getDocs(attendanceQuery);

                if (querySnapshot.empty) {
                    console.log("No attendance record found for today.");
                    return;
                }

                let clockIn = false;
                let clockOut = false;
                let checkInTime = null;
                let checkOutTime = null;
                let attendanceId = null;

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    attendanceId = doc.id;

                    if (data.Checkin) {
                        clockIn = true;
                        checkInTime = data.Checkin.toDate(); // Convert Firestore Timestamp to JavaScript Date
                    }

                    if (data.Checkout) {
                        clockOut = true;
                        checkOutTime = data.Checkout.toDate();
                    }
                });

                // Update state variables
                setClockIn(clockIn);
                console.log(checkInTime);
                setClockOut(clockOut);
                setCheckInTime(checkInTime);
                setCheckOutTime(checkOutTime);
                setAttendanceId(attendanceId);
            } catch (error) {
                console.error("Error fetching attendance:", error);
            }
        };

        checkAttendance();
    }, [db,clockIn,clockOut]);

    const handleClockIn = async () => {
        if (clockIn) {
            alert("You have already clocked in today!");
            return;
        }
        setLoading(true);
        try {
            const now = new Date();
            const hours = now.getHours();

            const status = hours >= 9 ? "Late" : "On Time"; // Check if time is greater than 9 AM

            const docRef = await addDoc(collection(db, "attendance"), {
                Checkin: now,
                Checkout: null,
                Date: now,
                Location: "Kalamb",
                Shift: "Day Shift",
                Status: status, // Set status based on clock-in time
                Working_hours: 0,
            });

            setClockIn(true);
            setAttendanceId(docRef.id);
            setIsRunning(true);
            alert("Clocked in successfully!");
        } catch (error) {
            console.error("Error occurred", error);
            alert("Failed to clock in. Try again later.");
        }
        setLoading(false);
    };



    const handleClockOut = async () => {
        if (!clockIn) {
            alert("You must clock in first!");
            return;
        }
        if (clockOut) {
            alert("You have already clocked out today!");
            return;
        }
        if (!attendanceId) {
            alert("No attendance record found!");
            return;
        }

        setLoading(true);
        try {
            const docRef = doc(db, "attendance", attendanceId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                alert("No attendance record found!");
                setLoading(false);
                return;
            }

            const attendanceData = docSnap.data();
            if (attendanceData.Checkout) {
                alert("You have already clocked out!");
                setLoading(false);
                return;
            }

            const checkoutTime = new Date();
            const workingHours = calculateHoursWorked(attendanceData.Checkin, { seconds: Math.floor(checkoutTime.getTime() / 1000) });

            await updateDoc(docRef, {
                Checkout: checkoutTime,
                Working_hours: parseFloat(workingHours),
            });

            setClockOut(true);
            setIsRunning(false);
            alert(`Clocked out successfully! Total working hours: ${workingHours}`);
        } catch (error) {
            console.error("Error updating document: ", error);
            alert("Failed to clock out. Try again later.");
        }
        setLoading(false);
    };



    const formattedTime = time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    // const formattedElapsedTime = elapsedTime.toLocaleTimeString("en-US", {
    //     hour: "2-digit",
    //     minute: "2-digit",
    //     second: "2-digit",
    // });

    const getAverageWorkingHour = (data) => {
        const filteredData = data.filter((item) => item.Working_hours > 0);

        if (filteredData.length === 0) return 0; // Avoid division by zero

        const totalHours = filteredData.reduce((sum, item) => sum + item.Working_hours, 0);

        return totalHours / filteredData.length;

    }
    const calculateHoursWorked = (checkin, checkout) => {
        if (checkin?.seconds && checkout?.seconds) {
            const checkinMillis = checkin.seconds * 1000; // Convert seconds to milliseconds
            const checkoutMillis = checkout.seconds * 1000;

            const differenceInMillis = checkoutMillis - checkinMillis; // Difference in milliseconds
            const hoursWorked = differenceInMillis / (1000 * 60 * 60); // Convert to hours

            return hoursWorked.toFixed(2); // Return with 2 decimal places
        } else {
            return "Invalid timestamps";
        }
    };


    // const getArrivalOnTime = (data) => {

    // }

    const getData = async () => {
        try {
            const db = getFirestore();
            const attendanceRef = collection(db, "attendance");

            const querySnapshot = await getDocs(attendanceRef);
            if (!querySnapshot.empty) {
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Data:", data);
                setAverageWorkingHour(getAverageWorkingHour(data));
                setData(data);
            } else {
                console.log("No data available");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, "0");
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
        const secs = (seconds % 60).toString().padStart(2, "0");
        return `${hrs}:${mins}:${secs}`;
    };
    

    useEffect(() => {
        getData();
    }, []);

    return (
        <>
            <div className="flex flex-wrap sm:grid sm:grid-cols-3 sm:grid-rows-3 gap-4 sm:max-w-6xl">
                <div className="row-span-3">
                    <div className="bg-white shadow-md p-6 rounded-2xl flex items-center justify-between space-x-6 w-full h-full">
                        <div className="relative">
                            <svg width="180" height="180" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" stroke="#7c4dff" strokeWidth="6" fill="transparent" />
                                <text x="50" y="50" textAnchor="middle" dy="0.3em" className="text-black text-xs font-semibold">
                                    { isRunning ? formatTime(elapsedTime) : formattedTime }
                                </text>
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-purple-600">Timesheet</h2>
                            {checkInTime && (
                                <div>
                                    <p className="text-gray-900 font-bold text-md mt-2">Check In Time</p>
                                    <p className="text-gray-500 text-sm">
                                        {checkInTime.toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        })}
                                    </p>
                                </div>
                            )}

                            {checkOutTime && (
                                <div>
                                    <p className="text-gray-900 font-bold text-md mt-2">Check Out Time</p>
                                    <p className="text-gray-500 text-sm">
                                        {checkOutTime.toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        })}
                                    </p>
                                </div>
                            )}

                            {!clockIn ? (
                                <button
                                    className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                                    disabled={loading}
                                    onClick={handleClockIn}
                                >
                                    {loading ? "Clocking In..." : "Clock In"}
                                </button>
                            ) : !clockOut ? (
                                <button
                                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer disabled:opacity-50"
                                    disabled={loading}
                                    onClick={handleClockOut}
                                >
                                    {loading ? "Clocking Out..." : "Clock Out"}
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="text-black font-bold rounded-lg shadow-lg text-center w-full mx-auto border border-gray-300 h-20 sm:h-full">
                    <div className='text-start text-xs p-2'>
                        average working hours
                    </div>
                    <div className='text-lg text-gray-600'>
                        {averageWorkingHour} hrs
                    </div>
                </div>
                <div className="text-black font-bold rounded-lg shadow-lg text-center w-full mx-auto border border-gray-300">
                    <div className='text-start text-xs p-2'>
                        Arrival on time
                    </div>
                    <div className='text-lg text-gray-600'>
                        0.00 %
                    </div>
                </div>  
                <div className="col-span-2 row-span-2 col-start-2 w-full">
                    <Holiday />
                </div>
            </div>
            <div className='h-[49vh] w-[90vw] sm:w-full p-5 my-5 border border-gray-300 shadow-lg max-w-6xl rounded-2xl'>
                <WeatherChart data={data} />
            </div>
        </>
    );
}

export default Home;
