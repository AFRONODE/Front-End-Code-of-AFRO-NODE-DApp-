import { TonClient } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { useAsyncInitialize } from "./useAsyncInitialize"; // Assumes this exists
import { CHAIN } from "@tonconnect/protocol";
import { useTonConnect } from "./useTonConnect";


// This is a utility hook to initialize a value only once (like the client)
export function useAsyncInitialize(func, deps = []) {
  const [state, setState] = useState(null);

  useEffect(() => {
    (async () => {
      setState(await func());
    })();
  }, deps);

  return state;
}


// Hook to get the TonClient instance
export function useTonClient() {
  const { isTestnet } = useTonConnect();

  const client = useAsyncInitialize(async () => {
    if (!isTestnet) return; // Prevent running if connection fails

    const endpoint = await getHttpEndpoint({ network: isTestnet ? CHAIN.TESTNET : CHAIN.MAINNET });
    
    return new TonClient({ endpoint });
  }, [isTestnet]);

  return { client };
}
