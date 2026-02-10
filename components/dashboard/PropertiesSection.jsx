"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PropertiesSection({ properties, cities, areas }) {
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  useEffect(() => {
    filterProperties();
  }, [searchQuery, selectedCity, selectedArea, properties]);

  const filterProperties = () => {
    let filtered = [...properties];

    // Filter by search query (name, city, area, description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          property.name?.toLowerCase().includes(query) ||
          property.city?.toLowerCase().includes(query) ||
          property.area?.toLowerCase().includes(query) ||
          property.description?.toLowerCase().includes(query) ||
          property.address?.toLowerCase().includes(query)
      );
    }

    // Filter by selected city
    if (selectedCity) {
      filtered = filtered.filter((property) => property.city === selectedCity);
    }

    // Filter by selected area
    if (selectedArea) {
      filtered = filtered.filter((property) => property.area === selectedArea);
    }

    setFilteredProperties(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedArea("");
  };

  const hasActiveFilters = searchQuery || selectedCity || selectedArea;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse Properties</h2>
        <p className="text-gray-600">Find your perfect stay</p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 p-5 bg-gray-50 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Properties
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, city, or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="">All Cities</option>
              {cities.sort().map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Area Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Area
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="">All Areas</option>
              {areas.sort().map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters & Clear Button */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  Search: "{searchQuery}"
                </span>
              )}
              {selectedCity && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  City: {selectedCity}
                </span>
              )}
              {selectedArea && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  Area: {selectedArea}
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredProperties.length}</span>{" "}
          {filteredProperties.length === 1 ? "property" : "properties"}
        </p>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition group"
            >
              {/* Property Image */}
              <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                {property.image_url ? (
                  <img
                    src={property.image_url}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg
                      className="w-16 h-16 text-white opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                )}
                
                {/* Status Badge */}
                {property.status && (
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold shadow-lg">
                      Available
                    </span>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                  {property.name}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm line-clamp-1">
                    {property.area}, {property.city}
                  </span>
                </div>

                {/* Description */}
                {property.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {property.description}
                  </p>
                )}

                {/* Property Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.bedrooms && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {property.bedrooms} Bed
                    </span>
                  )}
                  {property.bathrooms && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                      {property.bathrooms} Bath
                    </span>
                  )}
                  {property.property_type && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium capitalize">
                      {property.property_type}
                    </span>
                  )}
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
             {property.price_per_night ? (
  <div>
    <span className="text-2xl font-bold text-gray-900">
      ₹{property.price_per_night}
    </span>
    <span className="text-gray-500 text-sm">/night</span>
  </div>
) : (
  <div className="text-gray-500 text-sm">Contact for pricing</div>
)}
                  <Link
                    href={`/guest/properties/${property.id}`}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition text-sm shadow-md hover:shadow-lg"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-6">
            {hasActiveFilters
              ? "Try adjusting your search filters to see more results."
              : "No properties available at the moment."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}