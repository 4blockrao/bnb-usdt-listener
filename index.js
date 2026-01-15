import fetch from "node-fetch";

const SUPABASE_FUNCTION_URL =
  process.env.SUPABASE_URL + "/functions/v1/internal_confirm_payment";

const REQUIRED_CONFIRMATIONS = Number(process.env.CONFIRMATIONS_REQUIRED || 3);

usdt.on("Transfer", async (from, to, value, event) => {
  try {
    const amount = formatUnits(value, 18);
    const txHash = event.log.transactionHash;
    const blockNumber = event.log.blockNumber;

    console.log("USDT Transfer detected:", to, amount);

    // Fetch matching invoice
    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/invoices?address=eq.${to}&status=eq.pending`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    const invoices = await res.json();
    if (!invoices.length) return;

    const invoice = invoices[0];

    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - blockNumber;

    if (confirmations < REQUIRED_CONFIRMATIONS) {
      console.log("Waiting for confirmations:", confirmations);
      return;
    }

    await fetch(SUPABASE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoice_id: invoice.id,
        tx_hash: txHash,
        amount,
        confirmations,
      }),
    });

    console.log("Invoice settled:", invoice.id);
  } catch (err) {
    console.error("Settlement error:", err);
  }
});
