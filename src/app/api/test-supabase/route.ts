import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Perform a simple query to test the connection
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      
      return NextResponse.json({
        status: 'error',
        message: `Supabase connection failed: ${error.message}`,
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection successful',
      data: {
        categories: data?.length || 0,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Supabase connection failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
