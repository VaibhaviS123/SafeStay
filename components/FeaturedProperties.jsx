"use client";

import { motion } from "framer-motion";
import { MapPin, Wifi, BedDouble, Bath, ShieldCheck } from "lucide-react";

export default function FeaturedProperties() {
  const properties = [
    {
      id: 1,
      title: "Fully Furnished 1BHK for Professionals",
      location: "Andheri East, Mumbai",
      price: "₹18,000 / month",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      features: [
        { icon: <BedDouble size={14} />, label: "Furnished" },
        { icon: <Wifi size={14} />, label: "High-Speed Wi-Fi" },
        { icon: <ShieldCheck size={14} />, label: "Verified Owner" },
      ],
    },
    {
      id: 2,
      title: "PG Near IT Park (No Brokerage)",
      location: "Hinjewadi, Pune",
      price: "₹9,500 / month",
      image:
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c",
      features: [
        { icon: <ShieldCheck size={14} />, label: "No Brokerage" },
        { icon: <Wifi size={14} />, label: "Wi-Fi Included" },
        { icon: <BedDouble size={14} />, label: "Single Sharing" },
      ],
    },
    {
      id: 3,
      title: "Shared Flat for Working Bachelors",
      location: "Vashi, Navi Mumbai",
      price: "₹12,000 / month",
      image:
        "https://images.unsplash.com/photo-1586105251261-72a756497a11",
      features: [
        { icon: <BedDouble size={14} />, label: "Shared Room" },
        { icon: <Bath size={14} />, label: "Attached Bath" },
        { icon: <ShieldCheck size={14} />, label: "Safe Locality" },
      ],
    },
  ];

  return (
    <section id="featured-properties" className="max-w-7xl mx-auto px-6 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl font-bold text-gray-800 mb-14 text-center"
      >
        Bachelors-Friendly <span className="text-indigo-600">Stays</span>
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {properties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition"
          >
            <div className="relative">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 px-4 py-1 rounded-full text-indigo-600 font-semibold text-sm">
                {property.price}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {property.title}
              </h3>

              <p className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                <MapPin size={16} className="text-indigo-500" />
                {property.location}
              </p>

              <div className="flex flex-wrap gap-2">
                {property.features.map((f, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-600"
                  >
                    {f.icon}
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
