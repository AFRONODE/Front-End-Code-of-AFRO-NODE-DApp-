import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { CHAIN } from "@tonconnect/protocol";

/**
 * @dev Hook for managing TON connection state and wallet data
 */
export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  return {
    connected: !!wallet?.account?.address,
    walletAddress: wallet?.account?.address ?? null,
    network: wallet?.account?.chain ?? null,
    isTestnet: wallet?.account?.chain === CHAIN.TESTNET,
    sender: {
      send: async (args) => {
        return tonConnectUI.sendTransaction({
          messages: [
            {
              address: args.to.toString(),
              amount: args.value.toString(),
              payload: args.body?.toBoc().toString('base64'),
            },
          ],
          validUntil: Math.floor(Date.now() / 1000) + 60,
        });
      },
    },
  };
}
