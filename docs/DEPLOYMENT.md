# AgentTrail Deployment Playbook

## 1. Provision Supabase
1. Create a new project at <https://supabase.com>.
2. Run [`supabase/schema.sql`](../supabase/schema.sql) against the project database (Supabase SQL editor or `psql`). This creates the `orgs`, `org_api_keys`, and `executions` tables, indexes, triggers, RLS policies, plus the public `receipts` storage bucket.
3. In **Storage → Buckets**, verify that `receipts` exists and is public. If not, create it manually (public, file size ≤ 50 MB).
4. Grab the following credentials and map them to env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`

## 2. Create orgs + API keys
1. Ensure the Supabase service role env vars are set locally.
2. Run `npm run create:org "Customer Name" [key-label]`.
3. The script prints a one-time API key—share it securely with the customer.
4. Each org can have multiple keys (rerun the script with an existing org ID if needed; schema allows additional inserts).

## 3. Configure Web3
1. Create a Base Sepolia RPC endpoint (Alchemy, Infura, etc.) or use the public fallback `https://base-sepolia.drpc.org`.
2. Generate a burner wallet and fund it with Base Sepolia ETH via <https://bridge.base.org/testnet>.
3. Deploy `src/contracts/AgentTrail.sol` using your preferred tool (Foundry, Hardhat, or `viem`).
4. Update `src/lib/web3/abi.ts` with the deployed contract address.
5. Map these env vars:
   - `BASE_SEPOLIA_RPC_URL`
   - `AGENT_WALLET_PRIVATE_KEY`
   - `AGENT_WALLET_ADDRESS`

## 3. Render Blueprint Deployment
1. Fork/clone `https://github.com/JohnClaw144/agentrail-clone`.
2. Push changes to `main` (Render auto-deploys that branch) **or** apply `render.yaml` to spin up a new service:

   ```bash
   render blueprint launch render.yaml
   ```

3. When prompted, paste the env vars from steps 1–2. Secrets are not stored in the repo—each key is marked `sync: false` in the blueprint on purpose.

## 4. Local Development
```bash
cp .env.local.example .env.local  # commit-safe template
npm install
npm run dev
```

## 5. Post-Deploy Checklist
- `curl https://agentrail-web.onrender.com` → returns 200 + recent executions.
- POST `/api/execute` with a TinyFish goal → Supabase row added, status `pending`.
- Monitor Render logs for `anchorOnChain` success; status flips to `completed` with a tx hash.
- Verification UI (`Verify On-Chain`) passes all 3 hash checks.

Document any manual credentials or infra changes here so the next deploy stays painless.
