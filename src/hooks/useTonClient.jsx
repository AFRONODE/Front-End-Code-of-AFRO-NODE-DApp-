// src/hooks/useTonClient.jsx (ABSOLUTELY FINAL CLIENT CONFIG)

import { TonClient } from "@ton/ton";
import { useMemo, useEffect, useState } from "react";

// Use a known, public, stable Testnet endpoint. 
// This bypasses the ton-access dynamic search failures that cause "no healthy nodes".
const TESTNET_ENDPOINT = "https://testnet.toncenter.com/api/v2/jsonRPC";

export function useTonClient() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    // We initialize immediately using the stable endpoint.
    try {
      const tonClient = new TonClient({ endpoint: TESTNET_ENDPOINT });
      setClient(tonClient);
    } catch (error) {
      // CRITICAL: If this fails, the DApp cannot function.
      console.error("FATAL: Hardcoded TonClient initialization failed.", error);
    }
  }, []); 

  return { client };
}
