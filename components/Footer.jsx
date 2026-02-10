"use client";

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-10">
        {/* Logo & Description */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-indigo-600 tracking-tight">
              SafeStay
            </span>
          </div>
          <p className="text-gray-600 max-w-xs">
            SafeStay is your trusted platform for finding and posting safe, modern, and affordable properties.
          </p>
          <div className="flex space-x-4 mt-2">
            <a href="#" className="text-gray-500 hover:text-indigo-600 transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-indigo-600 transition">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-indigo-600 transition">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-indigo-600 transition">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">Quick Links</h3>
          <a href="#" className="text-gray-600 hover:text-indigo-600 transition">Home</a>
          <a href="#" className="text-gray-600 hover:text-indigo-600 transition">About</a>
          <a href="#" className="text-gray-600 hover:text-indigo-600 transition">Properties</a>
          <a href="#" className="text-gray-600 hover:text-indigo-600 transition">Contact</a>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">Contact</h3>
          <p className="text-gray-600">Email: support@safestay.com</p>
          <p className="text-gray-600">Phone: +1 234 567 890</p>
        </div>
      </div>

      <div className="bg-gray-100 text-center py-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} SafeStay. All rights reserved.
      </div>
    </footer>
  );
}
