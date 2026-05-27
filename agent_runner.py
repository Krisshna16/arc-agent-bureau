import os
import sys
import json
import urllib.request
from web3 import Web3

print("Initializing Python Agent Script Execution...", flush=True)

def get_live_market_price():
    print("Fetching live Bitcoin market metric feed...", flush=True)
    try:
        url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            price = float(data['bitcoin']['usd'])
            print(f"Market Metric API Success: Live BTC is ${price}", flush=True)
            return price
    except Exception as e:
        print(f"Warning - Data feed fallback active: {e}", flush=True)
        return 65000.0

def main():
    # Utilizing an open public community endpoint for Arc Testnet nodes
    arc_rpc_url = "https://arc-testnet.drpc.org" 
    print(f"Connecting to Arc Testnet Node Endpoint: {arc_rpc_url}", flush=True)
    
    w3 = Web3(Web3.HTTPProvider(arc_rpc_url))
    
    if not w3.is_connected():
        print("CRITICAL ERROR: Unable to establish connection to Arc Testnet Nodes.", flush=True)
        sys.exit(1)
    print("Successfully connected to Arc Network Infrastructure!", flush=True)

    private_key = os.getenv("AGENT_PRIVATE_KEY")
    contract_address = os.getenv("PREDICTION_CONTRACT_ADDRESS")
    
    if not private_key:
        print("CRITICAL ERROR: AGENT_PRIVATE_KEY secret variable is missing or empty.", flush=True)
        sys.exit(1)
    if not contract_address:
        print("CRITICAL ERROR: PREDICTION_CONTRACT_ADDRESS secret variable is missing or empty.", flush=True)
        sys.exit(1)
        
    account = w3.eth.account.from_key(private_key)
    contract_address = w3.to_checksum_address(contract_address)
    print(f"Agent Wallet Address Loaded: {account.address}", flush=True)
    print(f"Target Smart Contract Linked: {contract_address}", flush=True)

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

    contract = w3.eth.contract(address=contract_address, abi=abi)
    current_btc = get_live_market_price()
    
    is_bullish = int(current_btc) % 2 != 0
    target_prediction_price = int(current_btc * 1.02 if is_bullish else current_btc * 0.98)

    print(f"Assembling Transaction: Sending Target Direction {'UP' if is_bullish else 'DOWN'} to ${target_prediction_price}", flush=True)

    print("Fetching account nonce balance...", flush=True)
    nonce = w3.eth.get_transaction_count(account.address)
    
    print("Building on-chain raw transaction payload...", flush=True)
    tx = contract.functions.submitAgentPrediction(
        "BTC",
        target_prediction_price,
        is_bullish
    ).build_transaction({
        'chainId': 5042002,
        'gas': 150000,
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce,
    })

    print("Signing transaction payload with agent cryptographic key...", flush=True)
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=private_key)
    
    print("Broadcasting signed payload transaction to Arc mempool...", flush=True)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    
    print("--- SUCCESS LOG ACTIVATED ---", flush=True)
    print(f"Transaction Hash Trackable via Arcscan: {w3.to_hex(tx_hash)}", flush=True)

if __name__ == "__main__":
    main()
