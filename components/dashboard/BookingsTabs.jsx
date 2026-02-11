'use client';

import { useState, useEffect } from 'react';
import GuestCheckInOutActions from '@/components/bookings/GuestCheckInOutActions';
import ReviewModal from '@/components/reviews/ReviewModel';

// Helper: read the ?tab= value from the current hash
function getTabFromHash() {
  if (typeof window === 'undefined') return 'active';
  const hash = window.location.hash; // e.g. "#bookings?tab=pending"
  const tab = hash.split('?tab=')[1];
  return ['active', 'pending', 'completed'].includes(tab) ? tab : 'active';
}

export default function BookingsTabs({ activeBookings, pendingBookings, completedBookings, cancelledBookings }) {
  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [reviewedBookingIds, setReviewedBookingIds] = useState(
    () => new Set(completedBookings.filter(b => b.reviews?.length > 0).map(b => b.id))
  );

  // Update reviewedBookingIds when completedBookings changes (e.g., after page refresh or data refetch)
  useEffect(() => {
    const reviewedIds = new Set(completedBookings.filter(b => b.reviews?.length > 0).map(b => b.id));
    setReviewedBookingIds(reviewedIds);
  }, [completedBookings]);

  // ── Listen for hash changes so clicking nav cards switches the tab ──
  useEffect(() => {
    const onHashChange = () => {
      setActiveTab(getTabFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleOpenReview = (booking) => {
    setSelectedBooking(booking);
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = (bookingId) => {
    setReviewedBookingIds(prev => new Set([...prev, bookingId]));
  };

  const totalBookings =
    activeBookings.length + pendingBookings.length + completedBookings.length + cancelledBookings.length;

  const tabs = [
    {
      id: 'total',
      label: 'Total Bookings',
      count: totalBookings,
      color: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'active',
      label: 'Active',
      count: activeBookings.length,
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      id: 'pending',
      label: 'Pending',
      count: pendingBookings.length,
      color: 'orange',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'completed',
      label: 'Completed',
      count: completedBookings.length,
      color: 'purple',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: { bg: isActive ? 'bg-blue-50' : 'bg-white', border: isActive ? 'border-blue-200' : 'border-gray-100', text: 'text-blue-600', iconBg: 'bg-blue-50', ring: 'ring-2 ring-blue-500' },
      green: { bg: isActive ? 'bg-green-50' : 'bg-white', border: isActive ? 'border-green-200' : 'border-gray-100', text: 'text-green-600', iconBg: 'bg-green-50', ring: 'ring-2 ring-green-500' },
      orange: { bg: isActive ? 'bg-orange-50' : 'bg-white', border: isActive ? 'border-orange-200' : 'border-gray-100', text: 'text-orange-600', iconBg: 'bg-orange-50', ring: 'ring-2 ring-orange-500' },
      purple: { bg: isActive ? 'bg-purple-50' : 'bg-white', border: isActive ? 'border-purple-200' : 'border-gray-100', text: 'text-purple-600', iconBg: 'bg-purple-50', ring: 'ring-2 ring-purple-500' },
    };
    return colors[color];
  };

  const renderBookingCard = (booking, theme) => {
    const checkIn = new Date(booking.check_in);
    const checkOut = new Date(booking.check_out);
    const showCheckInOut = booking.status === 'confirmed' || booking.status === 'checked_in';

    return (
      <div
        key={booking.id}
        className={`group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br ${theme.gradient}`}
      >
        <div className="absolute inset-0">
          {booking.properties?.image_url || booking.properties?.property_images?.[0]?.image_url ? (
            <img
              src={booking.properties?.image_url || booking.properties?.property_images?.[0]?.image_url}
              alt={booking.properties?.name}
              className={`w-full h-full object-cover ${theme.imageFilter}`}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${theme.fallbackBg}`}>
              <svg className="w-20 h-20 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="absolute top-3 right-3">
          <div className={`${theme.badgeBg} backdrop-blur-sm ${theme.badgeBorder} ${theme.badgeText} px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg`}>
            {theme.icon}
            {theme.badgeLabel}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <h3 className="font-bold text-lg mb-2 line-clamp-1">{booking.properties?.name}</h3>
          <div className="space-y-1.5 text-sm mb-3">
            <div className="flex items-center gap-2 opacity-90">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">
                {checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                {checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            {booking.guests && (
              <div className="flex items-center gap-2 opacity-90">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
              </div>
            )}
          </div>

          {(booking.total_price || booking.total_amount) && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 mb-3">
              <div className="text-xs opacity-75">Total Price</div>
              <div className={`text-xl font-bold ${theme.strikethrough ? 'line-through opacity-50' : ''}`}>
                ₹{(booking.total_price || booking.total_amount).toLocaleString()}
              </div>
            </div>
          )}

          {theme.button && (
            <button
              onClick={() => theme.onButtonClick && theme.onButtonClick()}
              disabled={theme.buttonDisabled}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                theme.buttonDisabled
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : `${theme.buttonBg} ${theme.buttonText} ${theme.buttonHover}`
              }`}
            >
              {theme.buttonIcon}
              {theme.buttonLabel}
            </button>
          )}

          {showCheckInOut && (
            <div className="mt-3">
              <GuestCheckInOutActions
                bookingId={booking.id}
                status={booking.status}
                checkInDate={booking.check_in}
                checkOutDate={booking.check_out}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const completedTheme = (booking) => {
    const reviewed = reviewedBookingIds.has(booking.id);
    return {
      gradient: 'from-purple-500 to-pink-600',
      badgeBg: 'bg-white/90',
      badgeBorder: 'border border-purple-200',
      badgeText: 'text-purple-700',
      badgeLabel: 'Completed',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      imageFilter: '',
      fallbackBg: 'bg-purple-500',
      button: true,
      buttonBg: 'bg-white/20',
      buttonText: 'text-white',
      buttonHover: 'hover:bg-white/30',
      buttonDisabled: reviewed,
      buttonLabel: reviewed ? 'Reviewed ✓' : 'Write a Review',
      buttonIcon: reviewed ? null : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      onButtonClick: reviewed ? null : () => handleOpenReview(booking),
    };
  };

  const renderContent = () => {
    if (activeTab === 'total') {
      const allBookings = [...activeBookings, ...pendingBookings, ...completedBookings, ...cancelledBookings];
      if (allBookings.length === 0) {
        return (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 text-sm">Start exploring properties to make your first booking!</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allBookings.map(booking => {
            if (booking.status === 'completed') return renderBookingCard(booking, completedTheme(booking));
            const theme =
              booking.status === 'confirmed' || booking.status === 'checked_in'
                ? { gradient: 'from-green-500 to-emerald-600', badgeBg: 'bg-white/90', badgeBorder: 'border border-green-200', badgeText: 'text-green-700', badgeLabel: booking.status === 'checked_in' ? 'Checked In' : 'Confirmed', icon: null, imageFilter: '', fallbackBg: 'bg-green-500' }
                : booking.status === 'pending'
                ? { gradient: 'from-orange-500 to-amber-600', badgeBg: 'bg-white/90', badgeBorder: 'border border-orange-200', badgeText: 'text-orange-700', badgeLabel: 'Pending', icon: null, imageFilter: '', fallbackBg: 'bg-orange-500' }
                : { gradient: 'from-red-500 to-rose-600', badgeBg: 'bg-white/90', badgeBorder: 'border border-red-200', badgeText: 'text-red-700', badgeLabel: 'Cancelled', icon: null, imageFilter: 'grayscale opacity-75', fallbackBg: 'bg-red-500', strikethrough: true };
            return renderBookingCard(booking, theme);
          })}
        </div>
      );
    }

    if (activeTab === 'active') {
      if (activeBookings.length === 0) {
        return (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No active bookings</h3>
            <p className="text-gray-500 text-sm">Your confirmed and checked-in bookings will appear here</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeBookings.map(booking => renderBookingCard(booking, {
            gradient: 'from-green-500 to-emerald-600',
            badgeBg: 'bg-white/90',
            badgeBorder: 'border border-green-200',
            badgeText: 'text-green-700',
            badgeLabel: booking.status === 'checked_in' ? 'Checked In' : 'Confirmed',
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ),
            imageFilter: '',
            fallbackBg: 'bg-green-500',
          }))}
        </div>
      );
    }

    if (activeTab === 'pending') {
      if (pendingBookings.length === 0) {
        return (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending bookings</h3>
            <p className="text-gray-500 text-sm">Bookings awaiting confirmation will appear here</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pendingBookings.map(booking => renderBookingCard(booking, {
            gradient: 'from-orange-500 to-amber-600',
            badgeBg: 'bg-white/90',
            badgeBorder: 'border border-orange-200',
            badgeText: 'text-orange-700',
            badgeLabel: 'Pending',
            icon: (
              <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            imageFilter: '',
            fallbackBg: 'bg-orange-500',
          }))}
        </div>
      );
    }

    if (activeTab === 'completed') {
      if (completedBookings.length === 0) {
        return (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed bookings</h3>
            <p className="text-gray-500 text-sm">Your past stays will appear here</p>
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {completedBookings.map(booking => renderBookingCard(booking, completedTheme(booking)))}
        </div>
      );
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {tabs.map((tab) => {
          const colorClasses = getColorClasses(tab.color, activeTab === tab.id);
          const isClickable = tab.id !== 'total';
          return (
            <button
              key={tab.id}
              onClick={() => isClickable && setActiveTab(tab.id)}
              disabled={!isClickable}
              className={`${colorClasses.bg} rounded-xl p-6 shadow-sm border ${colorClasses.border} transition-all duration-200 ${
                isClickable ? 'hover:shadow-md cursor-pointer' : 'cursor-default'
              } ${activeTab === tab.id ? colorClasses.ring : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className={`text-3xl font-bold ${colorClasses.text}`}>{tab.count}</div>
                  <div className="text-sm text-gray-600 mt-1 font-medium">{tab.label}</div>
                </div>
                <div className={`${colorClasses.iconBg} p-3 rounded-lg ${colorClasses.text}`}>
                  {tab.icon}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {renderContent()}

      {selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          isOpen={reviewModalOpen}
          hasReviewed={reviewedBookingIds.has(selectedBooking.id)}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedBooking(null);
          }}
          onSuccess={(bookingId) => handleReviewSuccess(bookingId)}
        />
      )}
    </div>
  );
}