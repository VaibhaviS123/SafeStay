import Link from "next/link";
import {
  Home,
  CalendarCheck,
  Search,
  LogOut,
} from "lucide-react";

export default function GuestSidebar() {
  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 z-40">
      <div className="flex flex-col w-full p-6">
        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-2xl font-extrabold text-indigo-600">
            StayEase
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Guest Dashboard
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <Link
            href="/guest/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-semibold"
          >
            <Home size={18} />
            Dashboard
          </Link>

          <Link
            href="#bookings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition"
          >
            <CalendarCheck size={18} />
            My Bookings
          </Link>

          <Link
            href="#properties"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition"
          >
            <Search size={18} />
            Browse Properties
          </Link>
        </nav>

        {/* Logout */}
        <button className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
