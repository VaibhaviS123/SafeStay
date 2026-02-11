'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ReviewModal({ booking, isOpen, onClose, onSuccess, hasReviewed: hasReviewedProp }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  // ── Local confirmed-reviewed state, seeded from prop ──
  const [alreadyReviewed, setAlreadyReviewed] = useState(hasReviewedProp ?? false);
  const [checkingReview, setCheckingReview] = useState(false);

  const canReview = booking.status === 'completed';

  // ── Every time the modal opens, verify against the DB ──
  // This catches cases where hasReviewed prop was false but DB has a review
  useEffect(() => {
    if (!isOpen || !booking?.id) return;

    // If prop already says reviewed, trust it immediately
    if (hasReviewedProp) {
      setAlreadyReviewed(true);
      return;
    }

    const checkExisting = async () => {
      setCheckingReview(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('reviews')
          .select('id')
          .eq('booking_id', booking.id)
          .maybeSingle(); // maybeSingle returns null instead of error when no row found

        if (data) {
          setAlreadyReviewed(true);
          // Also tell parent so the card updates
          onSuccess?.(booking.id);
        } else {
          setAlreadyReviewed(false);
        }
      } catch (err) {
        console.error('Error checking review:', err);
      } finally {
        setCheckingReview(false);
      }
    };

    checkExisting();
  }, [isOpen, booking?.id, hasReviewedProp, onSuccess]);

  // Reset local state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setComment('');
      setError('');
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Loading screen while checking DB ──
  if (checkingReview) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 text-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Checking review status...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Already reviewed / just submitted screen ──
  if (alreadyReviewed || submitted) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 text-center">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {submitted ? 'Review Submitted!' : 'Already Reviewed'}
            </h3>
            <p className="text-gray-500">
              {submitted
                ? <>Thanks for sharing your experience at <span className="font-medium text-gray-700">{booking.properties?.name}</span>.</>
                : 'You have already submitted a review for this stay.'}
            </p>
            {!submitted && (
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Not completed yet ──
  if (!canReview) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 text-center">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cannot Review Yet</h3>
            <p className="text-gray-600">You can only review completed stays.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating'); return; }
    if (comment.trim().length < 10) { setError('Review must be at least 10 characters long'); return; }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) { setError('You must be logged in to submit a review'); setLoading(false); return; }

      // Final duplicate guard
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', booking.id)
        .maybeSingle();

      if (existingReview) {
        setAlreadyReviewed(true);
        onSuccess?.(booking.id);
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          property_id: booking.properties.id,
          user_id: user.id,
          booking_id: booking.id,
          rating,
          comment: comment.trim(),
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      onSuccess?.(booking.id); // ← passes bookingId so parent card updates
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2500);

    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Main review form ──
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 transform transition-all">

          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2">Write a Review</h2>
              <p className="text-purple-100 text-sm">Share your experience at {booking.properties?.name}</p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
              {booking.properties?.image_url || booking.properties?.property_images?.[0]?.image_url ? (
                <img
                  src={booking.properties?.image_url || booking.properties?.property_images?.[0]?.image_url}
                  alt={booking.properties?.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{booking.properties?.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} -{' '}
                  {new Date(booking.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoveredRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-sm font-semibold text-gray-700">
                    {rating} {rating === 1 ? 'star' : 'stars'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                placeholder="Share your experience... (minimum 10 characters)"
              />
              <div className="mt-2 text-xs text-gray-500">{comment.length} / 10 minimum characters</div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}