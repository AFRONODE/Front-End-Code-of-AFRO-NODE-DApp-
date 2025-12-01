import { useTonConnectUI } from "@tonconnect/ui-react";
import { useTonWallet } from "@tonconnect/ui-react";
import { CHAIN } from "@tonconnect/protocol";

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  return {
    connected: !!wallet,
    walletAddress: wallet?.account?.address ?? null,
    network: tonConnectUI.connected ? tonConnectUI.wallet.account.chain : null,
    // Add logic here if you need to check if it's the mainnet or testnet
    isTestnet: tonConnectUI.connected ? tonConnectUI.wallet.account.chain === CHAIN.TESTNET : true,
  };
}
