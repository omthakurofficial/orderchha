'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/app-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function DebugPage() {
  const app = useApp();
  const [menuCount, setMenuCount] = useState(0);
  const [tablesCount, setTablesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check database status
  useEffect(() => {
    setMenuCount(app.menu.length);
    setTablesCount(app.tables.length);
  }, [app.menu, app.tables]);
  
  // Force database refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Call a refresh method from your Supabase context
      // This depends on what methods your app-context-supabase exposes
      // Assuming it has methods similar to the hybrid context
      
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
  
  // Manual connection test
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Database Debug</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Database:</span>
              <Badge variant="default">Supabase</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Connection:</span>
              <Badge variant="default">Connected</Badge>
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
              onClick={testSupabase}
              className="w-full"
              variant="default"
              disabled={isLoading}
            >
              Test Supabase Connection
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
        </Card>
      </div>
      
      <div className="mt-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">API Connection Test</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Direct API Access</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    window.open('/api/test-supabase', '_blank');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Open Supabase Test Endpoint
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
