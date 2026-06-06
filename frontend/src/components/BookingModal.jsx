import React, { useState } from 'react';

export default function BookingModal({ selectedSlot, onClose, onBook }) {
  const [formData, setFormData] = useState({ patientName: '', phone: '', email: '', reason: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Form Validation Logic
  const validateForm = () => {
    const newErrors = {};
    
    // Name: Only letters and spaces, min 2 chars
    if (!formData.patientName.trim()) {
      newErrors.patientName = "Name is required.";
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(formData.patientName)) {
      newErrors.patientName = "Please enter a valid name (letters only).";
    }

    // Phone: Exactly 10 digits
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    // Email: Standard email regex format
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Reason: Minimum 10 characters so it's actually useful
    if (!formData.reason.trim()) {
      newErrors.reason = "Reason for visit is required.";
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = "Please provide a bit more detail (min 10 characters).";
    }

    setErrors(newErrors);
    // Returns true if there are NO errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Stop submission if validation fails
    if (!validateForm()) return;

    setSubmitting(true);
    await onBook(formData);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Confirm Appointment</h3>
        <p className="text-sm text-gray-500 mb-4">Selected Slot: <span className="font-semibold text-blue-600">{selectedSlot}</span></p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Full Name</label>
            <input
              type="text"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                errors.patientName ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
              }`}
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            />
            {errors.patientName && <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="1234567890"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                errors.phone ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
              }`}
              value={formData.phone}
              onChange={(e) => {
                // Allow only numbers to be typed
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) setFormData({ ...formData, phone: value });
              }}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email Address</label>
            <input
              type="email"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none transition-colors ${
                errors.email ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
              }`}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Reason for Visit</label>
            <textarea
              rows="3"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none resize-none transition-colors ${
                errors.reason ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
              }`}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
          </div>

          <div className="flex gap-3 pt-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition shadow-md"
            >
              {submitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}