"use client";

import { useState } from "react";
import { createBooking } from "@/actions/bookings";

export default function BookingForm({ property, userId }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculate number of nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate total price
  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * (property.price_per_night || 0);
  };

  const nights = calculateNights();
  const totalPrice = calculateTotal();

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!checkIn || !checkOut) {
        setError("Please select check-in and check-out dates");
        setLoading(false);
        return;
      }

      if (new Date(checkIn) >= new Date(checkOut)) {
        setError("Check-out date must be after check-in date");
        setLoading(false);
        return;
      }

      if (guests < 1 || guests > property.max_guests) {
        setError(`Number of guests must be between 1 and ${property.max_guests}`);
        setLoading(false);
        return;
      }

      const bookingData = {
        property_id: property.id,
        user_id: userId,
        check_in: checkIn,
        check_out: checkOut,
        guests: guests,
        total_price: totalPrice,
        special_requests: specialRequests,
        status: "pending",
      };

      const result = await createBooking(bookingData);

      if (result.success) {
        alert("Booking request submitted successfully! Waiting for owner approval.");
        // Reset form
        setCheckIn("");
        setCheckOut("");
        setGuests(1);
        setSpecialRequests("");
      } else {
        setError(result.error || "Failed to create booking");
      }
    } catch (err) {
      setError("An error occurred while creating the booking");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-gray-900">
            ₹{property.price_per_night?.toLocaleString()}
          </span>
          <span className="text-gray-600">/ night</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={today}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || today}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Number of Guests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guests
          </label>
          <input
            type="number"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            min="1"
            max={property.max_guests}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum {property.max_guests} guests
          </p>
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests (Optional)
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows="3"
            placeholder="Any special requirements or requests..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Price Breakdown */}
        {nights > 0 && (
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                ₹{property.price_per_night?.toLocaleString()} × {nights} {nights === 1 ? "night" : "nights"}
              </span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Request to Book"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          You won't be charged yet. Your booking will be pending until the owner approves it.
        </p>
      </form>
    </div>
  );
}