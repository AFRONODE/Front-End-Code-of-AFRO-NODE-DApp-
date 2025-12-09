// src/hooks/useTonClient.jsx (THE ABSOLUTE FINAL SOLUTION: TonWeb)

import { useEffect, useState } from "react";
// Swapping out the problematic TonClient for the stable community version
import TonWeb from "tonweb"; 

// Using the exact, healthy Tatum.io Testnet Gateway provided.
// This direct connection bypasses the failing internal logic of the old library.
const TESTNET_ENDPOINT = "https://ton-testnet.gateway.tatum.io/api/v3"; 

export function useTonClient() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    try {
      // TonWeb initializes the client directly using HttpProvider, 
      // preventing the "no healthy nodes" dynamic lookup failure.
      const tonClient = new TonWeb(new TonWeb.HttpProvider(TESTNET_ENDPOINT, {}));
      setClient(tonClient);
    } catch (error) {
      console.error("FATAL: TonWeb initialization failed.", error);
    }
  }, []); 

  return { client };
}
