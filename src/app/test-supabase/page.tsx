'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';

export default function TestSupabase() {
  const [status, setStatus] = useState<{
    menu: number;
    tables: number;
    settings: boolean;
    error?: string;
  }>({ menu: 0, tables: 0, settings: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        console.log('🔄 Testing Supabase connection...');
        
        // Test menu data
        const menuData = await db.getMenu();
        console.log('✅ Menu loaded:', menuData?.length, 'categories');
        
        // Test tables data  
        const tablesData = await db.getTables();
        console.log('✅ Tables loaded:', tablesData?.length, 'tables');
        
        // Test settings
        const settingsData = await db.getSettings();
        console.log('✅ Settings loaded:', settingsData);
        
        setStatus({
          menu: menuData?.length || 0,
          tables: tablesData?.length || 0,
          settings: !!settingsData,
        });
        
      } catch (error) {
        console.error('❌ Supabase connection failed:', error);
        setStatus({
          menu: 0,
          tables: 0,
          settings: false,
          error: String(error)
        });
      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Testing Supabase Connection...</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-600">Connection Error</h1>
        <p>Failed to connect to Supabase: {status.error}</p>
        <div className="mt-4 p-4 bg-yellow-100 rounded">
          <h3 className="font-bold">Troubleshooting:</h3>
          <ul className="list-disc list-inside mt-2">
            <li>Check if your Supabase project is active</li>
            <li>Verify environment variables in .env.local</li>
            <li>Check network connectivity</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-green-600">✅ Supabase Connected!</h1>
      <div className="mt-4 space-y-2">
        <p>✅ Menu Categories: {status.menu}</p>
        <p>✅ Tables: {status.tables}</p>
        <p>✅ Settings: {status.settings ? 'Loaded' : 'Not found'}</p>
      </div>
      <div className="mt-4 p-4 bg-green-100 rounded">
        <h3 className="font-bold">🎉 Database Status: READY</h3>
        <p>Your restaurant management system is connected to real-time database!</p>
      </div>
    </div>
  );
}
