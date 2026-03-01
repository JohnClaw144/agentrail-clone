import { createPublicClient, createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

function normalizePrivateKey(key: string) {
  return key.startsWith("0x") ? key : `0x${key}`;
}

function getConfig() {
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
  const privateKey = process.env.AGENT_WALLET_PRIVATE_KEY;

  if (!rpcUrl) {
    throw new Error("Missing BASE_SEPOLIA_RPC_URL environment variable");
  }
  if (!privateKey) {
    throw new Error("Missing AGENT_WALLET_PRIVATE_KEY environment variable");
  }

  return { rpcUrl, privateKey: normalizePrivateKey(privateKey) };
}

export function getAccount() {
  const { privateKey } = getConfig();
  return privateKeyToAccount(privateKey as `0x${string}`);
}

export function getPublicClient() {
  const { rpcUrl } = getConfig();
  return createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });
}

export function getWalletClient() {
  const { rpcUrl } = getConfig();
  const account = getAccount();
  return createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(rpcUrl),
  });
}
