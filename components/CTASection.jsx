"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden py-28 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative max-w-5xl mx-auto px-6 text-center text-white"
      >
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
          Ready to move in or rent out?
        </h2>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-12">
          Join thousands of tenants and owners using <span className="font-semibold">SafeStay</span> 
          to find verified, bachelors-friendly homes — without brokers or hidden charges.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-5">
          
          {/* Primary */}
          <Link
            href="/login?role=guest"
            className="
              px-10 py-4 rounded-xl
              bg-white text-indigo-600
              font-semibold text-lg
              shadow-xl
              hover:scale-105 hover:shadow-2xl
              transition
            "
          >
            Find a Stay
          </Link>

          {/* Secondary */}
          <Link
            href="/register?role=owner"
            className="
              px-10 py-4 rounded-xl
              border border-white/70
              text-white font-semibold text-lg
              hover:bg-white hover:text-indigo-600
              hover:scale-105
              transition
            "
          >
            List Your Property
          </Link>
        </div>

        {/* Trust hint */}
        <p className="mt-8 text-sm text-white/80">
          ✔ No brokerage • ✔ Verified listings • ✔ Secure platform
        </p>
      </motion.div>
    </section>
  );
}
