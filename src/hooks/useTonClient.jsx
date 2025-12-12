import TonWeb from 'tonweb';
import { useTonConnect } from "./useTonConnect";
import { useAsyncInitialize } from "./useAsyncInitialize";

// @dev Tatum RPC Gateway for Testnet
const TESTNET_RPC = "https://ton-testnet.gateway.tatum.io/json-rpc";

/**
 * @dev Provider hook for TonWeb initialization
 */
export function useTonClient() {
  const { isTestnet } = useTonConnect() || {};

  const client = useAsyncInitialize(async () => {
    if (isTestnet === undefined) return null;

    try {
      const provider = new TonWeb.HttpProvider(TESTNET_RPC);
      return new TonWeb(provider);
    } catch (error) {
      console.error("[RPC] Initialization failed:", error);
      return null;
    }
  }, [isTestnet]);

  return { client };
}
