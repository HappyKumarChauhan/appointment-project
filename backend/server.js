const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Appointment = require('./models/Appointment');
const dns = require('node:dns');


dns.setServers(['8.8.8.8', '1.1.1.1']); 

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Fixed 1-hour slots for the clinic day
const FIXED_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM"
];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Fetch all slots with booking status for a given date
app.get('/api/appointments', async (req, requireRes) => {
  try {
    const { date } = req.query;
    if (!date) return requireRes.status(400).json({ error: 'Date parameter is required' });

    const bookings = await Appointment.find({ date });
    const bookedSlots = bookings.map(b => b.timeSlot);

    const data = FIXED_SLOTS.map(slot => ({
      time: slot,
      isBooked: bookedSlots.includes(slot)
    }));

    requireRes.json(data);
  } catch (err) {
    requireRes.status(500).json({ error: 'Server error' });
  }
});

// Create a booking request with Race-Condition handling
app.post('/api/appointments/book', async (req, res) => {
  try {
    // 1. Extract phone along with other fields
    const { patientName, phone, email, reason, date, timeSlot } = req.body;

    // 2. Create the appointment object
    const newAppointment = new Appointment({ patientName, phone, email, reason, date, timeSlot });
    
    // 3. Save to database (Mongoose will run validation here)
    await newAppointment.save();

    res.status(201).json({ message: '🎉 Appointment booked successfully!', appointment: newAppointment });
  } catch (err) {
    // Handle Concurrency (Duplicate Slot) Error
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This time slot was just booked by another patient. Please select another slot.' });
    }
    
    // Handle Mongoose Validation Errors
    if (err.name === 'ValidationError') {
      // Extract the first validation error message to send back
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages[0] });
    }

    res.status(500).json({ error: 'Server error processing request' });
  }
});

// Admin Route: Fetch full appointment details for the doctor
app.get('/api/admin/appointments', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date parameter is required' });

    // Fetch all bookings for the date, sorted by when they were created
    const bookings = await Appointment.find({ date });
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching doctor schedule' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));