"use client";

import { useState } from "react";
import { Menu, X, Home } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Home", id: "home" },
    { label: "Properties", id: "featured-properties" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Services", id: "services" },
    { label: "Contact", id: "contact" },
  ];

  const scrollToSection = (id) => {
    setIsOpen(false);

    // If not on home page, go to home first
    if (pathname !== "/") {
      router.push(`/#${id}`);
      return;
    }

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Home size={28} className="text-indigo-600" />
          <span className="text-2xl font-bold text-indigo-600">
            SafeStay
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-10 font-medium text-gray-700">
          {navItems.map((item) => (
            <li
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="hover:text-indigo-600 transition cursor-pointer"
            >
              {item.label}
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
        

          <Link
            href="/login?role=owner"
            className="px-5 py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
          >
            Post Property
          </Link>

          <Link
            href="/login?role=guest"
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition"
          >
            Find a Stay
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-6 space-y-4">
          {navItems.map((item) => (
            <p
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-gray-700 hover:text-indigo-600 cursor-pointer"
            >
              {item.label}
            </p>
          ))}

          <div className="pt-4 space-y-3">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block w-full py-2 rounded-lg border text-center"
            >
              Login
            </Link>

            <Link
              href="/post-property"
              onClick={() => setIsOpen(false)}
              className="block w-full py-2 rounded-lg border border-indigo-600 text-indigo-600 text-center"
            >
              Post Property
            </Link>

            <Link
              href="/properties"
              onClick={() => setIsOpen(false)}
              className="block w-full py-2 rounded-lg bg-indigo-600 text-white text-center"
            >
              Find a Stay
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
