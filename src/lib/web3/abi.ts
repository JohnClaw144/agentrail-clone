export const AGENT_TRAIL_ABI = [
  {
    type: "function",
    name: "storeReceipt",
    inputs: [{ name: "poaHash", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ReceiptStored",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "poaHash", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export const CONTRACT_ADDRESS =
  "0x1abE15Ed2a424781f0b8C2C484aa237061E2B443" as `0x${string}`;
