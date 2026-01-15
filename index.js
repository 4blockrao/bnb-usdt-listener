import { WebSocketProvider, Contract } from "ethers";

/**
 * ============================
 * Environment Variables
 * ============================
 */
const WSS_URL = process.env.BNB_WSS_URL;
const USDT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;
const REQUIRED_CONFIRMATIONS = Number(process.env.CONFIRMATIONS_REQUIRED || 3);

if (!WSS_URL) {
  throw new Error("BNB_WSS_URL is not set");
}

if (!USDT_ADDRESS) {
  throw new Error("USDT_CONTRACT_ADDRESS is not set");
}

console.log("Starting BNB USDT Transfer listener...");
console.log("Confirmations required:", REQUIRED_CONFIRMATIONS);

/**
 * ============================
 * Provider
 * ============================
 */
const provider = new WebSocketProvider(WSS_URL);

/**
 * ============================
 * Minimal ERC20 ABI
 * ============================
 */
const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

/**
 * ============================
 * USDT Contract
 * ============================
 */
const usdt = new Contract(USDT_ADDRESS, ERC20_ABI, provider);

/**
 * ============================
 * Block Listener (Health Check)
 * ============================
 */
provider.on("block", (blockNumber) => {
  console.log("New block:", blockNumber);
});

/**
 * ============================
 * USDT Transfer Listener
 * ============================
 */
usdt.on("Transfer", async (from, to, value, event) => {
  try {
    console.log("USDT Transfer detected");
    console.log("From:", from);
    console.log("To:", to);
    console.log("Amount (raw):", value.toString());
    console.log("Tx Hash:", event.transactionHash);
    console.log("Block:", event.blockNumber);

    // Confirmation check (optional, for later invoice logic)
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - event.blockNumber;

    if (confirmations < REQUIRED_CONFIRMATIONS) {
      console.log(
        `Waiting for confirmations: ${confirmations}/${REQUIRED_CONFIRMATIONS}`
      );
      return;
    }

    console.log("Transfer confirmed");

    /**
     * TODO (NEXT PHASE):
     * - Match `to` address with invoice address in Supabase
     * - Update invoice status to "paid"
     * - Trigger webhook
     */

  } catch (err) {
    console.error("Error handling transfer:", err);
  }
});

/**
 * ============================
 * Heartbeat (Railway visibility)
 * ============================
 */
setInterval(() => {
  console.log("Listener alive, monitoring USDT transfers...");
}, 60_000);
