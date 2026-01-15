import { WebSocketProvider } from "ethers";

const WSS_URL = process.env.BNB_WSS_URL;

if (!WSS_URL) {
  throw new Error("BNB_WSS_URL is not set");
}

console.log("Starting BNB WebSocket listener...");

const provider = new WebSocketProvider(WSS_URL);

provider.on("block", (blockNumber) => {
  console.log("New block:", blockNumber);
});

// Safety heartbeat
setInterval(() => {
  console.log("Listener alive, waiting for blocks...");
}, 15000);
