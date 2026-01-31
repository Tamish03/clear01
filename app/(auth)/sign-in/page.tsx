'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [identifier, setIdentifier] = useState(''); // Email or Username
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calls the 'credentials' provider from your option.ts
    const result = await signIn('credentials', {
      redirect: false,
      identifier,
      password,
    });

    if (result?.error) {
      setMessage("Invalid credentials or account not verified.");
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Login to CLEAR</h1>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email or Username</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
              placeholder="Enter your identifier"
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition duration-200"
          >
            Sign In
          </button>
        </form>
        {message && <p className="mt-4 text-center text-red-400 text-sm">{message}</p>}
      </div>
    </div>
  );
}