'use client';

import { useApp } from "@/context/app-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DemoPage() {
  const { currentUser } = useApp();
  
  const enableDemoMode = () => {
    localStorage.setItem('orderchha-demo-mode', 'true');
    window.location.reload();
  };
  
  const disableDemoMode = () => {
    localStorage.removeItem('orderchha-demo-mode');
    window.location.reload();
  };

  const isDemoMode = typeof window !== 'undefined' && 
                    localStorage.getItem('orderchha-demo-mode') === 'true';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>🎭 Demo Mode</CardTitle>
          <CardDescription>
            Enable demo mode to test mobile footer navigation without authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            {isDemoMode ? (
              <Badge variant="default">Demo Mode Active</Badge>
            ) : (
              <Badge variant="secondary">Demo Mode Disabled</Badge>
            )}
          </div>
          
          {currentUser && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Current User:</h3>
              <p><strong>Name:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Role:</strong> {currentUser.role}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            {!isDemoMode ? (
              <Button onClick={enableDemoMode}>
                Enable Demo Mode
              </Button>
            ) : (
              <Button variant="outline" onClick={disableDemoMode}>
                Disable Demo Mode
              </Button>
            )}
          </div>
          
          {isDemoMode && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">📱 Mobile Footer Testing:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                <li>Open browser developer tools (F12)</li>
                <li>Toggle device toolbar (Ctrl+Shift+M or Cmd+Shift+M)</li>
                <li>Select a mobile device or set width &lt; 768px</li>
                <li>Navigate to any page (/, /profile, /dashboard, etc.)</li>
                <li>Check if mobile footer appears at the bottom</li>
                <li>Try clicking footer navigation items</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
