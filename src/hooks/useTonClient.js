import { TonClient } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access"; // Assuming full path is fixed
import { CHAIN } from "@tonconnect/protocol";
import { useTonConnect } from "./useTonConnect";
import { useAsyncInitialize } from "./useAsyncInitialize"; // Assuming full path is fixed
import { useEffect, useState } from "react";

// Hook to get the TonClient instance
export function useTonClient() {
  // 1. **CRITICAL FIX:** Safely destructure useTonConnect() by adding ' || {}'
  // If useTonConnect() returns undefined (while loading), destructuring will use {} instead.
  const { isTestnet } = useTonConnect() || {}; 

  // The hook relies on useAsyncInitialize, which >
  const client = useAsyncInitialize(async () => {
    // If isTestnet is still undefined/null, return null during the loading phase
    if (isTestnet === undefined) return null; 

    // Determine the network chain (assuming mainnet if isTestnet is explicitly false)
    const networkChain = isTestnet === false ? CHAIN.MAINNET : CHAIN.TESTNET;

    // Safety check: ensure we have a network chain
    if (!networkChain) return null; // Use null instead of returning undefined

    const endpoint = await getHttpEndpoint({ network: networkChain });

    return new TonClient({ endpoint });
  }, [isTestnet]); // Recalculate if network changes

  // 2. **CRITICAL FIX:** Return the client, or null while loading.
  // The component using this hook must check for null before using 'client'.
  return { client };
}
