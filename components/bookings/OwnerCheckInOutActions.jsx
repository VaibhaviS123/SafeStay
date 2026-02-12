"use client";

export default function OwnerCheckInOutActions({ bookingId, status, checkInDate, checkOutDate }) {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === "completed") {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
        <svg className="w-8 h-8 text-purple-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-semibold text-purple-700">Stay Completed</p>
        <p className="text-xs text-purple-500 mt-1">Guest has checked out</p>
      </div>
    );
  }

  // Show read-only status for owners
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Check-In / Check-Out Status
      </h3>

      {/* Current Status Badge */}
      <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        {normalizedStatus === "confirmed" && (
          <>
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-blue-700">Booking Confirmed - Awaiting Guest Check-In</span>
          </>
        )}
        {normalizedStatus === "checked_in" && (
          <>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-green-700">Guest is Currently Checked In</span>
          </>
        )}
      </div>

      {/* Date Info */}
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Check-in Date</span>
          <span className="font-medium text-gray-900">
            {new Date(checkInDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Check-out Date</span>
          <span className="font-medium text-gray-900">
            {new Date(checkOutDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Info Message */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-sm text-amber-700">
          <p className="font-medium mb-1">Guest Self Check-In/Out Only</p>
          <p className="text-xs text-amber-600">Guests will check themselves in and out on their scheduled dates.</p>
        </div>
      </div>
    </div>
  );
}