"use client";
import { useState } from 'react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data: { success?: boolean; error?: string } = await res.json();
    setLoading(false);
    if (!data.success) {
      setError(data.error || 'Login failed');
    } else {
      window.location.href = '/admin';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form className="w-full max-w-xs p-6 bg-white rounded shadow text-black" onSubmit={handleSubmit}>
        <h2 className="mb-4 text-xl font-bold">Admin Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className="w-full mb-2 p-2 border rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded text-black"
          required
        />
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
