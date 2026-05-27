import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Clean, compatible ABI for ArcAgentMarket
const CONTRACT_ABI = [
  "function totalPredictions() view returns (uint256)",
  "function getPredictionDetails(uint256 _id) view returns (string asset, uint256 price, address agent, bool resolved, bool success)"
];

export default function Dashboard() {
  const [contractAddress, setContractAddress] = useState('0xd9145CCE52D386f254917e481eB44e9943F39138');
  const [totalPreds, setTotalPreds] = useState('0');
  const [latestForecast, setLatestForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchBlockchainData = async () => {
    if (!contractAddress || !ethers.isAddress(contractAddress)) {
      alert("Invalid contract address format.");
      return;
    }
    
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider("https://arc-testnet.drpc.org");
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      
      // 1. Fetch count
      const total = await contract.totalPredictions();
      const count = Number(total);
      setTotalPreds(count.toString());

      // 2. Fetch latest prediction if exists
      if (count > 0) {
        const data = await contract.getPredictionDetails(count);
        setLatestForecast({
          asset: data.asset,
          price: data.price.toString(),
          agent: data.agent,
          resolved: data.resolved,
          success: data.success
        });
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      alert("Failed to sync: Ensure address 0x3d6... is deployed on Arc Testnet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#090d16', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#38bdf8' }}>⚡ Arc Agent Bureau Dashboard</h1>
      
      <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <input 
          value={contractAddress} 
          onChange={(e) => setContractAddress(e.target.value)}
          style={{ padding: '10px', width: '300px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: '5px' }}
        />
        <button onClick={fetchBlockchainData} style={{ marginLeft: '10px', padding: '10px 20px', cursor: 'pointer' }}>
          {loading ? 'Syncing...' : 'Sync Data'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#111827', padding: '20px', borderRadius: '10px' }}>
          <h3>Total Predictions</h3>
          <p style={{ fontSize: '40px', color: '#34d399' }}>{totalPreds}</p>
        </div>

        <div style={{ background: '#111827', padding: '20px', borderRadius: '10px' }}>
          <h3>Latest Broadcast</h3>
          {latestForecast ? (
            <div>
              <p>Asset: {latestForecast.asset}</p>
              <p>Price: ${latestForecast.price}</p>
              <p>Status: {latestForecast.resolved ? 'Resolved' : 'Active'}</p>
            </div>
          ) : <p>No data available yet.</p>}
        </div>
      </div>
    </div>
  );
}
