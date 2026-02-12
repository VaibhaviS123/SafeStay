"use client";

import { useState } from "react";
import { guestCheckIn, guestCheckOut } from "@/actions/checkin-checkout";

export default function GuestCheckInOutActions({ bookingId, status, checkInDate, checkOutDate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(status);

  const normalizedStatus = currentStatus?.trim().toLowerCase();

  // Date validation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkIn = new Date(checkInDate);
  checkIn.setHours(0, 0, 0, 0);
  
  const checkOut = new Date(checkOutDate);
  checkOut.setHours(0, 0, 0, 0);

  // Can check in on or after check-in date
  const canCheckIn = normalizedStatus === "confirmed" && today >= checkIn;
  
  // Can check out after check-in date and on or before check-out date
  const canCheckOut = normalizedStatus === "checked_in" && today > checkIn && today <= checkOut;

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await guestCheckIn(bookingId);
      if (result.success) {
        setCurrentStatus("checked_in");
      } else {
        setError(result.error || "Failed to check in");
      }
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await guestCheckOut(bookingId);
      if (result.success) {
        setCurrentStatus("completed");
      } else {
        setError(result.error || "Failed to check out");
      }
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  if (normalizedStatus === "completed") {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
        <svg className="w-8 h-8 text-purple-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-semibold text-purple-700">Stay Completed</p>
        <p className="text-xs text-purple-500 mt-1">You have checked out</p>
      </div>
    );
  }

  // If not confirmed or checked_in status, don't show anything
  if (normalizedStatus !== "confirmed" && normalizedStatus !== "checked_in") {
    return null;
  }

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 p-4">
      {/* Error */}
      {error && (
        <div className="mb-3 flex items-start gap-2 p-2.5 bg-red-100 rounded-lg border border-red-200">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-red-700">{error}</span>
        </div>
      )}

      {/* Current Status */}
      {normalizedStatus === "checked_in" && (
        <div className="mb-3 flex items-center gap-2 p-2.5 bg-blue-100 rounded-lg border border-blue-200">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-medium text-blue-700">You are checked in</span>
        </div>
      )}

      {/* Check In Section */}
      {normalizedStatus === "confirmed" && (
        <div>
          {canCheckIn ? (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Checking In...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Check In
                </>
              )}
            </button>
          ) : (
            <div className="text-xs text-white/80 text-center p-2 bg-white/10 rounded-lg">
              Check-in available on {checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>
      )}

      {/* Check Out Section */}
      {normalizedStatus === "checked_in" && (
        <div>
          {canCheckOut ? (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white text-green-600 font-medium rounded-lg hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Checking Out...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Check Out
                </>
              )}
            </button>
          ) : (
            <div className="text-xs text-white/80 text-center p-2 bg-white/10 rounded-lg">
              {today <= checkIn 
                ? "Cannot check out before check-in date"
                : "Check-out date has passed"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}