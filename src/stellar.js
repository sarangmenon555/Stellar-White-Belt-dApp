import * as StellarSdk from "@stellar/stellar-sdk";
import * as FreighterAPI from "@stellar/freighter-api";

const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

export async function connectWallet() {
  await FreighterAPI.requestAccess();
  const publicKey = await FreighterAPI.getAddress();
  return publicKey;
}

export function disconnectWallet(setWallet, setBalance) {
  setWallet(null);
  setBalance(null);
}

export async function getBalance(publicKey) {
  const account = await server.loadAccount(String(publicKey));

  const nativeBalance = account.balances.find(
    (b) => b.asset_type === "native"
  );

  return nativeBalance ? nativeBalance.balance : "0";
}

export async function sendXLM(sender, destination, amount) {
  if (!sender || !destination || !amount) {
    throw new Error("Missing required fields");
  }

  const cleanSender = String(sender).trim();
  const cleanDestination = String(destination).trim();
  const cleanAmount = String(amount).trim();

  const account = await server.loadAccount(cleanSender);

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: cleanDestination,
        asset: StellarSdk.Asset.native(),
        amount: cleanAmount,
      })
    )
    .setTimeout(30)
    .build();

  const signed = await FreighterAPI.signTransaction(transaction.toXDR(), {
    networkPassphrase: StellarSdk.Networks.TESTNET,
  });

  const tx = StellarSdk.TransactionBuilder.fromXDR(
    signed,
    StellarSdk.Networks.TESTNET
  );

  return await server.submitTransaction(tx);
}