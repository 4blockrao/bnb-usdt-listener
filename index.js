import { WebSocketProvider, Contract, formatUnits } from "ethers";

// ─── ENV ─────────────────────────────────────────────
const WSS_URL = process.env.BNB_WSS_URL;
const USDT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;
const CONFIRMATIONS_REQUIRED = Number(process.env.CONFIRMATIONS_REQUIRED || 3);

if (!WSS_URL || !USDT_ADDRESS) {
  throw new Error("Missing required environment variables");
}

// ─── SETUP ──────────────────────────────────────────
console.log("Starting BNB USDT Transfer listener...");

const provider = new WebSocketProvider(WSS_URL);

// Minimal ERC20 ABI (Transfer only)
const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const usdt = new Contract(USDT_ADDRESS, ERC20_ABI, provider);

// ─── BLOCK LOG (keep this) ──────────────────────────
provider.on("block", (blockNumber) => {
  console.log("New block:", blockNumber);
});

// ─── TRANSFER LISTENER ──────────────────────────────
usdt.on("Transfer", async (from, to, value, event) => {
  try {
    const amount = formatUnits(value, 18); // USDT testnet = 18 decimals
    const txHash = event.log.transactionHash;
    const blockNumber = event.log.blockNumber;

    console.log("USDT Transfer detected:");
    console.log("  From:", from);
    console.log("  To:", to);
    console.log("  Amount:", amount);
    console.log("  TxHash:", txHash);
    console.log("  Block:", blockNumber);
  } catch (err) {
    console.error("Error processing transfer:", err);
  }
});

// ─── HEARTBEAT ──────────────────────────────────────
setInterval(() => {
  console.log("Listener alive, monitoring USDT transfers...");
}, 15000);
