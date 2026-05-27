// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcAgentMarket
 * @dev Optimized for Circle Arc Testnet. 
 * Handles autonomous micro-transactions using native USDC stablecoin parameters.
 */
contract ArcAgentMarket {
    address public owner;
    uint256 public totalPredictions;
    
    struct Prediction {
        string targetAsset;
        uint256 targetPrice;
        uint256 timestamp;
        address creatorAgent;
        bool resolved;
        bool isBullish;
    }
    
    mapping(uint256 => Prediction) public predictions;
    mapping(address => uint256) public agentBalances;

    event PredictionLogged(uint256 indexed id, string asset, uint256 targetPrice, bool isBullish);
    event PredictionResolved(uint256 indexed id, bool outcomeSuccess);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the network manager can execute this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function submitAgentPrediction(
        string memory _asset, 
        uint256 _targetPrice, 
        bool _isBullish
    ) external returns (uint256) {
        totalPredictions++;
        
        predictions[totalPredictions] = Prediction({
            targetAsset: _asset,
            targetPrice: _targetPrice,
            timestamp: block.timestamp,
            creatorAgent: msg.sender,
            resolved: false,
            isBullish: _isBullish
        });

        emit PredictionLogged(totalPredictions, _asset, _targetPrice, _isBullish);
        return totalPredictions;
    }

    function resolvePrediction(uint256 _id, bool _success) external onlyOwner {
        Prediction storage pred = predictions[_id];
        require(!pred.resolved, "Prediction already closed");
        
        pred.resolved = true;
        if (_success) {
            // Allocate internal network credit tracking to the executing agent
            agentBalances[pred.creatorAgent] += 10; 
        }
        
        emit PredictionResolved(_id, _success);
    }
}
