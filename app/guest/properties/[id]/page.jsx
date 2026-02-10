import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/dashboard/Navbar";
import Link from "next/link";
import BookingForm from "@/components/BookingForm";

export default async function PropertyDetailPage({ params }) {
  const supabase = await createClient();
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

  if (userData?.role !== "guest") {
    redirect("/login");
  }

  // Get property details
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select(`
      *,
      property_images (
        image_url,
        display_order
      )
    `)
    .eq("id", id)
    .single();

  if (propertyError || !property) {
    redirect("/guest/dashboard");
  }

  // Sort images by display_order
  const sortedImages = property.property_images?.sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0)
  ) || [];

  const mainImage = sortedImages[0]?.image_url || property.image_url;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userData} />

      <main className="w-full p-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link
            href="/guest/dashboard"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Properties
          </Link>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Property Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {/* Main Image */}
              <div className="relative h-96 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl overflow-hidden">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-24 h-24 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Additional Images Grid */}
              <div className="grid grid-cols-2 gap-4">
                {sortedImages.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="relative h-44 bg-gray-200 rounded-xl overflow-hidden">
                    <img
                      src={img.image_url}
                      alt={`${property.name} ${idx + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {sortedImages.length <= 1 && (
                  <div className="col-span-2 flex items-center justify-center h-44 bg-gray-100 rounded-xl text-gray-400">
                    No additional images
                  </div>
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="p-6 border-t border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Property Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{property.area}, {property.city}</span>
                    </div>
                  </div>

                  {/* Property Features */}
                  <div className="flex flex-wrap gap-4">
                    {property.bedrooms && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="font-medium">{property.bedrooms} Bedrooms</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        <span className="font-medium">{property.bathrooms} Bathrooms</span>
                      </div>
                    )}
                    {property.max_guests && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="font-medium">Up to {property.max_guests} Guests</span>
                      </div>
                    )}
                    {property.property_type && (
                      <div className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium capitalize">
                        {property.property_type}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {property.description && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3">About this property</h2>
                      <p className="text-gray-700 leading-relaxed">{property.description}</p>
                    </div>
                  )}

                  {/* Address */}
                  {property.address && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Location</h2>
                      <p className="text-gray-700">{property.address}</p>
                    </div>
                  )}

                  {/* Amenities */}
                  {property.amenities && property.amenities.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Amenities</h2>
                      <div className="grid grid-cols-2 gap-3">
                        {property.amenities.map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-700">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safety Rules */}
                  {property.safety_rules && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Safety & Rules</h2>
                      <p className="text-gray-700 leading-relaxed">{property.safety_rules}</p>
                    </div>
                  )}
                </div>

                {/* Right Column - Booking Card */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-gray-900">
                        ₹{property.price_per_night?.toLocaleString()}
                      </div>
                      <div className="text-gray-600">per night</div>
                    </div>

                    <BookingForm propertyId={property.id} pricePerNight={property.price_per_night} />

                    <div className="mt-6 pt-6 border-t border-gray-300">
                      <p className="text-sm text-gray-600 text-center">
                        You won't be charged yet
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}