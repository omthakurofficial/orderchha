import { NextResponse } from 'next/server';
import { auth } from '@/lib/appwrite';

export async function GET() {
  try {
    // Try to get current user to test Appwrite connection
    let connected = false;
    let errorMessage = null;
    
    try {
      // Try to get user but handle the error gracefully
      const user = await auth.getCurrentUser();
      connected = !!user;
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : 'Authentication check failed';
    }
    
    return NextResponse.json({
      status: connected ? 'ok' : 'error',
      connected: connected,
      details: connected 
        ? { message: 'Successfully connected to Appwrite' }
        : { error: errorMessage || 'Connection failed' }
    });
  } catch (error) {
    console.error('Appwrite check error:', error);
    
    return NextResponse.json({
      status: 'error',
      connected: false,
      details: { 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        hint: 'Check your Appwrite environment variables and make sure the service is available'
      }
    });
  }
}
