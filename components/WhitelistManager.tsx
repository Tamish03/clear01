'use client';

import { useState, useEffect } from 'react';
import { ApiResponse } from '@/types/ApiResponse';
import whiteList from '@/model/userModel';

export default function WhitelistManager() {
  const [domain, setDomain] = useState('');
  const [whiteList, setWhiteList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial whitelist on load
  useEffect(() => {
    const fetchWhitelist = async () => {
      const res = await fetch('/api/get-user-data'); // You'll need a simple GET route for this
      const data = await res.json();
      if (data.success) setWhiteList(data.whiteList || []);
    };
    fetchWhitelist();
  }, []);

  const handleAction = async (targetDomain: string, action: 'add' | 'remove') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: targetDomain, action }),
      });

      const data: ApiResponse = await response.json();
      if (data.success) {
        setWhiteList(data.whiteList || []);
        if (action === 'add') setDomain('');
      }
    } catch (error) {
      console.error("Whitelist Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl text-white">
      <h2 className="text-xl font-bold mb-4">Domain Whitelist</h2>
      <p className="text-gray-400 text-sm mb-4">Domains here will never be scanned or blurred.</p>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="e.g. github.com"
          className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded outline-none focus:border-blue-500"
          value={domain}
          onChange={(e) => setDomain(e.target.value.toLowerCase())}
        />
        <button
          onClick={() => handleAction(domain, 'add')}
          disabled={isLoading || !domain}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {whiteList.length === 0 && <p className="text-gray-500 italic text-sm">No domains whitelisted yet.</p>}
        {whiteList.map((item) => (
          <div key={item} className="flex justify-between items-center p-2 bg-gray-800 rounded">
            <span className="text-sm">{item}</span>
            <button
              onClick={() => handleAction(item, 'remove')}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}