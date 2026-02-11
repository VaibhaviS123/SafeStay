import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/dashboard/Navbar";
import PropertyCard from "@/components/properties/PropertyCard";

export default async function OwnerDashboard() {
  const supabase = await createClient();

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

  // Fetch properties with images
  const { data: properties, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        image_url,
        display_order
      )
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  // Process properties to add main image
  const processedProperties = properties?.map(prop => ({
    ...prop,
    image_url: prop.property_images?.[0]?.image_url || prop.image_url || null
  })) || [];

  // Calculate total properties
  const totalProperties = processedProperties.length;

  // Get bookings for owner's properties
  const propertyIds = properties?.map((p) => p.id) || [];

  const { data: bookings, count: totalBookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("*, properties(*), users(*)", { count: "exact" })
    .in("property_id", propertyIds)
    .order("created_at", { ascending: false });

  const pendingBookings = bookings?.filter((b) => b.status === "pending").length || 0;
  const confirmedBookings = bookings?.filter((b) => b.status === "confirmed").length || 0;
  const completedBookings = bookings?.filter((b) => b.status === "completed").length || 0;

  // Get recent pending bookings for display
  const recentPendingBookings = bookings?.filter((b) => b.status === "pending").slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* ── Hero Welcome Banner ── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12 text-white shadow-xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white/5 rounded-full translate-y-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-purple-200 text-sm font-medium mb-1 tracking-wide uppercase">Property Owner</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{userData?.full_name} 👋</h1>
              <p className="text-purple-200 text-sm md:text-base">
                You have <span className="text-white font-semibold">{totalProperties} {totalProperties === 1 ? 'property' : 'properties'}</span> with{' '}
                <span className="text-white font-semibold">{pendingBookings} pending</span> booking requests.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 flex-wrap">
              {[
                { label: 'Properties', value: totalProperties, icon: '🏠', href: '#properties' },
                { label: 'All Bookings', value: totalBookings || 0, icon: '📋', href: '#bookings' },
                { label: 'Pending', value: pendingBookings, icon: '⏳', href: '#bookings' },
              ].map(stat => (
                <a
                  key={stat.label}
                  href={stat.href}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 text-center min-w-[90px] hover:bg-white/20 transition-all cursor-pointer group"
                >
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-purple-200 text-xs font-medium">{stat.label}</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quick Nav Section ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              href: '#properties',
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ),
              label: 'My Properties',
              sublabel: `${totalProperties} ${totalProperties === 1 ? 'property' : 'properties'}`,
              color: 'from-indigo-500 to-purple-600',
              light: 'bg-indigo-50 text-indigo-600',
            },
            {
              href: '#bookings',
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ),
              label: 'Booking Requests',
              sublabel: `${pendingBookings} pending approval`,
              color: 'from-orange-500 to-pink-600',
              light: 'bg-orange-50 text-orange-600',
            },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.light} transition-transform group-hover:scale-110`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-base">{item.label}</div>
                <div className="text-gray-400 text-sm mt-0.5">{item.sublabel}</div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </section>

        {/* ── Booking Requests Section ── */}
        <section id="bookings" className="scroll-mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Booking Requests</h2>
              <p className="text-sm text-gray-500 mt-1">
                {pendingBookings > 0 
                  ? `${pendingBookings} ${pendingBookings === 1 ? 'booking' : 'bookings'} awaiting your response`
                  : 'All caught up! No pending requests'}
              </p>
            </div>
            <Link
              href="/owner/bookings"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition text-sm font-medium inline-flex items-center gap-2"
            >
              View all bookings
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                id: 'total',
                label: 'Total Bookings',
                count: totalBookings || 0,
                color: 'blue',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                ),
              },
              {
                id: 'pending',
                label: 'Pending',
                count: pendingBookings,
                color: 'orange',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                id: 'confirmed',
                label: 'Confirmed',
                count: confirmedBookings,
                color: 'green',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ),
              },
              {
                id: 'completed',
                label: 'Completed',
                count: completedBookings,
                color: 'purple',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((tab) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', iconBg: 'bg-blue-50' },
                green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', iconBg: 'bg-green-50' },
                orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', iconBg: 'bg-orange-50' },
                purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', iconBg: 'bg-purple-50' },
              }[tab.color];

              return (
                <div
                  key={tab.id}
                  className={`${colorClasses.bg} rounded-xl p-6 shadow-sm border ${colorClasses.border}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className={`text-3xl font-bold ${colorClasses.text}`}>{tab.count}</div>
                      <div className="text-sm text-gray-600 mt-1 font-medium">{tab.label}</div>
                    </div>
                    <div className={`${colorClasses.iconBg} p-3 rounded-lg ${colorClasses.text}`}>
                      {tab.icon}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Pending Bookings */}
          {recentPendingBookings.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {recentPendingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {booking.users?.full_name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {booking.users?.full_name || "Unknown Guest"}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {booking.properties?.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-gray-500 mb-0.5">Check-in</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(booking.check_in).toLocaleDateString("en-US", { 
                              month: "short", 
                              day: "numeric",
                              year: "numeric" 
                            })}
                          </p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-gray-500 mb-0.5">Check-out</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(booking.check_out).toLocaleDateString("en-US", { 
                              month: "short", 
                              day: "numeric",
                              year: "numeric" 
                            })}
                          </p>
                        </div>
                        <Link
                          href={`/owner/bookings/${booking.id}`}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition text-sm font-medium whitespace-nowrap"
                        >
                          Review
                        </Link>
                      </div>
                    </div>

                    {/* Mobile date display */}
                    <div className="mt-3 flex gap-4 sm:hidden text-xs text-gray-600">
                      <div>
                        <span className="text-gray-500">Check-in: </span>
                        <span className="font-medium">
                          {new Date(booking.check_in).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric" 
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Check-out: </span>
                        <span className="font-medium">
                          {new Date(booking.check_out).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric" 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
              <p className="text-gray-500 text-sm">New booking requests will appear here</p>
            </div>
          )}
        </section>

        {/* ── Divider ── */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-6 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Your Properties
            </span>
          </div>
        </div>

        {/* ── Properties Section ── */}
        <section id="properties" className="scroll-mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
              <p className="text-sm text-gray-500 mt-1">
                {totalProperties > 0 
                  ? `Manage your ${totalProperties} ${totalProperties === 1 ? 'property' : 'properties'}`
                  : 'Start earning by listing your first property'}
              </p>
            </div>
            <Link
              href="/owner/properties/new"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Property
            </Link>
          </div>

          {processedProperties && processedProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {processedProperties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  isOwner={true} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                Start earning by adding your first property to the platform
              </p>
              <Link
                href="/owner/properties/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Property
              </Link>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}