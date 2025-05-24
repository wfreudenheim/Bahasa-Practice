import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log('Debug Information:');
    console.log('Is Browser:', typeof window !== 'undefined');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('NEXT_PUBLIC_CLAUDE_API_KEY exists:', !!process.env.NEXT_PUBLIC_CLAUDE_API_KEY);
    console.log('All NEXT_PUBLIC_ vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
  }, []);

  // Server-side value
  const serverValue = process.env.NEXT_PUBLIC_CLAUDE_API_KEY ? 'Set' : 'Not set';

  return (
    <div style={{ padding: '20px' }}>
      <h1>Environment Variable Debug</h1>
      
      <h2>Server-side Check</h2>
      <p>NEXT_PUBLIC_CLAUDE_API_KEY (Server): {serverValue}</p>
      
      <h2>Client-side Check</h2>
      {isClient && (
        <p>NEXT_PUBLIC_CLAUDE_API_KEY (Client): {process.env.NEXT_PUBLIC_CLAUDE_API_KEY ? 'Set' : 'Not set'}</p>
      )}
      
      <h2>Additional Information</h2>
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>Is Client Rendered: {isClient ? 'Yes' : 'No'}</p>
      
      <h2>All Environment Variables</h2>
      <pre>
        {JSON.stringify(
          Object.keys(process.env)
            .filter(key => key.startsWith('NEXT_PUBLIC_'))
            .reduce((acc, key) => ({ ...acc, [key]: process.env[key] ? 'Set' : 'Not set' }), {}),
          null,
          2
        )}
      </pre>
    </div>
  );
} 