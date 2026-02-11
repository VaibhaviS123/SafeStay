"use client";

import { useState, useEffect } from "react";
import UserProfile from "./UserProfile";

export default function ProfileChecker({ user, children }) {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Check if profile is incomplete when component mounts
    if (user && !hasChecked) {
      const isProfileIncomplete = !user.full_name || user.full_name.trim() === "";
      
      // Only show popup once per session
      const hasSeenPopup = sessionStorage.getItem('profile_popup_shown');
      
      if (isProfileIncomplete && !hasSeenPopup) {
        setShowProfilePopup(true);
        sessionStorage.setItem('profile_popup_shown', 'true');
      }
      
      setHasChecked(true);
    }
  }, [user, hasChecked]);

  const handleClosePopup = () => {
    setShowProfilePopup(false);
  };

  return (
    <>
      {children}
      {showProfilePopup && (
        <UserProfile user={user} onClose={handleClosePopup} />
      )}
    </>
  );
}