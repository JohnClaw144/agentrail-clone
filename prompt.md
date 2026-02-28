Hello Claude. Please read the `claude.md` and `PRD.md` files in the root directory to understand the AgentTrail architecture, rules, and tech stack.

To kick off Phase 1 of the MVP, we need to build the foundational data and blockchain layers. Please execute the following tasks sequentially:

**Task 1: The Smart Contract Setup**
1. Create a file `src/contracts/AgentTrail.sol`. Write a simple, gas-optimized Solidity smart contract for Base Sepolia. It should have one primary function: `storeReceipt(string calldata poaHash)` and it should emit an event `ReceiptStored(address indexed agent, string poaHash, uint256 timestamp)`.
2. Create a mock ABI file at `src/lib/web3/abi.ts` containing the ABI for this contract.
3. Create a `src/lib/web3/client.ts` file that initializes a `viem` public client and wallet client connected to the Base Sepolia chain using a private key from environment variables.

**Task 2: The Supabase Types**
1. Create a `src/types/database.ts` file. Define the TypeScript interfaces for our `executions` table. It must include fields for: `id` (UUID), `goal` (string), `target_url` (string), `screenshot_url` (string), `poa_hash` (string), `tx_hash` (string - nullable), and `status` (enum: 'pending', 'completed', 'failed').

**Task 3: The Hashing Utility**
1. Create a utility function at `src/lib/crypto/hashPayload.ts` that takes the `goal`, `url`, `timestamp`, and `screenshot_url`, formats them into a strict JSON string, and returns a SHA-256 hex string using Node's native `crypto` module.

Please outline your approach to these three tasks and ask for my confirmation before generating the code. Let's make sure our TypeScript types and `viem` imports are perfectly aligned with 2026 standards.
