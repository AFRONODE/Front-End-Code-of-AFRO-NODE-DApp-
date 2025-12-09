// src/hooks/useTonClient.jsx (THE ABSOLUTE FINAL SOLUTION: TonWeb)

import { useEffect, useState } from "react";
// CRITICAL FIX: The correct import for the installed library
import TonWeb from "tonweb"; 

// Using the exact, healthy Tatum.io Testnet Gateway provided.
const TESTNET_ENDPOINT = "https://ton-testnet.gateway.tatum.io/api/v3"; 

export function useTonClient() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    try {
      // TonWeb initializes the client directly using HttpProvider, 
      // preventing the "no healthy nodes" dynamic lookup failure of the old library.
      const tonClient = new TonWeb(new TonWeb.HttpProvider(TESTNET_ENDPOINT, {}));
      setClient(tonClient);
    } catch (error) {
      console.error("FATAL: TonWeb initialization failed.", error);
    }
  }, []); 

  return { client };
}
