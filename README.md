# AgentTrail

Proof-of-Action receipts for AI web agents. AgentTrail proxies TinyFish browser automations, stores verifiable outputs in Supabase, and anchors SHA-256 hashes on Base Sepolia via a lightweight Solidity contract.

## Stack
- **Framework:** Next.js 16 (App Router, React 19)
- **Styling:** Tailwind v4 + Shadcn-inspired components
- **Data:** Supabase (Postgres + Storage `receipts` bucket)
- **Web Execution:** TinyFish `run-sse` streaming API
- **Web3:** `viem` v2 clients + `AgentTrail.sol` on Base Sepolia
- **Hosting:** Render (starter plan, Oregon region)

## Prerequisites
1. Supabase project + service role key
2. TinyFish API key
3. Base Sepolia RPC endpoint (Alchemy/Infura or the public DRPC fallback)
4. Burner wallet funded with Base Sepolia ETH

Copy the example env file and populate the secrets:
```bash
cp .env.example .env.local
```

## Local Development
```bash
npm install
npm run dev
```
Open <http://localhost:3000> and POST to `/api/execute` with `{ goal, url }` and an API key header to mint a PoA receipt.

## Multi-tenant API keys
1. Apply the latest schema:
   ```bash
   psql $SUPABASE_URL < supabase/schema.sql   # or run via Supabase SQL editor
   ```
2. Create an org + API key (requires service role key in your env):
   ```bash
   npm run create:org "Acme Corp" [key-label]
   ```
   The script prints the plaintext key once—store it securely.
3. Use the key in `Authorization: Bearer <key>` or `X-AgentTrail-Key: <key>` headers.
4. Every `/api/*` request is scoped to the issuing org via Supabase + RLS.

See [`docs/API.md`](./docs/API.md) for request/response examples, visit the in-app reference at `/docs`, and grab the Postman collection from `/postman/agenttrail.postman_collection.json`.

## Deployments
Render blueprint + Supabase schema live in the repo:
- [`render.yaml`](./render.yaml) — reproducible Render service config
- [`supabase/schema.sql`](./supabase/schema.sql) — tables, triggers, storage bucket, RLS
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — end-to-end runbook

Pushes to `main` auto-deploy via Render. To redeploy manually:
```bash
curl -s -X POST \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  https://api.render.com/v1/services/srv-d6hloncr85hc739i6k1g/deploys
```

## SDKs & tooling
- Node SDK in `sdk/js` (build via `npm run build:sdk`).
- Postman collection in `public/postman/agenttrail.postman_collection.json`.
- API docs route at `/docs`.

## Roadmap Highlights
- Supabase migrations + storage bucket ✅
- Proof viewer & download links ✅
- Status filters + better dashboard UX ✅
- Background anchoring + manual retries ✅
- Multi-tenant API auth + key tooling ✅
- API docs route + Postman + JS SDK ✅
- Upcoming: webhook callbacks, CLI tooling, Python SDK.
