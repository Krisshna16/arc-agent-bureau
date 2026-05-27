import React, { useState } from 'react';

/**
 * Dashboard UI Template for Arc Agent Bureau
 * Built utilizing clean layout conventions tailored for the Circle Agent Stack framework.
 */
export default function AgentDashboard() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('Idle');
  const [agents, setAgents] = useState([
    { id: 'AGE-01', target: 'BTC/USDC', status: 'Active Monitoring', efficiency: '98.4%' },
    { id: 'AGE-02', target: 'ETH/USDC', status: 'Assembling Pipeline', efficiency: '94.1%' }
  ]);

  const handleDeployAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    
    setStatus('Analyzing Natural Language Prompt...');
    setTimeout(() => {
      setStatus('Compiling Circle Agent Parameters...');
      setTimeout(() => {
        const newAgent = {
          id: `AGE-0${agents.length + 1}`,
          target: prompt.toUpperCase().includes('ETH') ? 'ETH/USDC' : 'BTC/USDC',
          status: 'Active Monitoring',
          efficiency: '100.0%'
        };
        setAgents([...agents, newAgent]);
        setStatus('Agent Successfully Initialized and Synced to Arc Testnet!');
        setPrompt('');
      }, 1200);
    }, 1000);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh' }}>
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #1f2937', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', color: '#38bdf8', margin: '0 0 10px 0' }}>Arc Agent Bureau</h1>
        <p style={{ color: '#9ca3af', margin: 0 }}>Natural Language Multi-Agent Infrastructure for Institutional Prediction Markets</p>
      </header>

      <main style={{ display: 'grid', gap: '30px' }}>
        {/* Input Interface Block */}
        <section style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid #1f2937' }}>
          <h2 style={{ fontSize: '18px', marginTop: 0, marginBottom: '16px' }}>Deploy New Autonomous Agent</h2>
          <form onSubmit={handleDeployAgent}>
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Deploy a conservative forecasting agent to monitor short-term BTC volatility..." 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#1f2937', color: '#fff', boxSizing: 'border-box', marginBottom: '16px' }}
            />
            <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              Spin Up Text-to-Agent Loop
            </button>
          </form>
          {status !== 'Idle' && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#1e1b4b', borderRadius: '6px', color: '#a5b4fc', border: '1px solid #312e81' }}>
              <strong>System Log:</strong> {status}
            </div>
          )}
        </section>

        {/* Live Active State Monitoring Table */}
        <section style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid #1f2937' }}>
          <h2 style={{ fontSize: '18px', marginTop: 0, marginBottom: '16px' }}>Active Core Deployments</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #374151', color: '#9ca3af' }}>
                <th style={{ padding: '12px' }}>Agent ID</th>
                <th style={{ padding: '12px' }}>Target Stream</th>
                <th style={{ padding: '12px' }}>Current State</th>
                <th style={{ padding: '12px' }}>Node Reliability</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 'mono' }}>{agent.id}</td>
                  <td style={{ padding: '12px' }}>{agent.target}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ backgroundColor: '#065f46', color: '#34d399', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                      {agent.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#10b981' }}>{agent.efficiency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
