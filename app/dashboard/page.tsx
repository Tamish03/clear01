'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ApiResponse } from '@/types/ApiResponse';

export default function DashboardPage() {
  const { data: session } = useSession();
  
  // State for Settings
  const [settings, setSettings] = useState({
    blurNSFW: true,
    blurViolence: true,
    blurScam: true,
    blurHate: true,
  });

  // State for Whitelist
  const [whiteList, setWhiteList] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch all user data (Settings + Whitelist) on load
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/get-scans'); // Reusing your scan route or create a dedicated /api/user-data
        const data: ApiResponse = await response.json();
        // Assuming your user model now includes these fields
        if (data.success) {
          // If you create a dedicated user-data route, update these setters:
          // setSettings(data.settings);
          // setWhiteList(data.whiteList || []);
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      }
    };
    if (session) fetchUserData();
  }, [session]);

  // 2. Handle Setting Toggles
  const toggleSetting = async (key: keyof typeof settings) => {
    const updatedSettings = { ...settings, [key]: !settings[key] };
    setSettings(updatedSettings);

    await fetch('/api/update-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: updatedSettings }),
    });
  };

  // 3. Handle Whitelist Actions (Add/Remove)
  const handleWhitelist = async (domain: string, action: 'add' | 'remove') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, action }),
      });

      const data: ApiResponse = await response.json();
      if (data.success) {
        setWhiteList(data.whiteList || []);
        if (action === 'add') setNewDomain('');
      }
    } catch (error) {
      console.error("Whitelist update failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-500">CLEAR Control Center</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LEFT: PROTECTION SETTINGS */}
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              🛡️ Protection Settings
            </h2>
            <div className="space-y-4">
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <span className="capitalize font-medium">{key.replace('blur', '')} Blurring</span>
                  <button
                    onClick={() => toggleSetting(key as keyof typeof settings)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${value ? 'bg-blue-600' : 'bg-gray-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: WHITELIST MANAGER */}
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              ✅ Trusted Domains
            </h2>
            <p className="text-gray-400 text-sm mb-6">Whitelisted sites will never be blurred or scanned.</p>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="e.g., youtube.com"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
              />
              <button
                onClick={() => handleWhitelist(newDomain, 'add')}
                disabled={isLoading || !newDomain}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold disabled:opacity-50"
              >
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
              {whiteList.length === 0 ? (
                <p className="text-center text-gray-500 py-4 italic">No domains whitelisted yet.</p>
              ) : (
                whiteList.map((domain) => (
                  <div key={domain} className="flex justify-between items-center p-3 bg-gray-800/30 border border-gray-700 rounded-lg group">
                    <span className="text-gray-300">{domain}</span>
                    <button
                      onClick={() => handleWhitelist(domain, 'remove')}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}