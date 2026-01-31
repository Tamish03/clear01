'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ApiResponse } from '@/types/ApiResponse'; // Using your API response type

export default function VerifyAccount() {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: params.username, code }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        alert("Success! Your account is verified.");
        router.push('/sign-in');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("An error occurred during verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-extrabold text-center">Verify CLEAR Account</h2>
        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            placeholder="Enter 6-digit code"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded font-bold"
          >
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      </div>
    </div>
  );
}