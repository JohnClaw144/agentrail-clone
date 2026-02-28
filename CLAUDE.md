# Project Overview: AgentTrail
You are an expert full-stack Web3 and AI engineer operating in 2026. We are building "AgentTrail," an enterprise-grade Proof-of-Action audit layer for AI agents. 
We use the TinyFish API to execute web browser automation tasks, and we anchor cryptographic hashes of those execution results on the Base Sepolia blockchain using `viem`.

## Strict Tech Stack & Versioning
- **Framework:** Next.js 16 (App Router). Do NOT use Pages router. Use Server Components by default.
- **Styling:** Tailwind CSS + Shadcn UI components.
- **Database & Storage:** Supabase.
- **Web Execution:** TinyFish API.
- **Blockchain:** `viem` (v2.4x). Do NOT use `ethers.js` or `web3.js`. 

## Architecture Rules & Guardrails

### 1. TinyFish API Integration
- TinyFish uses Server-Sent Events (SSE) (`/v1/automation/run-sse`). You must handle this using native standard Fetch streams or `eventsource-parser`.
- Only capture the final state for hashing when TinyFish emits the `completed` event.

### 2. Blockchain / Web3 Best Practices
- Blockchain writes are slow. NEVER block the main API response waiting for a transaction to mine. Return a `receipt_id` with `status: 'pending'` immediately to the client.
- Always wrap `viem` contract calls in robust `try/catch` blocks, as public testnet RPCs frequently drop connections.
- Keep the smart contract ABI and config isolated in a `src/lib/web3/` directory.

### 3. Cryptography & Hashing
- Do NOT hash raw HTML. It is non-deterministic.
- To create the PoA Hash, construct exactly this object: 
  `const payload = JSON.stringify({ goal, url, timestamp, screenshot_url });`
- Hash it using Node's native module: `crypto.createHash('sha256').update(payload).digest('hex')`.

### 4. Supabase Integration
- Use `@supabase/ssr` for server-side database access inside Next.js 16 App Router.
- Store the images in a Supabase Storage bucket named `receipts`. Store the metadata in a Postgres table named `executions`.

## Operating Procedure
When executing prompts, do not blindly generate 500 lines of code. 
1. Acknowledge the architecture rules.
2. Outline the files you intend to create/modify.
3. Write the code, prioritizing strong TypeScript typing and error handling.
