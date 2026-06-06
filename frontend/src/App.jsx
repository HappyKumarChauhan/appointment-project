import React, { useState, useEffect } from "react";
import SlotGrid from "./components/SlotGrid";
import BookingModal from "./components/BookingModal";
import DoctorDashboard from "./components/DoctorDashboard";

// Helper function to generate the next 10 days
const generateUpcomingDates = () => {
  const dates = [];
  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push({
      value: d.toISOString().split('T')[0], 
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    });
  }
  return dates;
};

export default function App() {
  const [availableDates] = useState(generateUpcomingDates());
  const [date, setDate] = useState(availableDates[0].value);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('patient');

  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://appointment-project-xg2j.onrender.com/api/appointments?date=${date}`,
      );
      const data = await response.json();
      setSlots(data);
    } catch (err) {
      setError("Failed to fetch schedule data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [date]);

  const handleBooking = async (formData) => {
    setError("");
    setSuccess("");
    const targetSlot = selectedSlot;
    setSelectedSlot(null);

    // Optimistic UI Update
    setSlots((prevSlots) =>
      prevSlots.map((s) =>
        s.time === targetSlot ? { ...s, isOptimisticBooked: true } : s,
      ),
    );

    try {
      const response = await fetch(
        "https://appointment-project-xg2j.onrender.com/api/appointments/book",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, date, timeSlot: targetSlot }),
        },
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Something went wrong");

      setSuccess(result.message);
      setSlots((prevSlots) =>
        prevSlots.map((s) =>
          s.time === targetSlot
            ? { ...s, isBooked: true, isOptimisticBooked: false }
            : s,
        ),
      );
    } catch (err) {
      setError(err.message);
      setSlots((prevSlots) =>
        prevSlots.map((s) =>
          s.time === targetSlot ? { ...s, isOptimisticBooked: false } : s,
        ),
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Header with Admin Toggle */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">CarePlus Clinic</h1>
          </div>
          
          {/* View Toggle Switch */}
          <button 
            onClick={() => {
              setViewMode(viewMode === 'patient' ? 'admin' : 'patient');
              setError('');
              setSuccess('');
            }}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300"
          >
            {viewMode === 'patient' ? 'Doctor Login' : 'Switch to Patient View'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {viewMode === 'admin' ? (
          // Doctor View
          <DoctorDashboard date={date} availableDates={availableDates} onDateChange={setDate} />
        ) : (
          // Patient View (Your existing code)
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Book an Appointment</h2>
              <p className="text-slate-600">Select a date and time that works best for you.</p>
            </div>

            {error && ( /* existing error render */ 
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3"><span className="font-medium">{error}</span></div>
            )}
            {success && ( /* existing success render */ 
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3"><span className="font-medium">{success}</span></div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">1. Select Date</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {availableDates.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDate(d.value)}
                      className={`snap-start flex flex-col items-center min-w-[80px] p-3 rounded-xl border transition-all duration-200 ${
                        date === d.value ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 scale-105' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <span className={`text-xs font-medium uppercase ${date === d.value ? 'text-blue-100' : 'text-slate-400'}`}>{d.dayName}</span>
                      <span className="text-2xl font-bold my-0.5">{d.dateNum}</span>
                      <span className={`text-xs ${date === d.value ? 'text-blue-100' : 'text-slate-500'}`}>{d.month}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">2. Select Time</h3>
                {isLoading ? (
                  <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
                ) : (
                  <SlotGrid slots={slots} selectedDate={date} onSelectSlot={setSelectedSlot} />
                )}
              </div>
            </div>

            {selectedSlot && (
              <BookingModal
                selectedSlot={selectedSlot}
                onClose={() => setSelectedSlot(null)}
                onBook={handleBooking}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
