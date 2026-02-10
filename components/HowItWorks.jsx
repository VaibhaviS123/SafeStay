"use client";

import { Search, Home, PlusCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Search Properties",
      desc: "Find verified homes and rooms that match your needs in seconds.",
    },
    {
      icon: Home,
      title: "Choose Your Stay",
      desc: "Compare photos, pricing, and amenities before you decide.",
    },
    {
      icon: PlusCircle,
      title: "Post Your Property",
      desc: "List your property easily and reach thousands of renters.",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-gray-50">
      {/* Soft background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-indigo-200/30 blur-3xl rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            How SafeStay Works
          </h2>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            A simple and secure process designed for both renters and owners.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-10 text-center shadow-md 
                           hover:shadow-xl transition-all duration-300
                           hover:-translate-y-2"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center
                               bg-indigo-50 text-indigo-600
                               group-hover:bg-indigo-600 group-hover:text-white
                               transition-all duration-300"
                  >
                    <Icon size={30} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
