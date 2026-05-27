import os
import sys
import json
import random
import urllib.request
from web3 import Web3

print("--- Initializing Circle Agent Stack Execution Pipeline ---", flush=True)

def fetch_market_metric(asset_slug):
    """Programmatic retrieval of asset pricing data."""
    print(f"Retrieving live metrics from decentralized feed for: {asset_slug}...", flush=True)
    try:
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={asset_slug}&vs_currencies=usd"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            price = float(data[asset_slug]['usd'])
            print(f"Feed Success - Active {asset_slug.upper()} Index: ${price}", flush=True)
            return price
    except Exception as e:
        print(f"Data layer fallback active: {e}", flush=True)
        return 68000.0 if asset_slug == "bitcoin" else 3600.0

def main():
    # Setup network point mapping (Arc Testnet parameters)
    arc_rpc = "https://arc-testnet.drpc.org"
    w3 = Web3(Web3.HTTPProvider(arc_rpc))
    
    if not w3.is_connected():
        print("CRITICAL ERROR: Handshake failed with the Arc RPC gateway.")
        sys.exit(1)
    print("Handshake verified with Arc RPC interface.", flush=True)

    private_key = os.getenv("AGENT_PRIVATE_KEY")
    contract_address = os.getenv("PREDICTION_CONTRACT_ADDRESS")
    
    if not private_key or not contract_address:
        print("CRITICAL ERROR: Agent environmental credential mapping missing.")
        sys.exit(1)

    agent_identity = w3.eth.account.from_key(private_key)
    contract_checksum = w3.to_checksum_address(contract_address)
    print(f"Agent Execution Wallet Authorized: {agent_identity.address}", flush=True)

    abi = [
        {
            "inputs": [
                {"internalType": "string", "name": "_asset", "type": "string"},
                {"internalType": "uint256", "name": "_targetPrice", "type": "uint256"},
                {"internalType": "bool", "name": "_isBullish", "type": "bool"}
            ],
            "name": "submitAgentPrediction",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]
    
    contract_instance = w3.eth.contract(address=contract_checksum, abi=abi)

    # Dynamic target indexing 
    market_options = ["bitcoin", "ethereum"]
    active_target = random.choice(market_options)
    symbol_label = "BTC" if active_target == "bitcoin" else "ETH"

    # Algorithmic forecasting processing
    live_price = fetch_market_metric(active_target)
    direction_is_bullish = int(live_price) % 2 != 0
    multiplier = 1.02 if direction_is_bullish else 0.98
    projection_target = int(live_price * multiplier)

    print(f"Agent Strategy Generated: Target tracking {symbol_label} heading {'UP' if direction_is_bullish else 'DOWN'} toward ${projection_target}", flush=True)

    # Transact using automated nonces and Arc infrastructure parameters
    nonce = w3.eth.get_transaction_count(agent_identity.address)
    raw_tx = contract_instance.functions.submitAgentPrediction(
        symbol_label,
        projection_target,
        direction_is_bullish
    ).build_transaction({
        'chainId': 5042002,
        'gas': 160000,
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce,
    })

    print("Signing operational payload...", flush=True)
    signed_tx = w3.eth.account.sign_transaction(raw_tx, private_key=private_key)
    
    print("Emitting payload directly to mempool...", flush=True)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    print("--- EMISSION SUCCESS LOG OVERVIEW ---", flush=True)
    print(f"Live Verification Link: https://testnet.arcscan.app/tx/{w3.to_hex(tx_hash)}", flush=True)

if __name__ == "__main__":
    main()
