import React, { useState, useEffect } from 'react';

export default function DoctorDashboard({ date, availableDates, onDateChange }) {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAdminSchedule = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/admin/appointments?date=${date}`);
        const data = await response.json();
        
        // Sort appointments by AM/PM and time
        const sortedData = data.sort((a, b) => {
          const timeA = new Date(`1970/01/01 ${a.timeSlot.split(' - ')[0]}`);
          const timeB = new Date(`1970/01/01 ${b.timeSlot.split(' - ')[0]}`);
          return timeA - timeB;
        });
        
        setAppointments(sortedData);
      } catch (err) {
        console.error("Failed to load doctor schedule");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminSchedule();
  }, [date]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Doctor's Daily Schedule</h2>
          <p className="text-slate-300 text-sm mt-1">Viewing all patient bookings for {date}</p>
        </div>
        <select 
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
        >
          {availableDates.map(d => (
            <option key={d.value} value={d.value}>{d.dayName}, {d.month} {d.dateNum}</option>
          ))}
        </select>
      </div>

      <div className="p-0">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center">
            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p className="text-lg font-medium">No appointments booked yet.</p>
            <p className="text-sm mt-1">Enjoy the open schedule!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Time Slot</th>
                  <th scope="col" className="px-6 py-4">Patient Name</th>
                  <th scope="col" className="px-6 py-4">Contact Info</th>
                  <th scope="col" className="px-6 py-4">Reason for Visit</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt._id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {apt.timeSlot.split(' - ')[0]}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {apt.patientName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> {apt.phone}</span>
                        <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> {apt.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={apt.reason}>
                      {apt.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}