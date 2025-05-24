import React from 'react';

export function EnvTest() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Environment Variables Test</h1>
      <pre>
        {JSON.stringify({
          hasClaudeKey: !!process.env.REACT_APP_CLAUDE_API_KEY,
          availableEnvVars: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')),
          nodeEnv: process.env.NODE_ENV
        }, null, 2)}
      </pre>
    </div>
  );
} 