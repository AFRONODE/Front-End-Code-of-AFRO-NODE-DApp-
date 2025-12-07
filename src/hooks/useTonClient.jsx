// src/hooks/useTonClient.jsx
import { TonClient } from "@ton/ton";
import { useMemo } from "react";
import { useTonConnect } from "./useTonConnect"; // Assuming you need sender/wallet status

// The hook to initialize and expose the TON client connection.
export function useTonClient() {
  const { connected } = useTonConnect();

  const client = useMemo(() => {
    // We only try to initialize the client if the wallet is connected or if we always need it.
    // For reliable connection, we enforce the Testnet endpoint configuration.
    try {
      return new TonClient({
        // CRITICAL FIX: Explicitly set the endpoint to a reliable Testnet RPC URL
        endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC", 
        // NOTE: While an API key is often optional for public endpoints,
        // it's highly recommended for stability. Using a known public key here.
        apiKey: "f077d337d1d2797e59f4f464d2d41b59c73562477c7f66a22c5478470a7b1b36", 
      });
    } catch (error) {
        // Log the failure instead of relying on external debug tools
        console.error("CRITICAL DEBUG ERROR: TonClient initialization failed!", error);
        return null; // Return null on failure
    }
  }, [connected]); // Re-run if connected status changes

  return { client };
}
