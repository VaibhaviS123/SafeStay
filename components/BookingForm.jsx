"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function BookingForm({ propertyId, pricePerNight }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ADD THIS - Missing formData state
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

    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      // Create booking - REMOVED special_requests
     // Create booking
const { data, error: bookingError } = await supabase
  .from("bookings")
  .insert({
    user_id: user.id,
    property_id: propertyId,
    check_in: formData.checkIn,
    check_out: formData.checkOut,
    guests: formData.guests,
    status: "pending",
  })
  .select()
  .single();

      if (bookingError) throw bookingError;

      // Redirect to dashboard with success message
      router.push("/guest/dashboard?booking=success");
      router.refresh();
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
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {nights > 0 && (
        <div className="p-4 bg-indigo-50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">₹{pricePerNight?.toLocaleString()} × {nights} nights</span>
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
        disabled={loading || nights <= 0}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {loading ? "Booking..." : "Reserve Now"}
      </button>
    </form>
  );
}