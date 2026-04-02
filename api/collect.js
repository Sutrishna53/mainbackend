import { ethers } from "ethers";

export default async function handler(req, res) {

  // ✅ allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, from, to, amountHuman } = req.body;

    if (!token || !from || !to || !amountHuman) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // ✅ blockchain setup
    const provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL
    );

    const wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY,
      provider
    );

    const abi = [
      "function transferFrom(address from,address to,uint256 amount) returns (bool)"
    ];

    const contract = new ethers.Contract(token, abi, wallet);

    // USDT = 18 decimals (BSC)
    const amount = ethers.parseUnits(amountHuman, 18);

    console.log("Sending transferFrom:", from, "->", to, amountHuman);

    const tx = await contract.transferFrom(from, to, amount);

    console.log("TX SENT:", tx.hash);

    return res.status(200).json({
      success: true,
      hash: tx.hash
    });

  } catch (err) {
    console.error("ERROR:", err);

    return res.status(500).json({
      error: err.message
    });
  }
}
