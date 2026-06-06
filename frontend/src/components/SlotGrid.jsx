import React from 'react';

// Helper to prevent booking slots in the past
const isPastSlot = (slotTimeStr, targetDateStr) => {
  const now = new Date();
  const targetDate = new Date(targetDateStr);

  // Check if the selected date is today
  const isToday =
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getDate() === now.getDate();

  // If the selected day is entirely in the past, block everything
  if (!isToday) {
    targetDate.setHours(0, 0, 0, 0);
    const today = new Date(now).setHours(0, 0, 0, 0);
    return targetDate < today;
  }

  // If it's today, parse the slot's start time (e.g., "09:00 AM - 10:00 AM" -> "09:00 AM")
  const startTimeStr = slotTimeStr.split(' - ')[0];
  const [time, modifier] = startTimeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const slotTime = new Date(now.getTime()); // Use 'now' to ensure timezone matches
  slotTime.setHours(hours, minutes, 0, 0);

  return slotTime < now;
};

export default function SlotGrid({ slots, selectedDate, onSelectSlot }) {
  const morningSlots = slots.filter(slot => slot.time.includes('AM'));
  const afternoonSlots = slots.filter(slot => slot.time.includes('PM'));

  const renderSlotGroup = (groupSlots, title, icon) => (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        {icon}
        <h4 className="font-medium text-lg">{title}</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {groupSlots.map((slot) => {
          const isPast = isPastSlot(slot.time, selectedDate);
          const isBooked = slot.isBooked || slot.isOptimisticBooked;
          const isUnavailable = isBooked || isPast;

          return (
            <button
              key={slot.time}
              disabled={isUnavailable}
              onClick={() => onSelectSlot(slot.time)}
              className={`relative group p-4 rounded-xl border text-left transition-all duration-200 ${
                isUnavailable
                  ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-60'
                  : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md hover:shadow-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-semibold text-base ${isUnavailable ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-blue-700'}`}>
                  {slot.time}
                </span>
                
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isPast 
                    ? 'bg-slate-200 text-slate-500' 
                    : isBooked
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {isPast ? 'Passed' : isBooked ? 'Booked' : 'Open'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (slots.length === 0) return null;

  return (
    <div>
      {renderSlotGroup(
        morningSlots, 
        "Morning Appointments",
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
      )}
      
      {renderSlotGroup(
        afternoonSlots, 
        "Afternoon Appointments",
        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
      )}
    </div>
  );
}