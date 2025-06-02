"use client";
import { useState, useEffect } from "react";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, generateCsrfToken } from '@/lib/auth/csrf';

export default function ProfileSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ensure CSRF token is set on mount
    if (typeof window !== 'undefined') {
      const existingToken = document.cookie.split('; ').find(row => row.startsWith(CSRF_COOKIE_NAME + '='));
      if (!existingToken) {
        const token = generateCsrfToken();
        document.cookie = `${CSRF_COOKIE_NAME}=${token}; path=/; SameSite=Lax`;
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    // Basic validation
    if (!name || !email) {
      setError("Name and email are required.");
      setLoading(false);
      return;
    }
    // Get CSRF token from cookie
    let csrfToken = document.cookie.split('; ').find(row => row.startsWith(CSRF_COOKIE_NAME + '='))?.split('=')[1];
    if (!csrfToken) {
      csrfToken = generateCsrfToken();
      document.cookie = `${CSRF_COOKIE_NAME}=${csrfToken}; path=/; SameSite=Lax`;
    }
    try {
      const response = await fetch("/api/settings/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [CSRF_HEADER_NAME]: csrfToken || '',
        },
        body: JSON.stringify({ name, email }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update profile.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">Update Profile</h2>
      <div>
        <label className="block mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      <div>
        <label className="block mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded px-2 py-1"
          required
        />
      </div>
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">Profile updated successfully!</div>}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
} 