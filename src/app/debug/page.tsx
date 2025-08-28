// Vercel Deployment Diagnostic Script
// Add this to your production app temporarily to debug issues

export default function DiagnosticPage() {
  const diagnosticInfo = {
    appwriteUrl: process.env.NEXT_PUBLIC_APPWRITE_URL || 'MISSING',
    appwriteProjectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'MISSING',
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
        <li><strong>APPWRITE_URL:</strong> {diagnosticInfo.appwriteUrl}</li>
        <li><strong>APPWRITE_PROJECT_ID:</strong> {diagnosticInfo.appwriteProjectId}</li>
        <li><strong>NODE_ENV:</strong> {diagnosticInfo.nodeEnv}</li>
      </ul>

      <h2>Runtime Info:</h2>
      <ul>
        <li><strong>Domain:</strong> {diagnosticInfo.domain}</li>
        <li><strong>Full URL:</strong> {diagnosticInfo.href}</li>
        <li><strong>Timestamp:</strong> {diagnosticInfo.timestamp}</li>
      </ul>

      <h2>Appwrite Connection Test:</h2>
      <div id="appwrite-test">Testing Appwrite connection...</div>

      <script dangerouslySetInnerHTML={{
        __html: `
          async function testAppwrite() {
            const testDiv = document.getElementById('appwrite-test');
            try {
              const response = await fetch('${diagnosticInfo.appwriteUrl}/health', {
                method: 'GET',
                headers: {
                  'X-Appwrite-Project': '${diagnosticInfo.appwriteProjectId}'
                }
              });
              
              if (response.ok) {
                testDiv.innerHTML = '✅ Appwrite connection successful!';
                testDiv.style.color = 'green';
              } else {
                testDiv.innerHTML = '❌ Appwrite connection failed: ' + response.status;
                testDiv.style.color = 'red';
              }
            } catch (error) {
              testDiv.innerHTML = '❌ Appwrite connection error: ' + error.message;
              testDiv.style.color = 'red';
            }
          }
          
          if (typeof window !== 'undefined') {
            setTimeout(testAppwrite, 1000);
          }
        `
      }} />
    </div>
  );
}
