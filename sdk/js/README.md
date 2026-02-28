# AgentTrail JavaScript SDK

Lightweight wrapper around the AgentTrail REST API.

## Build
```bash
cd sdk/js
npm install   # if publishing separately
npm run build
```

## Usage
```ts
import { AgentTrailClient } from "@agenttrail/sdk";

const client = new AgentTrailClient({
  baseUrl: "https://agenttrail-web.onrender.com",
  apiKey: process.env.AGENTTRAIL_KEY!,
});

const receipt = await client.execute({
  goal: "Check hero headline",
  url: "https://example.com",
});

const executions = await client.listExecutions();
await client.retryAnchor(executions[0].id);
```

The SDK uses the global `fetch`. For Node 16, install a ponyfill such as `undici`. Node 18+ works out of the box.
