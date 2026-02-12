"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function BookingForm({ propertyId, pricePerNight }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  const totalPrice = nights * (pricePerNight || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      // Validate dates
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      
      if (checkOutDate <= checkInDate) {
        setError("Check-out date must be after check-in date");
        setLoading(false);
        return;
      }

      // Create booking
      const { data, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          guests: formData.guests,
          total_price: totalPrice,
          status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Show success message
      setSuccess(true);
      
      // Reset form
      setFormData({
        checkIn: "",
        checkOut: "",
        guests: 1,
      });

      // Redirect after 2.5 seconds
      setTimeout(() => {
        router.push("/guest/dashboard#bookings?tab=pending");
        router.refresh();
      }, 2500);

    } catch (err) {
      console.error("Booking error:", err);
      setError(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-green-800 mb-1">
                🎉 Booking Successful!
              </h3>
              <p className="text-xs text-green-700">
                Your booking request has been submitted and is pending approval. Redirecting you to your bookings...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-0.5">Error</h3>
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Check-in
        </label>
        <input
          type="date"
          required
          min={today}
          value={formData.checkIn}
          onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
          disabled={success}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Check-out
        </label>
        <input
          type="date"
          required
          min={formData.checkIn || today}
          value={formData.checkOut}
          onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
          disabled={success}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Guests
        </label>
        <input
          type="number"
          required
          min="1"
          value={formData.guests}
          onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
          disabled={success}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {nights > 0 && (
        <div className="p-4 bg-indigo-50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">₹{pricePerNight?.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
            <span className="font-medium text-gray-900">₹{totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-indigo-200">
            <span>Total</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || nights <= 0 || success}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </>
        ) : success ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Booked Successfully!
          </>
        ) : (
          "Reserve Now"
        )}
      </button>
    </form>
  );
}