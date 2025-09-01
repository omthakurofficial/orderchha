import { NextResponse } from 'next/server';
import { initFirebase } from '@/lib/firebase-bridge';

export async function GET() {
  try {
    // Get the Firebase DB instance
    const { db, isFirebaseAvailable } = initFirebase();
    
    if (!isFirebaseAvailable) {
      return NextResponse.json({
        status: 'warning',
        message: 'Firebase is not available yet (async initialization in progress)',
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }
    
    // Try to get some data to verify the connection
    const menuData = await db.getMenu();
    const tablesData = await db.getTables();
    const settingsData = await db.getSettings();
    
    return NextResponse.json({
      status: 'success',
      message: 'Firebase connection successful',
      data: {
        menuCount: menuData.length,
        tablesCount: tablesData.length,
        settingsAvailable: !!settingsData,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Firebase connection failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
