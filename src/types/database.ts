export type ExecutionStatus = "pending" | "completed" | "failed";

export interface Execution {
  id: string;
  org_id: string | null;
  run_id: string | null;
  goal: string;
  target_url: string;
  screenshot_url: string;
  streaming_url: string | null;
  proof_path: string | null;
  proof_url: string | null;
  poa_hash: string;
  poa_timestamp: string | null;
  result_json: Record<string, unknown> | null;
  tx_hash: string | null;
  anchor_error: string | null;
  status: ExecutionStatus;
  created_at: string;
  updated_at: string;
}

export type ExecutionInsert = Omit<Execution, "id" | "created_at" | "updated_at"> & {
  org_id: string;
  run_id: string;
  proof_path: string;
  proof_url: string;
  anchor_error: string | null;
};

export type ExecutionUpdate = Partial<Omit<Execution, "id" | "created_at" >>;

export interface Org {
  id: string;
  name: string;
  slug: string | null;
  status: string;
  created_at: string;
}

export interface OrgApiKey {
  id: string;
  org_id: string;
  name: string;
  key_hash: string;
  last_four: string | null;
  revoked: boolean;
  created_at: string;
}
