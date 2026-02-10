"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBookingStatus } from "@/actions/bookings";

export default function BookingActions({ bookingId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleUpdate = async (status) => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await updateBookingStatus(bookingId, status);

      if (!result?.success) {
        setError(result?.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Refresh server component data
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Actions (Pending Booking)
      </h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => handleUpdate("confirmed")}
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Approve Booking"}
        </button>

        <button
          onClick={() => {
            if (confirm("Are you sure you want to reject this booking?")) {
              handleUpdate("cancelled");
            }
          }}
          disabled={loading}
          className="w-full px-6 py-3 bg-white border-2 border-red-300 text-red-700 rounded-xl font-semibold hover:bg-red-50 transition disabled:opacity-50"
        >
          Reject Booking
        </button>
      </div>
    </div>
  );
}
