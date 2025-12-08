// src/hooks/useTonClient.jsx (ULTIMATE, PRIVATE-GRADE CLIENT CONFIG)

import { TonClient } from "@ton/ton";
import { useMemo, useEffect, useState } from "react";

// SWITCH: Using a high-stability alternative Testnet endpoint (In-fura equivalent for TON)
const TESTNET_ENDPOINT = "https://testnet.tonapi.io/jsonRPC"; // <--- NEW STABLE ENDPOINT
// We still include a key for compatibility, though some private nodes don't require it.
const TESTNET_API_KEY = "f077d337d1d2797e59f4f464d2d41b59c73562477c7f66a22c5478470a7b1b36";

export function useTonClient() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    try {
      const tonClient = new TonClient({ 
        endpoint: TESTNET_ENDPOINT, 
        apiKey: TESTNET_API_KEY
      });
      setClient(tonClient);
    } catch (error) {
      console.error("FATAL: Hardcoded TonClient initialization failed.", error);
    }
  }, []); 

  return { client };
}
