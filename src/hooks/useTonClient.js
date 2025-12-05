import { TonClient } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { CHAIN } from "@tonconnect/protocol";
import { useTonConnect } from "./useTonConnect";
import { useAsyncInitialize } from "./useAsyncInitialize";
// import { useEffect, useState } from "react"; // Not strictly needed here

// Hook to get the TonClient instance
export function useTonClient() {
  // 1. **CRITICAL FIX:** Safely destructure useTonConnect()
  const { isTestnet } = useTonConnect() || {};

  // The hook relies on useAsyncInitialize, which runs async setup
  const client = useAsyncInitialize(async () => {
    // If isTestnet is still undefined/null, return null immediately
    if (isTestnet === undefined) return null;

    // Determine the network chain (assuming mainnet if not testnet)
    const networkChain = isTestnet === false ? CHAIN.MAINNET : CHAIN.TESTNET;

    // Safety check: ensure we have a network chain
    if (!networkChain) {
      console.error("DEBUG: Network chain not determined. Returning null.");
      return null;
    } 
    
    // --- DEBUG LOG START ---
    console.log("DEBUG: Network determined as:", networkChain);

    try {
      // 1. Get the endpoint. This part uses network utilities and should be safe.
      const endpoint = await getHttpEndpoint({ network: networkChain });
      console.log("DEBUG: Endpoint retrieved:", endpoint);

      // 2. Initialize TonClient (THE CRASH POINT)
      // This is where the TonClient constructor internally uses the failed 'Request' object.
      console.log("DEBUG: Attempting to initialize TonClient with endpoint:", endpoint);
      
      const newClient = new TonClient({ endpoint });

      // LOG SUCCESS
      console.log("DEBUG: TonClient initialized successfully.", newClient);
      return newClient;

    } catch (e) {
      // LOG FAILURE: This will catch the low-level TypeError right at the source
      console.error("CRITICAL DEBUG ERROR: TonClient initialization failed!");
      // Print the full error, which should finally give us the stack trace detail
      console.error(e); 
      return null;
    }
  }, [isTestnet]); // Recalculate if network changes

  // 2. **CRITICAL FIX:** Return the client, or null while loading
  return { client };
}
