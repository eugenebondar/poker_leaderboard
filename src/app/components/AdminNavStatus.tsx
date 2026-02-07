"use client";
import { useEffect, useState } from "react";

export default function AdminNavStatus() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAdmin() {
      const res = await fetch("/api/admin/session");
      const data = await res.json();
      setIsAdmin(data.isAdmin);
      setLoading(false);
    }
    checkAdmin();
  }, []);

  if (loading) return null;

  return isAdmin ? (
    <a href="/admin" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Admin</a>
  ) : (
    <a href="/admin/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Login</a>
  );
}
