import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/dashboard/Navbar";
import PropertiesSection from "@/components/dashboard/PropertiesSection";
import BookingsTabs from "@/components/dashboard/BookingsTabs";

export default async function GuestDashboard() {
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

  if (userData?.role !== "guest") redirect("/login");

  const { data: bookingsData, error } = await supabase
    .from("bookings")
    .select(`
      *,
      properties (
        *,
        property_images (image_url, display_order)
      ),
      reviews (id)
    `, { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const bookings = error ? [] : (bookingsData || []);

  const activeBookings    = bookings.filter(b => b.status === "confirmed" || b.status === "checked_in");
  const pendingBookings   = bookings.filter(b => b.status === "pending");
  const completedBookings = bookings.filter(b => b.status === "completed");
  const cancelledBookings = bookings.filter(b => b.status === "cancelled");

  const { data: properties } = await supabase
    .from("properties")
    .select(`*, property_images (image_url, display_order)`)
    .order("created_at", { ascending: false });

  const processedProperties = (properties || []).map(prop => ({
    ...prop,
    image_url: prop.property_images?.[0]?.image_url || prop.image_url || null,
  }));

  const cities = [...new Set(processedProperties.map(p => p.city).filter(Boolean))];
  const areas  = [...new Set(processedProperties.map(p => p.area).filter(Boolean))];

  const totalBookings = bookings.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* ── Hero Welcome Banner ── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 md:p-12 text-white shadow-xl">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white/5 rounded-full translate-y-1/2" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1 tracking-wide uppercase">Welcome back</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{userData?.full_name} 👋</h1>
              <p className="text-blue-200 text-sm md:text-base">
                You have <span className="text-white font-semibold">{activeBookings.length} active</span> and{' '}
                <span className="text-white font-semibold">{pendingBookings.length} pending</span> bookings.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 flex-wrap">
              {[
                { label: 'Total Stays', value: totalBookings, icon: '🏠' },
                { label: 'Completed', value: completedBookings.length, icon: '✅' },
                { label: 'Pending', value: pendingBookings.length, icon: '⏳' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 text-center min-w-[90px]">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-blue-200 text-xs font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Quick Nav Section - Only Properties and Bookings ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              href: '#properties',
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ),
              label: 'Browse Properties',
              sublabel: `${processedProperties.length} available`,
              color: 'from-blue-500 to-blue-600',
              light: 'bg-blue-50 text-blue-600',
            },
            {
              href: '#bookings',
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ),
              label: 'My Bookings',
              sublabel: `${totalBookings} total`,
              color: 'from-emerald-500 to-emerald-600',
              light: 'bg-emerald-50 text-emerald-600',
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

        {/* ── Properties Section ── */}
        <section id="properties" className="scroll-mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available Properties</h2>
              <p className="text-sm text-gray-500 mt-1">Find your perfect stay</p>
            </div>
            <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full">
              {processedProperties.length} {processedProperties.length === 1 ? 'property' : 'properties'}
            </span>
          </div>

          <PropertiesSection
            properties={processedProperties}
            cities={cities}
            areas={areas}
          />
        </section>

        {/* ── Divider ── */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-6 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Your Bookings
            </span>
          </div>
        </div>

        {/* ── Bookings Section ── */}
        <section id="bookings" className="scroll-mt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
            <p className="text-sm text-gray-500 mt-1">View and manage your reservations</p>
          </div>

          <BookingsTabs
            activeBookings={activeBookings}
            pendingBookings={pendingBookings}
            completedBookings={completedBookings}
            cancelledBookings={cancelledBookings}
          />
        </section>

      </main>
    </div>
  );
}