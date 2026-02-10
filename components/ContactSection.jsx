"use client";

import { Phone, Mail, MessageCircle } from "lucide-react";

export default function ContactSection() {
  return (
    <section id="contact" className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* Left Content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Need Help Finding the Right Stay?
          </h2>
          <p className="text-gray-600 max-w-md">
            Our team is here to help you with availability, pricing,
            and finding a bachelors-friendly home — without any brokerage.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          {/* WhatsApp */}
          <a
            href="https://wa.me/91XXXXXXXXXX"
            target="_blank"
            className="group bg-white rounded-xl p-6 shadow hover:shadow-xl transition 
                       text-center cursor-pointer hover:-translate-y-1"
          >
            <MessageCircle className="mx-auto text-indigo-600 mb-3 group-hover:scale-110 transition" />
            <h4 className="font-semibold text-gray-800">WhatsApp</h4>
            <p className="text-sm text-gray-500">Quick support</p>
          </a>

          {/* Call */}
          <a
            href="tel:+91XXXXXXXXXX"
            className="group bg-white rounded-xl p-6 shadow hover:shadow-xl transition 
                       text-center cursor-pointer hover:-translate-y-1"
          >
            <Phone className="mx-auto text-indigo-600 mb-3 group-hover:scale-110 transition" />
            <h4 className="font-semibold text-gray-800">Call Us</h4>
            <p className="text-sm text-gray-500">9 AM – 9 PM</p>
          </a>

          {/* Email */}
          <a
            href="mailto:support@safestay.fake"
            className="group bg-white rounded-xl p-6 shadow hover:shadow-xl transition 
                       text-center cursor-pointer hover:-translate-y-1"
          >
            <Mail className="mx-auto text-indigo-600 mb-3 group-hover:scale-110 transition" />
            <h4 className="font-semibold text-gray-800">Email</h4>
            <p className="text-sm text-gray-500">support@safestay.fake</p>
          </a>

        </div>

      </div>
    </section>
  );
}
