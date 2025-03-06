import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { collection, getFirestore, getDocs } from "firebase/firestore";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WeatherChart = () => {
    const [chartData, setChartData] = useState(null);


    const convertFirestoreTimestampToDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return null;
        return new Date(timestamp.seconds * 1000);
    };

    const getData = async () => {
        try {
            const db = getFirestore();
            const attendanceRef = collection(db, "attendance");

            const querySnapshot = await getDocs(attendanceRef);
            if (!querySnapshot.empty) {
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                data.sort((a, b) => {
                    const dateA = convertFirestoreTimestampToDate(a.Date);
                    const dateB = convertFirestoreTimestampToDate(b.Date);
                    return dateA - dateB;
                });
                return data;
            } else {
                console.log("No data available");
                return [];
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };

    // const fetchWeatherForecast = async () => {
    //     try {
    //         const rawData = await getData(); // Fetch Firestore data

    //         console.log("Fetched Data:", rawData);

    //         // Extract required data: Date & Working Hours
    //         const labels = rawData.map(entry => 
    //             entry.Date?.seconds
    //                 ? new Date(entry.Date.seconds * 1000).toLocaleDateString("en-US", {
    //                       month: "short",
    //                       day: "numeric",
    //                   })
    //                 : "Unknown Date"
    //         );

    //         const temperatures = rawData
    //             .map(entry => (typeof entry.Working_hours === "number" ? entry.Working_hours : null))
    //             .filter(value => value !== null); // Remove invalid values

    //         setChartData({
    //             labels,
    //             datasets: [
    //                 {
    //                     label: "Working Hours",
    //                     data: temperatures,
    //                     borderColor: "rgba(75,192,192,1)",
    //                     backgroundColor: "rgba(75,192,192,0.2)",
    //                     borderWidth: 2,
    //                     pointRadius: 3,
    //                 },
    //             ],
    //         });
    //     } catch (error) {
    //         console.error("Error processing data:", error);
    //     }
    // };
    const fetchWeatherForecast = async () => {
        try {
            const rawData = await getData(); // Fetch Firestore data
            console.log("Fetched Data:", rawData);
    
            // Extract required data: Date & Check-in Time
            const labels = rawData.map(entry =>
                entry.Date?.seconds
                    ? new Date(entry.Date.seconds * 1000).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                      })
                    : "Unknown Date"
            );
    
            // Extract check-in times in hours & minutes
            const checkinTimes = rawData
                .map(entry =>
                    entry.Checkin?.seconds
                        ? new Date(entry.Checkin.seconds * 1000).getHours() + 
                          new Date(entry.Checkin.seconds * 1000).getMinutes() / 60
                        : 0
                )
                .filter(value => value !== null); // Remove invalid values
    
            setChartData({
                labels,
                datasets: [
                    {
                        label: "Check-in Time (Hours)",
                        data: checkinTimes,
                        borderColor: "rgba(255,99,132,1)", // Red Line for Visibility
                        backgroundColor: "rgba(255,99,132,0.2)",
                        borderWidth: 2,
                        pointRadius: 3,
                    },
                ],
            });
        } catch (error) {
            console.error("Error processing data:", error);
        }
    };
    
    useEffect(() => {
        fetchWeatherForecast();
    }, []);

    return (
        <div className="h-full">
            {chartData ? (
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: true } },
                        scales: { y: { beginAtZero: false } },
                    }}
                />
            ) : (
                <p>Loading chart...</p>
            )}
        </div>
    );
};

export default WeatherChart;
