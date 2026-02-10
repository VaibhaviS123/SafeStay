"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Home, Wallet, Users } from "lucide-react";

export default function OurServices() {
  const services = [
    {
      icon: ShieldCheck,
      title: "Verified & Safe Homes",
      desc: "Every property is manually reviewed to ensure safety and quality.",
    },
    {
      icon: Home,
      title: "Bachelors-Friendly",
      desc: "Homes that welcome students and working professionals without hassle.",
    },
    {
      icon: Wallet,
      title: "No Brokerage",
      desc: "Connect directly with owners and save thousands on brokerage fees.",
    },
    {
      icon: Users,
      title: "For Owners & Renters",
      desc: "Owners can list easily, renters can find faster — win-win.",
    },
  ];

  return (
    <section id="services" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

        {/* LEFT CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
            Why Choose <span className="text-indigo-600">SafeStay?</span>
          </h2>

          <p className="text-gray-600 mb-8 max-w-lg">
            SafeStay is designed for people who want peace of mind while renting.
            Whether you're moving to a new city or listing your property,
            we make the process simple, secure, and transparent.
          </p>

          <ul className="space-y-4 text-gray-700">
            <li>✔ Trusted listings only</li>
            <li>✔ Zero brokerage platform</li>
            <li>✔ Built for modern renters</li>
          </ul>
        </motion.div>

        {/* RIGHT CARDS */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                className="bg-gray-50 rounded-2xl p-6 shadow hover:shadow-xl transition"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                  <Icon size={24} />
                </div>

                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.title}
                </h4>

                <p className="text-sm text-gray-600">
                  {service.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
