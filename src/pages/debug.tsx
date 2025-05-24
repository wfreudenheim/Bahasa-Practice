import { useEffect } from 'react';

export default function DebugPage() {
  useEffect(() => {
    console.log('Environment variables in debug page:', {
      NEXT_PUBLIC_CLAUDE_API_KEY: process.env.NEXT_PUBLIC_CLAUDE_API_KEY ? 'Set' : 'Not set',
      allEnvVars: process.env
    });
  }, []);

  return (
    <div>
      <h1>Debug Environment Variables</h1>
      <p>Check the console for environment variable information</p>
      <p>NEXT_PUBLIC_CLAUDE_API_KEY is: {process.env.NEXT_PUBLIC_CLAUDE_API_KEY ? 'Set' : 'Not set'}</p>
    </div>
  );
} 