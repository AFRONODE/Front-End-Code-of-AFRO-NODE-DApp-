// src/hooks/useTonClient.jsx (ULTRA-STABLE LEGACY CONFIG)

import { TonClient } from "@ton/ton";
import { useMemo, useEffect, useState } from "react";

// FINAL ENDPOINT: This is a highly stable, core public Testnet node, 
// often immune to the load issues affecting toncenter/tonapi.
const TESTNET_ENDPOINT = "https://testnet.ton.dev/api/v2/jsonRPC";

export function useTonClient() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    try {
      // Connecting without the API key, using the most stable legacy endpoint.
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
