# AgentTrail API (v0.1)

All endpoints require an API key issued per organization. Include the key in one of the following headers:

```
Authorization: Bearer <api-key>
# or
x-agenttrail-key: <api-key>
```

Base URL examples:
- Production: `https://agentrail-web.onrender.com`
- Local dev: `http://localhost:3000`

## POST /api/execute
Create a new Proof-of-Action request.

**Request body**
```json
{
  "goal": "Extract the current price of Bitcoin",
  "url": "https://www.coinbase.com/price/bitcoin"
}
```

**Response**
```json
{
  "receipt_id": "b2c4bdb2-6162-4a62-93d6-e759980a8543",
  "status": "pending",
  "poa_hash": "2540ca2f...",
  "screenshot_url": "https://.../screenshots/<run>.png",
  "result_json": { ... },
  "proof_url": "https://.../proofs/<run>.json"
}
```

## GET /api/executions
Fetch the most recent 50 executions for the authenticated org.

**Response**
```json
[
  {
    "id": "...",
    "goal": "...",
    "status": "completed",
    "tx_hash": "0x...",
    "created_at": "2026-02-28T21:00:00Z",
    ...
  }
]
```

## POST /api/executions/:id/anchor
Force a re-try of the Base Sepolia anchoring job for a specific execution. Useful if an earlier transaction failed.

**Response**
```json
{ "status": "queued" }
```

---

More endpoints (verification, webhooks, etc.) are planned. Track progress in `API_CHANGELOG.md` once available.
