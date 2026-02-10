"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProperty } from "@/actions/properties";

export default function PropertyCardActions({ property }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${property.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const result = await deleteProperty(property.id);
      
      if (result.error) {
        alert(result.error);
        setDeleting(false);
        return;
      }

      alert("Property deleted successfully!");
      // Use window.location for a full page refresh to avoid auth issues
      window.location.href = "/owner/dashboard";
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Failed to delete property");
      setDeleting(false);
    }
  };

  const handleView = () => {
    window.location.href = `/owner/properties/${property.id}`;
  };

  const handleEdit = () => {
    window.location.href = `/owner/properties/${property.id}/edit`;
  };

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={handleView}
        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        View
      </button>
      <button
        onClick={handleEdit}
        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}