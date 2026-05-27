import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ABI = [
  "function totalPredictions() view returns (uint256)",
  "function getPredictionDetails(uint256 _id) view returns (string asset, uint256 price, address agent, bool resolved, bool success)"
];

export default function Dashboard() {
  const [contractAddress, setContractAddress] = useState('0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8');
  const [totalPreds, setTotalPreds] = useState('0');
  const [latestForecast, setLatestForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchBlockchainData = async () => {
    if (!contractAddress || !ethers.isAddress(contractAddress)) {
      alert("Invalid address.");
      return;
    }
    
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider("https://arc-testnet.drpc.org");
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      
      const total = await contract.totalPredictions();
     // Replace your fetching logic with this safe check:
        const count = Number(total);
        setTotalPreds(count.toString());
        
        if (count > 0) {
          // Use (count - 1) because the 7th item is at index 6
          const lastIndex = count - 1;
          const data = await contract.getPredictionDetails(lastIndex);
          
          setLatestForecast({
            asset: data.asset,
            price: data.price.toString(),
            agent: data.agent,
            resolved: data.resolved,
            success: data.success
          });
        } catch (e) {
          // Attempt 0-based index if 1-based fails
          const data = await contract.getPredictionDetails(count - 1);
          setLatestForecast({
            asset: data.asset,
            price: data.price.toString(),
            agent: data.agent,
            resolved: data.resolved,
            success: data.success
          });
        }
      }
    } catch (err) {
      console.error("Sync Error:", err);
      // We no longer alert here to keep the UI clean if only the "latest" fetch fails
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
          style={{ padding: '10px', width: '350px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '5px' }}
        />
        <button onClick={fetchBlockchainData} style={{ marginLeft: '10px', padding: '10px 20px', cursor: 'pointer', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '5px' }}>
          {loading ? 'Syncing...' : 'Sync Data'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
          <h3>Total Predictions</h3>
          <p style={{ fontSize: '56px', color: '#34d399', margin: '10px 0' }}>{totalPreds}</p>
        </div>

        <div style={{ background: '#111827', padding: '20px', borderRadius: '10px', border: '1px solid #1f2937' }}>
          <h3>Latest Broadcast</h3>
          {latestForecast ? (
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p><strong>Asset:</strong> {latestForecast.asset}</p>
              <p><strong>Price:</strong> ${latestForecast.price}</p>
              <p><strong>Status:</strong> {latestForecast.resolved ? '✅ Resolved' : '⚠️ Active'}</p>
              <p><strong>Agent:</strong> {latestForecast.agent.substring(0, 10)}...</p>
            </div>
          ) : <p style={{ color: '#6b7280' }}>No broadcast data retrieved.</p>}
        </div>
      </div>
    </div>
  );
}
