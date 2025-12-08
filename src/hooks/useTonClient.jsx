// src/hooks/useTonClient.jsx (FINAL CONFIG with API KEY)

import { TonClient } from "@ton/ton";
import { useMemo, useEffect, useState } from "react";

// The stable, public Testnet endpoint with a known working API Key.
const TESTNET_ENDPOINT = "https://testnet.toncenter.com/api/v2/jsonRPC";
// This API key is public and used for testnet read access, ensuring reliable connection.
const TESTNET_API_KEY = "f077d337d1d2797e59f4f464d2d41b59c73562477c7f66a22c5478470a7b1b36";

export function useTonClient() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    // We initialize immediately using the stable endpoint AND the API key.
    try {
      const tonClient = new TonClient({ 
        endpoint: TESTNET_ENDPOINT, 
        apiKey: TESTNET_API_KEY // <--- CRITICAL FIX: Restoring the API key
      });
      setClient(tonClient);
    } catch (error) {
      console.error("FATAL: Hardcoded TonClient initialization failed.", error);
    }
  }, []); 

  return { client };
}
