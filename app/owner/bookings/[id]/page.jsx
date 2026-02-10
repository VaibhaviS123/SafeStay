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

  // Fetch booking with simple query
  const { data: bookingData, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (bookingError || !bookingData) {
    redirect("/owner/bookings");
  }

  // Fetch property details separately
  const { data: propertyData, error: propertyError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", bookingData.property_id)
    .single();

 

  // Fetch guest details separately
  const { data: guestData, error: guestError } = await supabase
    .from("users")
    .select("id, full_name, role, created_at")
    .eq("id", bookingData.user_id)
    .single();



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
  const totalPrice = bookingData.total_price || calculatedTotal;
  const getStatusColor = (status) => {
    const normalized = status?.trim().toLowerCase();
    switch (normalized) {
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-300";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const isPending = bookingData.status?.trim().toLowerCase() === "pending";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      <Navbar user={userData} />

      <div className="flex">
        <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/owner/bookings"
                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all"
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Booking Details
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Booking ID: {id.slice(0, 8)}...
                </p>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          {isPending && (
            <div className="mb-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <svg
                  className="w-8 h-8"
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
                <h2 className="text-2xl font-bold">Action Required</h2>
              </div>
              <p className="text-white/90 text-lg">
                This booking is awaiting your approval. Please review the details below and take action.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Guest Information */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-indigo-600"
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
                  Guest Information
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {guestData?.full_name?.charAt(0)?.toUpperCase() || "G"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {guestData?.full_name || "Guest"}
                    </h3>
                    <p className="text-gray-500 capitalize">
                      {guestData?.role || "guest"}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      User ID: {bookingData.user_id?.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-indigo-600"
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
                  Property Details
                </h2>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {propertyData?.name || "Property"}
                  </h3>
                  <p className="text-gray-600">
                    {propertyData?.address && `${propertyData.address}, `}
                    {propertyData?.area && `${propertyData.area}, `}
                    {propertyData?.city}
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {propertyData?.bedrooms && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-indigo-600">
                          {propertyData.bedrooms}
                        </p>
                        <p className="text-xs text-gray-500">Bedrooms</p>
                      </div>
                    )}
                    {propertyData?.bathrooms && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-indigo-600">
                          {propertyData.bathrooms}
                        </p>
                        <p className="text-xs text-gray-500">Bathrooms</p>
                      </div>
                    )}
                    {propertyData?.max_guests && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-indigo-600">
                          {propertyData.max_guests}
                        </p>
                        <p className="text-xs text-gray-500">Max Guests</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-indigo-600"
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
                  Stay Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Check-in</p>
                      <p className="font-bold text-gray-900">
                        {formatDate(bookingData.check_in)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Check-out</p>
                      <p className="font-bold text-gray-900">
                        {formatDate(bookingData.check_out)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Number of Guests</p>
                      <p className="font-bold text-gray-900">{bookingData.guests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Duration</p>
                      <p className="font-bold text-gray-900">
                        {nights} {nights === 1 ? "night" : "nights"}
                      </p>
                    </div>
                  </div>
                  {bookingData.special_requests && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-1">Special Requests</p>
                      <p className="text-gray-900">{bookingData.special_requests}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Booking Status</h3>
                <div
                  className={`px-4 py-2 rounded-lg text-center font-semibold border-2 ${getStatusColor(
                    bookingData.status
                  )}`}
                >
                  {bookingData.status.charAt(0).toUpperCase() + bookingData.status.slice(1)}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Created: {new Date(bookingData.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Pricing Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing</h3>
                <div className="space-y-3">
                  {pricePerNight > 0 ? (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>
                          ${pricePerNight.toLocaleString()} × {nights} {nights === 1 ? "night" : "nights"}
                        </span>
                        <span className="font-semibold">
                          ${calculatedTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Total</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ${totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-2">Price not available</p>
                      <p className="text-sm text-gray-400">
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
    </div>
  );
}