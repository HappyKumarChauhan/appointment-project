const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: { 
    type: String, 
    required: [true, 'Patient name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  reason: { 
    type: String, 
    required: [true, 'Reason for visit is required'],
    trim: true,
    minlength: [10, 'Reason must be at least 10 characters long']
  },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true }
}, { timestamps: true });

// Concurrency Guard: Prevents two identical slots on the same day
appointmentSchema.index({ date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);