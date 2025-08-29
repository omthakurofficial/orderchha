import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Try to get a simple response from Supabase
    let connected = false;
    let errorMessage = null;
    
    try {
      // Simple health check - try to query the settings table
      const { data, error } = await supabase.from('settings').select('*').limit(1);
      
      if (error) {
        errorMessage = error.message;
      } else {
        connected = true;
      }
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : 'Database query failed';
    }
    
    return NextResponse.json({
      status: connected ? 'ok' : 'error',
      connected: connected,
      details: connected 
        ? { message: 'Successfully connected to Supabase' }
        : { error: errorMessage || 'Connection failed' }
    });
  } catch (error) {
    console.error('Supabase check error:', error);
    
    return NextResponse.json({
      status: 'error',
      connected: false,
      details: { 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        hint: 'Check your Supabase environment variables and make sure the service is available'
      }
    });
  }
}
