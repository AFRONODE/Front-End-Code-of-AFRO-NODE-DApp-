// src/hooks/useTonClient.jsx (FINAL & COMPLETE)

import { TonClient } from "@ton/ton";
import { getHttpEndpoint } from "@ton/ton-access"; 
import { useMemo, useEffect, useState } from "react";

export function useTonClient() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    async function initClient() {
        try {
            // Force Ton Access to find a healthy Testnet endpoint
            const endpoint = await getHttpEndpoint({ network: "testnet" }); 

            // Use the healthy endpoint to create the client
            const tonClient = new TonClient({ endpoint });
            setClient(tonClient);

        } catch (error) {
            console.error("FATAL: Failed to initialize TonClient using ton-access.", error);
        }
    }
    initClient();
  }, []); 

  return { client };
}
