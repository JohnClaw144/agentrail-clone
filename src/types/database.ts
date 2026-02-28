export type ExecutionStatus = "pending" | "completed" | "failed";

export interface Execution {
  id: string;
  goal: string;
  target_url: string;
  screenshot_url: string;
  streaming_url: string | null;
  poa_hash: string;
  poa_timestamp: string | null;
  result_json: Record<string, unknown> | null;
  tx_hash: string | null;
  status: ExecutionStatus;
  created_at: string;
  updated_at: string;
}

export type ExecutionInsert = Omit<Execution, "id" | "created_at" | "updated_at">;

export type ExecutionUpdate = Partial<Omit<Execution, "id" | "created_at">>;
