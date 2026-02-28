# Product Requirements Document: AgentTrail

## 1. Product Overview
**AgentTrail** is an enterprise-grade "Proof-of-Action" (PoA) layer for AI web agents. It wraps the TinyFish browser execution API to provide cryptographically verifiable, immutable receipts of AI actions, anchored on the Base L2 blockchain. 

## 2. The Problem
Enterprise compliance and CISO teams block AI agents from executing web tasks (like paying invoices or changing settings) because "the AI said it worked" is not a legally defensible audit trail. They need mathematical proof of exactly what the AI saw and clicked.

## 3. The Solution
When an AI agent needs to perform a web task, it calls AgentTrail. AgentTrail proxies the request to TinyFish. When TinyFish completes the task, AgentTrail captures the final state, hashes the payload (intent + URL + screenshot), stores the encrypted files in Supabase, and anchors the SHA-256 hash to a smart contract on Base Sepolia.

## 4. Core Technologies (2026 Latest)
*   **Framework:** Next.js 16 (App Router, Turbopack, React 19.2 features)
*   **Language:** TypeScript (Strict mode)
*   **Styling:** Tailwind CSS + Shadcn UI
*   **Backend/Auth/Storage:** Supabase (PostgreSQL, Edge Functions, S3 Buckets)
*   **Web Execution:** TinyFish API (specifically using SSE streaming)
*   **Web3 / Blockchain:** Base Sepolia Testnet, `viem` v2.4x for contract interaction

## 5. MVP Scope & Features
**Feature 1: The Execution API Endpoint**
*   An API route (`/api/execute`) that accepts `{ goal: string, url: string }`.
*   Connects to TinyFish via Server-Sent Events (SSE) and waits for `status: "completed"`.

**Feature 2: State Capture & Hashing**
*   Extracts the final screenshot, URL, and timestamp from the TinyFish result.
*   Generates a SHA-256 hash using the native Node `crypto` module based on a strict JSON payload.

**Feature 3: Storage & Blockchain Anchoring**
*   Uploads the screenshot to Supabase Storage.
*   Writes the execution metadata to a Supabase Postgres table.
*   Uses `viem` to write the SHA-256 hash to a Base Sepolia smart contract asynchronously.

**Feature 4: Verification Dashboard**
*   A React frontend displaying a table of recent executions.
*   A detailed view showing the screenshot and the original intent.
*   A "Verify on-chain" button that fetches the hash from the smart contract and compares it to a locally computed hash of the Supabase data to prove immutability.
