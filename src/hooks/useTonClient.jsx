// src/hooks/useTonClient.jsx (FINAL FINAL CLIENT CONFIG - NO API KEY)

import { TonClient } from "@ton/ton";
import { useMemo, useEffect, useState } from "react";

// Using the stable, alternative Testnet endpoint.
const TESTNET_ENDPOINT = "https://testnet.tonapi.io/jsonRPC";

export function useTonClient() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    try {
      // FINAL FIX: Connecting without the API key, as tonapi.io often rejects it
      // for public read-only access, causing the "no healthy nodes" error.
      const tonClient = new TonClient({ 
        endpoint: TESTNET_ENDPOINT 
        // apiKey is intentionally removed here
      });
      setClient(tonClient);
    } catch (error) {
      console.error("FATAL: TonClient initialization failed.", error);
    }
  }, []); 

  return { client };
}
