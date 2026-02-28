// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AgentTrail — Proof-of-Action receipt anchor
/// @notice Stores SHA-256 PoA hashes as event logs on Base Sepolia.
///         No state writes — events are the cheapest immutable anchor.
contract AgentTrail {
    event ReceiptStored(
        address indexed agent,
        string poaHash,
        uint256 timestamp
    );

    /// @notice Emit a PoA hash on-chain.
    /// @param poaHash The SHA-256 hex string of the execution payload.
    function storeReceipt(string calldata poaHash) external {
        emit ReceiptStored(msg.sender, poaHash, block.timestamp);
    }
}
