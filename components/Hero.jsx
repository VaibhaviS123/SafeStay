"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white overflow-hidden"
    >
      {/* Background glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-indigo-200/40 blur-3xl rounded-full -z-10"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl px-6 text-center flex flex-col items-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium"
        >
          Trusted stays • Verified owners
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6"
        >
          Find a <span className="text-indigo-600">Safe</span> place <br />
          to call home
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-gray-600 mb-12"
        >
          Browse verified properties or list your own — simple, secure, and fast.
        </motion.p>

        {/* User Intent CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <Link
            href="/login?role=guest"
            className="
              px-9 py-4 rounded-2xl
              bg-white/80 backdrop-blur
              text-indigo-600 font-semibold
              border border-indigo-200
              shadow-md
              hover:bg-white hover:border-indigo-300
              hover:scale-[1.03]
              transition-all duration-300
            "
          >
            Find a Place to Stay
          </Link>

          {/* OWNER FLOW */}
          <Link
            href="/login?role=owner"
            className="
              px-6 py-3
              text-gray-600 font-medium
              hover:text-indigo-600
              transition
            "
          >
            List Your Property →
          </Link>
        </motion.div>

        {/* Trust hint */}
        <p className="mt-6 text-sm text-gray-500">
          No account required to book • Secure payments • Verified listings
        </p>
      </motion.div>
    </section>
  );
}
