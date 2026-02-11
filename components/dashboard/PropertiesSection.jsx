'use client';

import { useState, useMemo } from 'react';

export default function PropertiesSection({ properties, cities, areas }) {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  const filtered = useMemo(() => {
    return properties.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        p.name?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.area?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);
      const matchCity = !selectedCity || p.city === selectedCity;
      const matchArea = !selectedArea || p.area === selectedArea;
      return matchSearch && matchCity && matchArea;
    });
  }, [properties, search, selectedCity, selectedArea]);

  const filteredAreas = useMemo(() =>
    selectedCity
      ? areas.filter(a => properties.some(p => p.area === a && p.city === selectedCity))
      : areas,
    [areas, properties, selectedCity]
  );

  const clearFilters = () => { setSearch(''); setSelectedCity(''); setSelectedArea(''); };
  const hasFilters = search || selectedCity || selectedArea;

  return (
    <div className="space-y-6">

      {/* ── Search Bar ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Main search row */}
        <div className="flex items-center gap-0 divide-x divide-gray-100">

          {/* Text search */}
          <div className="flex-1 flex items-center gap-3 px-5 py-4">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Search</label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Property name, location..."
                className="w-full text-sm text-gray-900 placeholder-gray-400 bg-transparent border-0 outline-none"
              />
            </div>
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* City picker */}
          <div className="flex items-center gap-3 px-5 py-4 min-w-[170px]">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">City</label>
              <select
                value={selectedCity}
                onChange={e => { setSelectedCity(e.target.value); setSelectedArea(''); }}
                className="w-full text-sm text-gray-700 bg-transparent border-0 outline-none appearance-none cursor-pointer"
              >
                <option value="">All cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Area picker */}
          <div className="flex items-center gap-3 px-5 py-4 min-w-[170px]">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Area</label>
              <select
                value={selectedArea}
                onChange={e => setSelectedArea(e.target.value)}
                className="w-full text-sm text-gray-700 bg-transparent border-0 outline-none appearance-none cursor-pointer"
              >
                <option value="">All areas</option>
                {filteredAreas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Search button */}
          <div className="px-4 py-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </div>

        {/* Active filter tags + result count */}
        {hasFilters && (
          <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">
              <span className="text-blue-600 font-bold">{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''}
            </span>
            <div className="w-px h-4 bg-gray-200" />
            {search && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                🔍 {search}
                <button onClick={() => setSearch('')} className="ml-1 hover:text-blue-900">×</button>
              </span>
            )}
            {selectedCity && (
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                📍 {selectedCity}
                <button onClick={() => { setSelectedCity(''); setSelectedArea(''); }} className="ml-1 hover:text-emerald-900">×</button>
              </span>
            )}
            {selectedArea && (
              <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-full">
                🗺 {selectedArea}
                <button onClick={() => setSelectedArea('')} className="ml-1 hover:text-violet-900">×</button>
              </span>
            )}
            <button onClick={clearFilters} className="ml-auto text-xs text-red-500 hover:text-red-700 font-semibold hover:underline transition">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No properties found</h3>
          <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="text-sm text-blue-600 font-semibold hover:underline">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(property => <PropertyCard key={property.id} property={property} />)}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property }) {
  const [imgError, setImgError] = useState(false);
  const image = !imgError && (property.image_url || property.property_images?.[0]?.image_url);
  const price = property.price_per_night || property.price;

  const typeEmoji = { villa: '🏡', apartment: '🏢', hostel: '🏨', resort: '🌴', cottage: '🏠' };
  const emoji = typeEmoji[property.property_type?.toLowerCase()] || '🏠';

  // Gradient fallbacks per property type
  const fallbackGradients = {
    villa: 'from-emerald-400 to-teal-600',
    apartment: 'from-blue-400 to-indigo-600',
    hostel: 'from-orange-400 to-pink-500',
    resort: 'from-cyan-400 to-blue-500',
    cottage: 'from-amber-400 to-orange-500',
  };
  const fallback = fallbackGradients[property.property_type?.toLowerCase()] || 'from-blue-400 to-indigo-500';

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col">

      {/* ── Image ── */}
      <div className="relative h-52 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={property.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${fallback} flex items-center justify-center`}>
            <span className="text-5xl">{emoji}</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Available badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available
          </span>
        </div>

        {/* Type badge */}
        {property.property_type && (
          <div className="absolute top-3 right-3">
            <span className="bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full capitalize">
              {emoji} {property.property_type}
            </span>
          </div>
        )}

        {/* Price on hover */}
        <div className="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="text-white font-bold text-lg">
            {price ? <>₹{Number(price).toLocaleString()}<span className="text-sm font-normal text-white/70">/night</span></> : 'Contact for pricing'}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col flex-1">

        {/* Name & location */}
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors mb-1">
            {property.name}
          </h3>
          {(property.area || property.city) && (
            <p className="text-gray-400 text-xs flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {[property.area, property.city].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        {/* Description */}
        {property.description && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-3 flex-1 leading-relaxed">{property.description}</p>
        )}

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 flex-wrap">
          {property.bedrooms && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
              🛏 {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
              🚿 {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
            </span>
          )}
          {property.max_guests && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
              👥 {property.max_guests} guests
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div>
            {price ? (
              <>
                <span className="text-xl font-bold text-gray-900">₹{Number(price).toLocaleString()}</span>
                <span className="text-xs text-gray-400 ml-1">/night</span>
              </>
            ) : (
              <span className="text-sm text-gray-400 italic">Contact for pricing</span>
            )}
          </div>
          <a
            href={`/properties/${property.id}`}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            Book Now
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}