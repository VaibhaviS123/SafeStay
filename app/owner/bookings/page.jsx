import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/dashboard/Navbar";

export default async function OwnerBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "owner") redirect("/login");

  // Fetch properties for this owner
  const { data: properties } = await supabase
    .from("properties")
    .select("id")
    .eq("owner_id", user.id);

  const propertyIds = properties?.map((p) => p.id) || [];

  let bookings = [];
  if (propertyIds.length > 0) {
    const result = await supabase
      .from("bookings")
      .select(`
        *,
        properties!bookings_property_id_fkey (
          id, name, address, city, area, price_per_night
        ),
        users!bookings_user_id_fkey (
          id, full_name, role
        )
      `)
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false });

    bookings = result.data || [];
  }

  const normalizeStatus = (s) => s?.trim().toLowerCase();

  // ✅ All 5 status groups including checked_in
  const pendingBookings   = bookings.filter((b) => normalizeStatus(b.status) === "pending");
  const confirmedBookings = bookings.filter((b) => normalizeStatus(b.status) === "confirmed");
  const checkedInBookings = bookings.filter((b) => normalizeStatus(b.status) === "checked_in");
  const completedBookings = bookings.filter((b) => normalizeStatus(b.status) === "completed");
  const cancelledBookings = bookings.filter((b) => normalizeStatus(b.status) === "cancelled");

  const getStatusColor = (status) => {
    switch (normalizeStatus(status)) {
      case "pending":    return "bg-orange-100 text-orange-800 border-orange-200";
      case "confirmed":  return "bg-green-100 text-green-800 border-green-200";
      case "checked_in": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":  return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":  return "bg-red-100 text-red-800 border-red-200";
      default:           return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (normalizeStatus(status)) {
      case "checked_in": return "Checked In";
      case "pending":    return "Pending";
      case "confirmed":  return "Confirmed";
      case "completed":  return "Completed";
      case "cancelled":  return "Cancelled";
      default:           return status || "Unknown";
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const calculateNights = (checkIn, checkOut) =>
    Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

  const BookingCard = ({ booking }) => {
    const nights = calculateNights(booking.check_in, booking.check_out);
    const isPending   = normalizeStatus(booking.status) === "pending";
    const isCheckedIn = normalizeStatus(booking.status) === "checked_in";
    const totalPrice  = booking.total_price ||
      (booking.properties?.price_per_night ? booking.properties.price_per_night * nights : null);

    return (
      <div className={`bg-white rounded-xl shadow-md border-2 hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isPending ? "border-orange-200" : isCheckedIn ? "border-blue-300" : "border-gray-200"
      }`}>

        {/* Status Banner */}
        {isPending && (
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-4 py-2">
            <p className="text-white text-sm font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Action Required — Pending Approval
            </p>
          </div>
        )}
        {isCheckedIn && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2">
            <p className="text-white text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse inline-block"></span>
              Guest Currently Staying
              {booking.checked_in_at && (
                <span className="font-normal opacity-90">
                  · Checked in {formatDate(booking.checked_in_at)}
                </span>
              )}
            </p>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md ${
                  isCheckedIn ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                             : "bg-gradient-to-br from-indigo-500 to-purple-600"
                }`}>
                  <span className="text-white font-bold text-lg">
                    {booking.users?.full_name?.charAt(0)?.toUpperCase() || "G"}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {booking.users?.full_name || "Guest"}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">{booking.users?.role || "guest"}</p>
                </div>
              </div>
              <p className="text-gray-700 font-semibold text-base mb-1">{booking.properties?.name}</p>
              <p className="text-sm text-gray-500">
                {booking.properties?.area && `${booking.properties.area}, `}
                {booking.properties?.city}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
              {getStatusLabel(booking.status)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Check-in</p>
              <p className="font-semibold text-gray-900 text-sm">{formatDate(booking.check_in)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Check-out</p>
              <p className="font-semibold text-gray-900 text-sm">{formatDate(booking.check_out)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Guests</p>
              <p className="font-semibold text-gray-900">{booking.guests}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ₹{totalPrice?.toLocaleString() || "TBD"}
              </p>
              <p className="text-xs text-gray-500">
                {nights} {nights === 1 ? "night" : "nights"}
                {booking.properties?.price_per_night && ` × ₹${booking.properties.price_per_night}`}
              </p>
            </div>
            <Link
              href={`/owner/bookings/${booking.id}`}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-medium text-sm shadow-md hover:shadow-lg"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const BookingSection = ({ title, bookings, icon, gradient, emptyMessage }) => (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 ${gradient} rounded-xl flex items-center justify-center`}>{icon}</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{bookings.length} {bookings.length === 1 ? "booking" : "bookings"}</p>
        </div>
      </div>
      {bookings.length > 0 ? (
        <div className="grid gap-4">
          {bookings.map((b) => <BookingCard key={b.id} booking={b} />)}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-xl">
          <p className="text-gray-500 font-medium">{emptyMessage}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      <Navbar user={userData} />
      <div className="flex">
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Link href="/owner/dashboard" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Booking Management
              </h1>
            </div>
            <p className="text-gray-600 text-lg ml-14">Review and manage all booking requests</p>
          </div>

          {/* Stats — now 5 cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 text-center">
              <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
              <p className="text-sm text-gray-500 mt-1">Total</p>
            </div>
            <div className="bg-orange-50 rounded-xl shadow-md p-4 border-2 border-orange-200 text-center">
              <p className="text-3xl font-bold text-orange-600">{pendingBookings.length}</p>
              <p className="text-sm text-orange-700 mt-1">Pending</p>
            </div>
            <div className="bg-green-50 rounded-xl shadow-md p-4 border-2 border-green-200 text-center">
              <p className="text-3xl font-bold text-green-600">{confirmedBookings.length}</p>
              <p className="text-sm text-green-700 mt-1">Confirmed</p>
            </div>
            <div className="bg-blue-50 rounded-xl shadow-md p-4 border-2 border-blue-200 text-center">
              <p className="text-3xl font-bold text-blue-600">{checkedInBookings.length}</p>
              <p className="text-sm text-blue-700 mt-1">Checked In</p>
            </div>
            <div className="bg-purple-50 rounded-xl shadow-md p-4 border-2 border-purple-200 text-center">
              <p className="text-3xl font-bold text-purple-600">{completedBookings.length}</p>
              <p className="text-sm text-purple-700 mt-1">Completed</p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            <BookingSection title="Pending Approval" bookings={pendingBookings}
              gradient="bg-gradient-to-br from-orange-500 to-yellow-600"
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              emptyMessage="No pending bookings" />

            <BookingSection title="Confirmed Bookings" bookings={confirmedBookings}
              gradient="bg-gradient-to-br from-green-500 to-emerald-600"
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              emptyMessage="No confirmed bookings" />

            {/* ✅ This section was completely missing — guests were disappearing after check-in */}
            <BookingSection title="Currently Checked In" bookings={checkedInBookings}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>}
              emptyMessage="No guests currently checked in" />

            <BookingSection title="Completed Stays" bookings={completedBookings}
              gradient="bg-gradient-to-br from-purple-500 to-pink-600"
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              emptyMessage="No completed stays" />

            {cancelledBookings.length > 0 && (
              <BookingSection title="Cancelled Bookings" bookings={cancelledBookings}
                gradient="bg-gradient-to-br from-red-500 to-pink-600"
                icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                emptyMessage="No cancelled bookings" />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}