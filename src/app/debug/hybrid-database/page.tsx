'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/app-context-hybrid';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function DebugPage() {
  const app = useApp();
  const [activeDatabase, setActiveDatabase] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState('Unknown');
  const [firebaseStatus, setFirebaseStatus] = useState('Unknown');
  const [menuCount, setMenuCount] = useState(0);
  const [tablesCount, setTablesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check database status
  useEffect(() => {
    setActiveDatabase(app.databaseStatus.active);
    setSupabaseStatus(app.databaseStatus.supabaseAvailable ? 'Connected' : 'Disconnected');
    setFirebaseStatus(app.databaseStatus.firebaseAvailable ? 'Connected' : 'Disconnected');
    setMenuCount(app.menu.length);
    setTablesCount(app.tables.length);
  }, [app.databaseStatus, app.menu, app.tables]);
  
  // Force database refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await app.refreshData();
      toast({
        title: 'Refreshed',
        description: 'Data refreshed successfully',
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: 'Error',
        description: 'Could not refresh data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manual connection tests
  const testSupabase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-supabase');
      const data = await response.json();
      
      toast({
        title: data.status === 'success' ? 'Supabase Connected' : 'Supabase Error',
        description: data.message,
        variant: data.status === 'success' ? 'default' : 'destructive',
      });
      
      // Refresh data after test
      await handleRefresh();
    } catch (error) {
      toast({
        title: 'Connection Error',
        description: 'Failed to test Supabase connection',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const testFirebase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-firebase');
      const data = await response.json();
      
      toast({
        title: data.status === 'success' ? 'Firebase Connected' : 
               data.status === 'warning' ? 'Firebase Initializing' : 'Firebase Error',
        description: data.message,
        variant: data.status === 'error' ? 'destructive' : 'default',
      });
      
      // Refresh data after test
      await handleRefresh();
    } catch (error) {
      toast({
        title: 'Connection Error',
        description: 'Failed to test Firebase connection',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Force database reset
  const handleReset = () => {
    setIsLoading(true);
    app.resetDatabase();
    toast({
      title: 'Database Reset',
      description: 'Attempting to connect to primary database',
    });
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Database Debug</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Active Database:</span>
              <Badge variant={activeDatabase === 'supabase' ? 'default' : 'secondary'}>
                {activeDatabase || 'None'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Supabase:</span>
              <Badge variant={supabaseStatus === 'Connected' ? 'default' : 'destructive'}>
                {supabaseStatus}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Firebase:</span>
              <Badge variant={firebaseStatus === 'Connected' ? 'default' : 'destructive'}>
                {firebaseStatus}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Fallback Active:</span>
              <Badge variant={app.databaseStatus.usingLocalFallback ? 'secondary' : 'outline'}>
                {app.databaseStatus.usingLocalFallback ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <Button 
              onClick={handleRefresh}
              className="w-full"
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            <Button 
              onClick={handleReset}
              className="w-full"
              variant="default"
              disabled={isLoading}
            >
              Reset to Primary Database
            </Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Data Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Menu Categories:</span>
              <span className="font-medium">{menuCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Tables:</span>
              <span className="font-medium">{tablesCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Settings:</span>
              <Badge variant={app.settings ? 'default' : 'destructive'}>
                {app.settings ? 'Loaded' : 'Not Loaded'}
              </Badge>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <Button 
              onClick={testSupabase}
              className="w-full"
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test Supabase Connection'}
            </Button>
            <Button 
              onClick={testFirebase}
              className="w-full"
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test Firebase Connection'}
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Hybrid Database Architecture</h2>
          <p className="text-sm text-gray-600 mb-4">
            This application uses a hybrid database architecture with Supabase as the primary database
            and Firebase as the fallback. If Supabase becomes unavailable, the application will automatically
            switch to Firebase to ensure continuity of service.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border rounded p-3">
              <h3 className="font-medium mb-1">Primary: Supabase</h3>
              <p className="text-xs text-gray-500">PostgreSQL-based, real-time capabilities</p>
            </div>
            <div className="border rounded p-3">
              <h3 className="font-medium mb-1">Fallback: Firebase</h3>
              <p className="text-xs text-gray-500">NoSQL document database, real-time sync</p>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            <p className="mb-2">
              <strong>Test Endpoints:</strong> Access the direct API endpoints to check database connectivity.
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  window.open('/api/test-supabase', '_blank');
                }}
                variant="outline"
                size="sm"
              >
                Supabase API
              </Button>
              <Button
                onClick={() => {
                  window.open('/api/test-firebase', '_blank');
                }}
                variant="outline"
                size="sm"
              >
                Firebase API
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
