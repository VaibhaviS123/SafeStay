"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import PropertyCardActions from "./PropertyCardActions";

export default function PropertyCard({ property, isOwner = false }) {
  const [imageError, setImageError] = useState(false);

  // Get the image URL - check multiple sources
// Add this to help debug
const getImageUrl = () => {
  if (property.property_images && property.property_images.length > 0) {
    const sortedImages = [...property.property_images].sort(
      (a, b) => (a.display_order || 0) - (b.display_order || 0)
    );
    const url = sortedImages[0].image_url;
    console.log('Using image from property_images:', url);
    return url;
  }
  if (property.image_url) {
    console.log('Using direct image_url:', property.image_url);
    return property.image_url;
  }
  console.log('No image found for property:', property.name);
  return null;
};

  const imageUrl = getImageUrl();

  console.log('PropertyCard Debug:', {
    propertyName: property.name,
    imageUrl: imageUrl,
    property_images: property.property_images,
    direct_image_url: property.image_url
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Property Image */}
      {imageUrl && !imageError ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={property.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Image failed to load:", imageUrl);
              setImageError(true);
            }}
          />
          {/* Status Badge on Image */}
          {isOwner && (
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                  property.status === "available"
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {property.status || "Available"}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          {/* Status Badge on Placeholder */}
          {isOwner && (
            <div className="absolute top-4 right-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                  property.status === "available"
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {property.status || "Available"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        {/* Property Icon and Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <svg
              className="w-6 h-6 text-white"
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
        </div>

        {/* Property Name */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
          {property.name}
        </h3>

        {/* Location */}
        <p className="text-gray-600 mb-4 flex items-center gap-1 text-sm">
          <svg
            className="w-4 h-4 text-gray-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
          <span className="line-clamp-1">
            {property.city && property.area
              ? `${property.area}, ${property.city}`
              : property.location}
          </span>
        </p>

        {/* Property Details */}
        {(property.bedrooms || property.bathrooms || property.max_guests) && (
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 flex-wrap">
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                🛏️ {property.bedrooms}
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                🚿 {property.bathrooms}
              </span>
            )}
            {property.max_guests && (
              <span className="flex items-center gap-1">
                👥 {property.max_guests}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        {property.price_per_night && (
          <div className="mb-4">
            <p className="text-xl font-bold text-indigo-600">
              ₹{property.price_per_night}
              <span className="text-sm font-normal text-gray-500">/night</span>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <PropertyCardActions property={property} />
      </div>
    </motion.div>
  );
}