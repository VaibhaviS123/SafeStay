"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProperty } from "@/actions/properties";
import { createClient } from "@/lib/supabase/client";

export default function EditPropertyForm({ property }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  
  // Extract existing photos
  const existingPhotos = property.property_images?.map((img) => ({
    id: img.id,
    url: img.image_url,
    display_order: img.display_order,
    isExisting: true,
  })) || [];

  const [photos, setPhotos] = useState(existingPhotos);
  
  const [formData, setFormData] = useState({
    name: property.name || "",
    location: property.location || "",
    city: property.city || "",
    area: property.area || "",
    address: property.address || "",
    description: property.description || "",
    safety_rules: property.safety_rules || "",
    price_per_night: property.price_per_night || "",
    bedrooms: property.bedrooms || 1,
    bathrooms: property.bathrooms || 1,
    max_guests: property.max_guests || 2,
    property_type: property.property_type || "apartment",
    amenities: property.amenities || [],
  });

  const propertyTypes = [
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "House" },
    { value: "villa", label: "Villa" },
    { value: "studio", label: "Studio" },
    { value: "hostel", label: "Hostel" },
    { value: "guesthouse", label: "Guest House" },
    { value: "other", label: "Other" },
  ];

  const amenitiesList = [
    "WiFi",
    "Air Conditioning",
    "Heating",
    "Kitchen",
    "Washing Machine",
    "Free Parking",
    "TV",
    "Workspace",
    "Pool",
    "Gym",
    "Pet Friendly",
    "Elevator",
    "Security",
    "Balcony",
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    const uploadedPhotos = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `property-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("properties")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("properties").getPublicUrl(filePath);

        uploadedPhotos.push({
          url: publicUrl,
          name: file.name,
          isExisting: false,
          display_order: photos.length + uploadedPhotos.length,
        });
      }

      setPhotos((prev) => [...prev, ...uploadedPhotos]);
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Failed to upload photos");
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const propertyData = {
        ...formData,
        photos: photos.map((p, index) => ({
          url: p.url,
          display_order: index,
          id: p.isExisting ? p.id : null,
        })),
      };

      const result = await updateProperty(property.id, propertyData);

      if (result.error) {
        alert(result.error);
        setLoading(false);
        return;
      }

      alert("Property updated successfully!");
      router.push("/owner/dashboard");
    } catch (error) {
      console.error("Error updating property:", error);
      alert("Failed to update property");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Edit Property</h1>
              <p className="text-gray-600 mt-1">Update property details</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="e.g., Cozy Downtown Apartment"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="e.g., Mumbai"
                />
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-semibold text-gray-700 mb-2">
                  Area *
                </label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  required
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="e.g., Bandra West"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="e.g., 123 Main Street, Landmark nearby"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                  Location (Legacy)
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="This field is auto-filled from City and Area"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be auto-generated as "Area, City" if left empty
                </p>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                  placeholder="Describe your property, amenities, nearby attractions..."
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="safety_rules" className="block text-sm font-semibold text-gray-700 mb-2">
                  Safety Rules
                </label>
                <textarea
                  id="safety_rules"
                  name="safety_rules"
                  rows={4}
                  value={formData.safety_rules}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                  placeholder="e.g., No smoking indoors, Keep noise levels low after 10 PM..."
                />
              </div>
            </div>
          </div>

          {/* Property Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Property Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="property_type" className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  required
                  value={formData.property_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
                >
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price_per_night" className="block text-sm font-semibold text-gray-700 mb-2">
                  Price per Night (₹) *
                </label>
                <input
                  type="number"
                  id="price_per_night"
                  name="price_per_night"
                  required
                  min="0"
                  value={formData.price_per_night}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="e.g., 2500"
                />
              </div>

              <div>
                <label htmlFor="bedrooms" className="block text-sm font-semibold text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  required
                  min="1"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label htmlFor="bathrooms" className="block text-sm font-semibold text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  required
                  min="1"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label htmlFor="max_guests" className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Guests *
                </label>
                <input
                  type="number"
                  id="max_guests"
                  name="max_guests"
                  required
                  min="1"
                  value={formData.max_guests}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Amenities Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              Amenities
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {amenitiesList.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition"
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>

            {formData.amenities.length > 0 && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-xl">
                <p className="text-sm font-medium text-indigo-900 mb-2">
                  Selected amenities ({formData.amenities.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-full font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Photo Upload Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Property Photos
            </h2>

            {/* Upload Button */}
            <div className="mb-6">
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition group"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploadingPhotos ? (
                    <>
                      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-sm text-gray-600">Uploading photos...</p>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-12 h-12 text-gray-400 group-hover:text-indigo-500 transition mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-700 font-medium">
                        <span className="text-indigo-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB each</p>
                      <p className="text-xs text-gray-400 mt-1">You can select multiple files at once</p>
                    </>
                  )}
                </div>
                <input
                  id="photo-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhotos}
                />
              </label>
            </div>

            {/* Photo Grid */}
            {photos.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Property Photos ({photos.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={photo.id || index} className="relative group">
                      <img
                        src={photo.url}
                        alt={`Property photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded-md font-medium">
                          Cover Photo
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">Tip: The first photo will be used as the cover image</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingPhotos}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </span>
              ) : (
                "Update Property"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}