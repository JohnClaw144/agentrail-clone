export interface AgentTrailClientOptions {
  baseUrl?: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
}

export interface ExecutePayload {
  goal: string;
  url: string;
}

export interface ExecutionRecord {
  id: string;
  org_id?: string;
  goal: string;
  target_url: string;
  status: string;
  poa_hash: string;
  screenshot_url: string;
  proof_url: string;
  tx_hash?: string | null;
  created_at: string;
  [key: string]: unknown;
}

export class AgentTrailClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetch: typeof fetch;

  constructor(options: AgentTrailClientOptions) {
    this.baseUrl = options.baseUrl ?? "https://agenttrail-web.onrender.com";
    this.apiKey = options.apiKey;
    this.fetch = options.fetchImpl ?? fetch;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });

    const bodyText = await response.text();
    const data = bodyText ? JSON.parse(bodyText) : null;

    if (!response.ok) {
      const message = data?.error || response.statusText;
      throw new Error(`AgentTrail API error (${response.status}): ${message}`);
    }

    return data as T;
  }

  execute(payload: ExecutePayload) {
    return this.request<{ receipt_id: string }>("/api/execute", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  listExecutions() {
    return this.request<ExecutionRecord[]>("/api/executions");
  }

  retryAnchor(executionId: string) {
    return this.request<{ status: string }>(`/api/executions/${executionId}/anchor`, {
      method: "POST",
    });
  }
}
