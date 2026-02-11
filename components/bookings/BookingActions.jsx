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

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Booking Actions
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => handleUpdate("confirmed")}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Approve"}
        </button>

        <button
          onClick={() => {
            if (confirm("Are you sure you want to reject this booking?")) {
              handleUpdate("cancelled");
            }
          }}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-white border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reject
        </button>
      </div>
    </div>
  );
}