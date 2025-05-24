export async function getServerSideProps() {
  return {
    props: {
      envCheck: {
        hasKey: !!process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        allNextPublicVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
      }
    }
  };
}

export default function EnvTest({ envCheck }: { envCheck: any }) {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Environment Test Page</h1>
      <h2>Server-side Check:</h2>
      <pre>{JSON.stringify(envCheck, null, 2)}</pre>
      
      <h2>Client-side Check:</h2>
      <pre>{JSON.stringify({
        hasKey: !!process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
        nodeEnv: process.env.NODE_ENV,
        allNextPublicVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
      }, null, 2)}</pre>
    </div>
  );
} 