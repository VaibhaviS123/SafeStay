import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/dashboard/Navbar";
import DashboardCard from "@/components/dashboard/DashboardCard";
import PropertiesSection from "@/components/dashboard/PropertiesSection";
import GuestCheckInOutActions from "@/components/bookings/GuestCheckInOutActions";

export default async function GuestDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();
  if (userData?.role !== "guest") {
    redirect("/login");
  }
  const { data: bookingsData, count, error } = await supabase
    .from("bookings")
    .select(`
      *,
      properties (
        *,
        property_images (
          image_url,
          display_order
        )
      )
    `, { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  let bookings = [];
  let totalBookings = 0;
  if (error) {
  } else {
    bookings = bookingsData || [];
    totalBookings = count || 0;
  }
  const activeBookings = bookings?.filter((b) => b.status === "confirmed").length || 0;
  const pendingBookings = bookings?.filter((b) => b.status === "pending").length || 0;
  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select(`
      *,
      property_images (
        image_url,
        display_order
      )
    `)
    .order("created_at", { ascending: false });
  const processedProperties = properties?.length > 0
    ? properties.map(prop => ({
        ...prop,
        image_url: prop.property_images?.[0]?.image_url || prop.image_url || null
      }))
    : [];
  const cities = [...new Set(processedProperties.map((p) => p.city).filter(Boolean))];
  const areas = [...new Set(processedProperties.map((p) => p.area).filter(Boolean))];
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userData} />
      <main className="w-full p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userData?.full_name}! 👋
            </h1>
            <p className="text-gray-600">Manage your bookings and discover new properties</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <DashboardCard
              title="Total Bookings"
              value={totalBookings || 0}
              icon={
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
              color="indigo"
            />
            <DashboardCard
              title="Active Bookings"
              value={activeBookings}
              icon={
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              color="green"
            />
            <DashboardCard
              title="Pending Approval"
              value={pendingBookings}
              icon={
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              color="orange"
            />
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
              {bookings && bookings.length > 0 && (
                <span className="text-sm text-gray-500">
                  {bookings.length} total {bookings.length === 1 ? 'booking' : 'bookings'}
                </span>
              )}
            </div>
            {bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const checkIn = new Date(booking.check_in);
                  const checkOut = new Date(booking.check_out);
                  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                  const showCheckInOut =
                    booking.status === "confirmed" || booking.status === "checked_in";
                  return (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          {booking.properties?.image_url || booking.properties?.property_images?.[0]?.image_url ? (
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                              <img
                                src={booking.properties?.image_url || booking.properties?.property_images?.[0]?.image_url}
                                alt={booking.properties?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                              {booking.properties?.name}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {booking.properties?.city && booking.properties?.area
                                  ? `${booking.properties.area}, ${booking.properties.city}`
                                  : booking.properties?.location || 'Location not specified'}
                              </p>
                              <p className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {checkIn.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                                {' → '}
                                {checkOut.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                                {' '}({nights} {nights === 1 ? 'night' : 'nights'})
                              </p>
                              {booking.guests && (
                                <p className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                  {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "pending"
                                ? "bg-orange-100 text-orange-700"
                                : booking.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : booking.status === "checked_in"
                                ? "bg-blue-100 text-blue-700"
                                : booking.status === "completed"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {booking.status === "checked_in"
                              ? "Checked In"
                              : booking.status
                              ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
                              : 'Pending'}
                          </span>
                          {(booking.total_price || booking.total_amount) && (
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                ₹{(booking.total_price || booking.total_amount).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">Total Price</p>
                            </div>
                          )}
                          {showCheckInOut && (
                            <GuestCheckInOutActions
                              bookingId={booking.id}
                              status={booking.status}
                              checkInDate={booking.check_in}
                              checkOutDate={booking.check_out}
                            />
                          )}
                        </div>
                      </div>
                      {booking.special_requests && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Special Requests:</span> {booking.special_requests}
                          </p>
                        </div>
                      )}
                      {(booking.checked_in_at || booking.checked_out_at) && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-6 text-sm text-gray-500">
                          {booking.checked_in_at && (
                            <p>
                              <span className="font-semibold text-blue-600">Checked in:</span>{" "}
                              {new Date(booking.checked_in_at).toLocaleString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          )}
                          {booking.checked_out_at && (
                            <p>
                              <span className="font-semibold text-purple-600">Checked out:</span>{" "}
                              {new Date(booking.checked_out_at).toLocaleString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-20 h-20 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-500">Browse properties below to make your first booking!</p>
              </div>
            )}
          </div>
          <PropertiesSection
            properties={processedProperties}
            cities={cities}
            areas={areas}
          />
        </div>
      </main>
    </div>
  );
}