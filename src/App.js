import React, { useState } from "react";
import { connectWallet, disconnectWallet, getBalance, sendXLM } from "./stellar";

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  async function handleConnect() {
    try {
      const pubKey = await connectWallet();
      
      const address =
      typeof pubKey === "string"
      ? pubKey
      : pubKey?.address?.address || pubKey?.address || "";

      setWallet(address);

      const bal = await getBalance(address);
      setBalance(bal);
    } catch (e) {
      setStatus("Connection error: " + e.message);
    }
  }

  async function handleSend() {
    try {
      if (!wallet) {
        setStatus("Wallet not connected");
        return;
      }

      if (!destination || !amount) {
        setStatus("Enter destination and amount");
        return;
      }

      const res = await sendXLM(
        String(wallet),
        String(destination).trim(),
        String(amount).trim()
      );

      setStatus("Success: " + res.hash);

      const bal = await getBalance(wallet);
      setBalance(bal);
    } catch (e) {
      setStatus("Error: " + e.message);
    }
  }

  return (
    <div className="container">
      <h1>Stellar dApp</h1>

      {!wallet ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <>
          <p>Wallet: {String(wallet)}</p>

          <button onClick={() => disconnectWallet(setWallet, setBalance)}>
            Disconnect
          </button>

          <p>Balance: {balance} XLM</p>

          <div className="form">
            <input
              placeholder="Destination Address"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />

            <input
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <button onClick={handleSend}>Send XLM</button>
          </div>

          <p>{status}</p>
        </>
      )}
    </div>
  );
}