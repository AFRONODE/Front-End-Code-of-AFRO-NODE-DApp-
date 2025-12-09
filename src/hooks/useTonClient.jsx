// src/hooks/useTonClient.jsx (THE ABSOLUTE FINAL INFRASTRUCTURE FIX)

import { TonClient } from "@ton/ton";
import { useMemo, useEffect, useState } from "react";

// FINAL ENDPOINT: Using the exact, healthy Tatum.io Testnet Gateway provided.
// This is the last and final infrastructure workaround to resolve the 'no healthy nodes' error.
const TESTNET_ENDPOINT = "https://ton-testnet.gateway.tatum.io/api/v3"; 

export function useTonClient() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    try {
      // Connecting using the most stable, unauthenticated public gateway available.
      const tonClient = new TonClient({ 
        endpoint: TESTNET_ENDPOINT 
      });
      setClient(tonClient);
    } catch (error) {
      console.error("FATAL: TonClient initialization failed.", error);
    }
  }, []); 

  return { client };
}
