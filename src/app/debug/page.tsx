// Vercel Deployment Diagnostic Script
// Add this to your production app temporarily to debug issues

export default function DiagnosticPage() {
  const diagnosticInfo = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'MISSING',
    nodeEnv: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    domain: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
    href: typeof window !== 'undefined' ? window.location.href : 'server-side'
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', background: '#f5f5f5' }}>
      <h1>🔧 Vercel Deployment Diagnostics</h1>
      
      <h2>Environment Variables:</h2>
      <ul>
        <li><strong>SUPABASE_URL:</strong> {diagnosticInfo.supabaseUrl}</li>
        <li><strong>SUPABASE_ANON_KEY:</strong> {diagnosticInfo.supabaseKey}</li>
        <li><strong>NODE_ENV:</strong> {diagnosticInfo.nodeEnv}</li>
      </ul>

      <h2>Runtime Info:</h2>
      <ul>
        <li><strong>Domain:</strong> {diagnosticInfo.domain}</li>
        <li><strong>Full URL:</strong> {diagnosticInfo.href}</li>
        <li><strong>Timestamp:</strong> {diagnosticInfo.timestamp}</li>
      </ul>

      <h2>Supabase Connection Test:</h2>
      <div id="supabase-test">Testing Supabase connection...</div>

      <script dangerouslySetInnerHTML={{
        __html: `
          async function testSupabase() {
            const testDiv = document.getElementById('supabase-test');
            try {
              const response = await fetch('${diagnosticInfo.supabaseUrl}/rest/v1/menu_items?select=id,name&limit=1', {
                method: 'GET',
                headers: {
                  'apikey': '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}',
                  'Authorization': 'Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}',
                  'Content-Type': 'application/json'
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                testDiv.innerHTML = '✅ Supabase connection successful! Data: ' + JSON.stringify(data);
                testDiv.style.color = 'green';
              } else {
                testDiv.innerHTML = '❌ Supabase connection failed: ' + response.status + ' - ' + await response.text();
                testDiv.style.color = 'red';
              }
            } catch (error) {
              testDiv.innerHTML = '❌ Supabase connection error: ' + error.message;
              testDiv.style.color = 'red';
            }
          }
          
          if (typeof window !== 'undefined') {
            setTimeout(testSupabase, 1000);
          }
        `
      }} />
    </div>
  );
}
