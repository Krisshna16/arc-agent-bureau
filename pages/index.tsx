import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// The Exact Application Binary Interface (ABI) representing your deployed contract functions
const CONTRACT_ABI = [
  "function totalPredictions() view returns (uint256)",
  "function getPredictionDetails(uint256 _id) view returns (string memory asset, uint256 price, address agent, bool resolved, bool success)",
  "function agentAccuracyScores(address _agent) view returns (uint256)"
];

export default function Dashboard() {
  const [contractAddress, setContractAddress] = useState('0x3d639e09F768b4c874571aC2b0aDa71496E89623'); // Pre-fill with your contract
  const [totalPreds, setTotalPreds] = useState('...');
  const [latestForecast, setLatestForecast] = useState<any>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Connect user's browser wallet (MetaMask)
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setUserAddress(accounts[0]);
        setWalletConnected(true);
      } catch (err) {
        alert("Wallet connection rejected.");
      }
    } else {
      alert("MetaMask not found! Please install the MetaMask extension.");
    }
  };

  // 2. Read live data directly from the Arc Testnet Chain
  const fetchBlockchainData = async () => {
    if (!contractAddress || !ethers.isAddress(contractAddress)) {
      alert("Please input a valid deployed contract address.");
      return;
    }
    setLoading(true);
    try {
      // Create a read-only provider targeting Arc Testnet RPC directly
      const provider = new ethers.JsonRpcProvider("https://arc-testnet.drpc.org");
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      
      // Fetch total number of predictions logged by your python agent
      const total = await contract.totalPredictions();
      const totalCount = Number(total);
      setTotalPreds(totalCount.toString());

      // If predictions exist, pull the details of the most recent one dynamically
      if (totalCount > 0) {
        const details = await contract.getPredictionDetails(totalCount);
        setLatestForecast({
          asset: details[0],
          price: details[1].toString(),
          agent: details[2],
          resolved: details[3],
          success: details[4]
        });
      }
    } catch (err) {
      console.error(err);
      alert("Error parsing contract data. Confirm it's deployed on Arc Testnet.");
    }
    setLoading(false);
  };

  // Run automatically when the webpage first loads
  useEffect(() => {
    fetchBlockchainData();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#090d16', color: '#f3f4f6', minHeight: '100vh' }}>
      
      {/* HEADER BAR */}
      <header style={{ marginBottom: '40px', borderBottom: '1px solid #1f2937', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#38bdf8', margin: '0 0 6px 0', fontWeight: '800', letterSpacing: '-0.5px' }}>⚡ Arc Agent Bureau</h1>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>Machine-to-Machine Autonomous Predictive Risk Ledger</p>
        </div>
        <button onClick={connectWallet} style={{ backgroundColor: walletConnected ? '#059669' : '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
          {walletConnected ? `Linked: ${userAddress.substring(0,6)}...${userAddress.substring(38)}` : 'Connect Wallet'}
        </button>
      </header>

      {/* MAIN LAYOUT */}
      <main style={{ display: 'grid', gap: '30px', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* CONTRACT SYNC PANEL */}
        <section style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid #1f2937' }}>
          <h2 style={{ fontSize: '16px', marginTop: 0, marginBottom: '12px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1. Target Contract Address</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="0x..." 
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#1f2937', color: '#fff', fontSize: '14px' }}
            />
            <button onClick={fetchBlockchainData} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Querying...' : 'Sync Data'}
            </button>
          </div>
        </section>

        {/* METRICS METERS */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          
          {/* TOTAL PREDICTIONS SCORECARD */}
          <div style={{ backgroundColor: '#111827', padding: '30px 24px', borderRadius: '12px', border: '1px solid #1f2937', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ margin: '0 0 10px 0', color: '#9ca3af', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Total AI Predictions Logged</p>
            <h3 style={{ fontSize: '56px', margin: 0, color: '#34d399', fontWeight: '800' }}>{totalPreds}</h3>
          </div>

          {/* LATEST AGENT STATE PANEL */}
          <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h2 style={{ fontSize: '16px', marginTop: 0, marginBottom: '16px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>2. Latest Live Agent Broadcast</h2>
            
            {latestForecast ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Target Index Asset:</span>
                  <span style={{ fontWeight: 'bold', color: '#fff' }}>{latestForecast.asset}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>AI Predicted Target Price:</span>
                  <span style={{ fontWeight: 'bold', color: '#34d399' }}>${latestForecast.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>Origin Agent Wallet:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#cbd5e1' }}>{latestForecast.agent.substring(0,8)}...{latestForecast.agent.substring(34)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <span style={{ color: '#9ca3af' }}>Market Evaluation State:</span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: latestForecast.resolved ? '#374151' : '#1e3a8a', color: latestForecast.resolved ? '#9ca3af' : '#60a5fa' }}>
                    {latestForecast.resolved ? 'RESOLVED / CLOSED' : '⚠️ OPEN / EVALUATING'}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: '#6b7280', margin: '20px 0 0 0', textAlign: 'center' }}>No prediction metrics found for this contract address yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
