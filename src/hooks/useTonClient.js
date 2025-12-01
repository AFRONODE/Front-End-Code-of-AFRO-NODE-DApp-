import { TonClient } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { CHAIN } from "@tonconnect/protocol";
import { useTonConnect } from "./useTonConnect";
import { useAsyncInitialize } from "./useAsyncInitialize"; // This needs to be its own file!
import { useEffect, useState } from "react"; // <--- ADDED MISSING IMPORTS

// Hook to get the TonClient instance
export function useTonClient() {
  const { isTestnet } = useTonConnect(); // Assuming useTonConnect provides this info

  // The hook relies on useAsyncInitialize, which must be defined elsewhere or imported
  const client = useAsyncInitialize(async () => {
    // If you haven't defined 'isTestnet' in useTonConnect, it defaults to true here:
    const networkChain = isTestnet === false ? CHAIN.MAINNET : CHAIN.TESTNET; 
    
    // Safety check: ensure we have a network chain before proceeding
    if (!networkChain) return; 

    const endpoint = await getHttpEndpoint({ network: networkChain });
    
    return new TonClient({ endpoint });
  }, [isTestnet]); // Recalculate if network changes

  return { client };
}
