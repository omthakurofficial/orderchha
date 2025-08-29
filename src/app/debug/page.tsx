'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function DiagnosticPage() {
  const [environmentChecks, setEnvironmentChecks] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkDone, setCheckDone] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<any>(null);
  
  // Basic diagnostic info
  const diagnosticInfo = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'MISSING',
    appwriteUrl: process.env.NEXT_PUBLIC_APPWRITE_URL || 'MISSING',
    appwriteProjectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ? 'SET (hidden)' : 'MISSING',
    nodeEnv: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    domain: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
    href: typeof window !== 'undefined' ? window.location.href : 'server-side'
  };
  
  async function checkSupabase() {
    try {
      const response = await fetch('/api/debug/check-supabase', {
        method: 'GET',
      });
      const result = await response.json();
      return { supabase: result };
    } catch (error: any) {
      console.error('Supabase check failed:', error);
      return { supabase: { error: error.message || 'Failed to connect to Supabase' } };
    }
  }
  
  async function checkAppwrite() {
    try {
      const response = await fetch('/api/debug/check-appwrite', {
        method: 'GET', 
      });
      const result = await response.json();
      return { appwrite: result };
    } catch (error: any) {
      console.error('Appwrite check failed:', error);
      return { appwrite: { error: error.message || 'Failed to connect to Appwrite' } };
    }
  }
  
  async function runAllChecks() {
    setIsLoading(true);
    setEnvironmentChecks({
      NEXT_PUBLIC_APPWRITE_URL: process.env.NEXT_PUBLIC_APPWRITE_URL ? 'Set ✅' : 'Missing ❌',
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ? 'Set ✅' : 'Missing ❌',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✅' : 'Missing ❌',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌',
    });
    
    try {
      const [supabaseResult, appwriteResult] = await Promise.all([
        checkSupabase(),
        checkAppwrite(),
      ]);
      
      setServiceStatus({
        ...supabaseResult,
        ...appwriteResult,
      });
    } catch (error: any) {
      console.error('Error running checks:', error);
      setServiceStatus({
        error: error.message || 'An unknown error occurred while running checks',
      });
    } finally {
      setIsLoading(false);
      setCheckDone(true);
    }
  }
  
  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">OrderChha System Diagnostics</h1>
        <p className="text-muted-foreground">
          Diagnose and troubleshoot application issues
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Service Connection Tests</h2>
          <p className="mb-4 text-muted-foreground">
            Check connections to your backend services and identify any configuration issues.
          </p>
          <Button 
            onClick={runAllChecks} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Running Checks...' : 'Run Diagnostic Checks'}
          </Button>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <ul className="space-y-2">
            <li><strong>Supabase URL:</strong> {diagnosticInfo.supabaseUrl}</li>
            <li><strong>Supabase Key:</strong> {diagnosticInfo.supabaseKey}</li>
            <li><strong>Appwrite URL:</strong> {diagnosticInfo.appwriteUrl}</li>
            <li><strong>Appwrite Project:</strong> {diagnosticInfo.appwriteProjectId}</li>
            <li><strong>Node Env:</strong> {diagnosticInfo.nodeEnv}</li>
            <li><strong>Domain:</strong> {diagnosticInfo.domain}</li>
          </ul>
        </Card>
      </div>
      
      {environmentChecks && (
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="bg-muted p-4 rounded overflow-auto">
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(environmentChecks, null, 2)}
            </pre>
          </div>
        </Card>
      )}
      
      {serviceStatus && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Service Status</h2>
          <div className="bg-muted p-4 rounded overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(serviceStatus, null, 2)}
            </pre>
          </div>
          
          {checkDone && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Diagnosis</h3>
              
              {serviceStatus?.error ? (
                <div className="bg-red-50 p-4 rounded text-red-700">
                  <p className="font-semibold mb-1">🔴 Critical Issues Found</p>
                  <p>Please check the error details above and fix the configuration.</p>
                </div>
              ) : serviceStatus?.supabase?.error || serviceStatus?.appwrite?.error ? (
                <div className="bg-yellow-50 p-4 rounded text-yellow-700">
                  <p className="font-semibold mb-1">⚠️ Some Services Have Issues</p>
                  <p>Fix the services showing errors above to ensure full functionality.</p>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded text-green-700">
                  <p className="font-semibold mb-1">✅ All Systems Operational</p>
                  <p>Your application is configured correctly.</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
