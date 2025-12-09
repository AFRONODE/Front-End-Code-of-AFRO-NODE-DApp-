// src/hooks/useTonClient.jsx (THE ABSOLUTE FINAL SOLUTION: TonWeb)

import { useEffect, useState } from "react";
// CRITICAL FIX: Swapping out the problematic @ton/ton for the stable community version
import TonWeb from "tonweb"; 

// Using the exact, healthy Tatum.io Testnet Gateway provided.
const TESTNET_ENDPOINT = "https://ton-testnet.gateway.tatum.io/api/v3"; 

export function useTonClient() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    try {
      // TonWeb initializes the client directly, preventing the "no healthy nodes" lookup failure.
      // This code uses the library you successfully installed.
      const tonClient = new TonWeb(new TonWeb.HttpProvider(TESTNET_ENDPOINT, {}));
      setClient(tonClient);
    } catch (error) {
      console.error("FATAL: TonWeb initialization failed.", error);
    }
  }, []); 

  return { client };
}
