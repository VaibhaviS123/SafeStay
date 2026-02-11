"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBookingStatus } from "@/actions/bookings";

export default function GuestCheckInOutActions({ 
  bookingId, 
  status, 
  checkInDate, 
  checkOutDate 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAction = async (newStatus) => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await updateBookingStatus(bookingId, newStatus);

      if (!result?.success) {
        setError(result?.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.refresh();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred");
      setLoading(false);
    }
  };

  // Check if today is the check-in date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkIn = new Date(checkInDate);
  checkIn.setHours(0, 0, 0, 0);
  
  const checkOut = new Date(checkOutDate);
  checkOut.setHours(0, 0, 0, 0);
  
  const isCheckInDate = today.getTime() === checkIn.getTime();
  const isAfterCheckIn = today.getTime() > checkIn.getTime();

  // Can only check in on the exact check-in date
  const canCheckIn = status === "confirmed" && isCheckInDate;
  
  // Can only check out on or after check-in date and on or before check-out date
  const canCheckOut = status === "checked_in" && isAfterCheckIn && today.getTime() <= checkOut.getTime();

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
          {error}
        </div>
      )}

      {status === "confirmed" && (
        <div>
          {canCheckIn ? (
            <button
              onClick={() => handleAction("checked_in")}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Check In"}
            </button>
          ) : (
            <div className="text-xs text-gray-500">
              {today.getTime() < checkIn.getTime() 
                ? `Check-in available on ${checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : "Check-in date has passed"}
            </div>
          )}
        </div>
      )}

      {status === "checked_in" && (
        <div>
          {canCheckOut ? (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to check out?")) {
                  handleAction("completed");
                }
              }}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Check Out"}
            </button>
          ) : (
            <div className="text-xs text-gray-500">
              Check-out date has passed
            </div>
          )}
        </div>
      )}
    </div>
  );
}