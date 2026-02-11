"use client";

// UserProfile-MINIMAL.jsx - Use this to test if basic functionality works

import { useState } from "react";

export default function UserProfileMinimal({ user, onClose }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with:", formData);
    alert(`Saving: ${formData.full_name}`);
  };

  if (!user) {
    return <div>No user data</div>;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        
        <button onClick={onClose} className="float-right">✕</button>
        
        <h2 className="text-xl font-bold mb-4">Profile</h2>
        
        <div className="mb-4">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.full_name || "Not set"}</p>
          <p><strong>Role:</strong> {user.role || "Not set"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ full_name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Save
          </button>
        </form>

        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <strong>Debug Info:</strong>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

// TEST THIS FIRST:
// 1. Replace UserProfile with UserProfileMinimal in your page
// 2. Check if the popup shows
// 3. Check if user data displays correctly
// 4. Try submitting the form
// 5. Check browser console for any errors