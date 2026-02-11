import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/dashboard/Navbar";
import BookingActions from "@/components/bookings/BookingActions";
import OwnerCheckInOutActions from "@/components/bookings/OwnerCheckInOutActions";

export default async function BookingDetailsPage({ params }) {
  const supabase = await createClient();
  
  // Await params in Next.js 15+
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user data
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "owner") {
    redirect("/login");
  }

  // Fetch booking data first
  const { data: bookingData, error: bookingError } = await supabase
    .from("bookings")
    .select("*, properties (*)")
    .eq("id", id)
    .single();

  if (bookingError || !bookingData) {
    console.error("Booking fetch error:", bookingError);
    redirect("/owner/bookings");
  }

  // Verify owner owns this property
  if (bookingData.properties?.owner_id !== user.id) {
    redirect("/owner/bookings");
  }

  // Fetch guest data from users table (emails are now synced)
  const { data: guestData, error: guestError } = await supabase
    .from("users")
    .select("id, full_name, email, role, created_at")
    .eq("id", bookingData.user_id)
    .single();

  // Detailed logging for debugging
  console.log("=== GUEST DATA FETCH DEBUG ===");
  console.log("Booking user_id:", bookingData.user_id);
  console.log("Guest data:", guestData);
  console.log("Guest error:", guestError);
  console.log("Email value:", guestData?.email);
  
  // Create final guest data with fallback
  const finalGuestData = guestData || {
    id: bookingData.user_id,
    full_name: "Guest User",
    email: "Email not available",
    role: "guest",
    created_at: bookingData.created_at
  };
  
  console.log("Final guest data:", finalGuestData);

  const propertyData = bookingData.properties;

  // Helper functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights(bookingData.check_in, bookingData.check_out);
  
  // Calculate total price - with proper fallback
  const pricePerNight = propertyData?.price_per_night || 0;
  const calculatedTotal = pricePerNight * nights;
  const totalPrice = bookingData.total_price || bookingData.total_amount || calculatedTotal;
  
  const getStatusColor = (status) => {
    const normalized = status?.trim().toLowerCase();
    switch (normalized) {
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-300";
      case "checked_in":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusDisplay = (status) => {
    const normalized = status?.trim().toLowerCase();
    switch (normalized) {
      case "checked_in":
        return "Checked In";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const isPending = bookingData.status?.trim().toLowerCase() === "pending";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/owner/bookings"
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md border border-gray-200 transition-all"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Booking Details
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Review and manage this booking
              </p>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {isPending && (
          <div className="mb-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold">Action Required</h2>
            </div>
            <p className="text-white/90">
              This booking is awaiting your approval. Please review the details below and take action.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                Guest Information
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-2xl">
                    {finalGuestData?.full_name?.charAt(0)?.toUpperCase() || "G"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {finalGuestData?.full_name || "Guest"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {finalGuestData?.email || "No email available"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Member since {finalGuestData?.created_at ? new Date(finalGuestData.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                Property Details
              </h2>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">
                  {propertyData?.name || "Property"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {propertyData?.address && `${propertyData.address}, `}
                  {propertyData?.area && `${propertyData.area}, `}
                  {propertyData?.city}
                </p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {propertyData?.bedrooms && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xl font-bold text-indigo-600">
                        {propertyData.bedrooms}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Bedrooms</p>
                    </div>
                  )}
                  {propertyData?.bathrooms && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xl font-bold text-indigo-600">
                        {propertyData.bathrooms}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Bathrooms</p>
                    </div>
                  )}
                  {propertyData?.max_guests && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xl font-bold text-indigo-600">
                        {propertyData.max_guests}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Max Guests</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                Stay Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Check-in</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatDate(bookingData.check_in)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Check-out</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatDate(bookingData.check_out)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Number of Guests</p>
                    <p className="font-semibold text-gray-900">{bookingData.guests}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="font-semibold text-gray-900">
                      {nights} {nights === 1 ? "night" : "nights"}
                    </p>
                  </div>
                </div>
                {bookingData.special_requests && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Special Requests</p>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      {bookingData.special_requests}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Booking Status</h3>
              <div
                className={`px-4 py-2.5 rounded-lg text-center font-semibold border-2 ${getStatusColor(
                  bookingData.status
                )}`}
              >
                {getStatusDisplay(bookingData.status)}
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Created {new Date(bookingData.created_at).toLocaleDateString("en-US", { 
                  month: "short", 
                  day: "numeric",
                  year: "numeric" 
                })}
              </p>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Pricing Details</h3>
              <div className="space-y-3">
                {pricePerNight > 0 ? (
                  <>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        ₹{pricePerNight.toLocaleString()} × {nights} {nights === 1 ? "night" : "nights"}
                      </span>
                      <span className="font-semibold">
                        ₹{calculatedTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-900">Total Amount</span>
                        <span className="text-2xl font-bold text-indigo-600">
                          ₹{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-2">Price not available</p>
                    <p className="text-xs text-gray-400">
                      Please set a price for this property
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            {isPending && (
              <BookingActions bookingId={id} />
            )}

            {/* Check-In/Check-Out Card */}
            {(bookingData.status === "confirmed" || bookingData.status === "checked_in") && (
              <OwnerCheckInOutActions 
                bookingId={id}
                status={bookingData.status}
                checkInDate={bookingData.check_in}
                checkOutDate={bookingData.check_out}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}