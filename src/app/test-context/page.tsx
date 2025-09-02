'use client';

import { useApp } from "@/context/app-context";

export default function TestContextPage() {
  try {
    const { isLoaded, currentUser } = useApp();
    
    return (
      <div className="p-8">
        <h1>Context Test</h1>
        <p>✅ Context is working!</p>
        <p>isLoaded: {isLoaded ? 'Yes' : 'No'}</p>
        <p>currentUser: {currentUser ? currentUser.name : 'None'}</p>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1>Context Test</h1>
        <p>❌ Context Error:</p>
        <pre>{String(error)}</pre>
      </div>
    );
  }
}
