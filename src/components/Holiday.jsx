import React, { useEffect, useState } from "react";

function Holiday() {
  const API_URL =
    "https://calendarific.com/api/v2/holidays?api_key=i32QKH1jWlPqCqdMITZLvDVQt0SMi5yd&country=IN&year=2025";

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  async function getUpcomingHolidays() {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.meta.code === 200) {
        const upcomingHolidays = data.response.holidays.filter(
          (holiday) => holiday.date.iso >= today
        );
        setHolidays(upcomingHolidays);
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
    getUpcomingHolidays();
  }, []);

  return (
    <div className="mx-auto p-6 border border-gray-300 rounded-2xl shadow-lg w-full h-full">
      <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold text-gray-800">
        Upcoming Holidays
      </h2>
      {holidays.length > 3 && (
            <button
              onClick={() => setShowPopup(true)}
              className="w-20 h-10 text-center rounded-lg text-blue-700 cursor-pointer hover:text-blue-500"
            >
              See More..
            </button>
          )}
      </div>
        {/* <div className="space-y-4 ">
          {[1, 2, 3].map((_, index) => (
            <div
              key={index}
              className="h-20 w-full bg-gray-200 animate-pulse rounded-lg"
            />
          ))}
        </div> */}
         { (
        <div>
          <div className="space-y-4">
            {holidays.slice(0, 1).map((holiday, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 h-full"
              >
                <h3 className="text-lg font-semibold text-gray-800">{holiday.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(holiday.date.iso).toDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center p-4 ">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-300">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">All Holidays</h2>
            <div className="h-96 overflow-y-scroll space-y-2 p-4 bg-gray-50 rounded-md">
              {holidays.map((holiday, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded-md border border-gray-300 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {holiday.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(holiday.date.iso).toDateString()}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 w-full text-center bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Holiday;
