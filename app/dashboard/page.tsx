'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ApiResponse } from '@/types/ApiResponse';

export default function Dashboard() {
  const { data: session } = useSession();
  const [scans, setScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch('/api/get-scans'); // We'll create this helper API next
        const data: ApiResponse = await response.json();
        if (data.success && data.scans) {
          setScans(data.scans);
        }
      } catch (error) {
        console.error('Failed to fetch scans', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) fetchScans();
  }, [session]);

  if (!session) return <div className="p-8">Please log in to view your dashboard.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Safety Dashboard</h1>
        <div className="text-sm bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
          Logged in as: {session.user.username}
        </div>
      </header>

      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
          
          {isLoading ? (
            <p className="text-gray-500">Loading your protection history...</p>
          ) : scans.length === 0 ? (
            <p className="text-gray-500 italic">No threats detected yet. The extension is working in the background!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-600 uppercase text-xs">
                    <th className="py-3 px-4">URL</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Threat Level</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((scan) => (
                    <tr key={scan._id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-4 px-4 font-medium text-blue-600 truncate max-w-xs">{scan.url}</td>
                      <td className="py-4 px-4 text-gray-600">{scan.category}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          scan.threatLevel === 'high' ? 'bg-red-100 text-red-700' :
                          scan.threatLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {scan.threatLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 italic text-gray-500">{scan.actionTaken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}