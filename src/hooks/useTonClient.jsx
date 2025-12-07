// src/hooks/useTonClient.jsx
import { TonClient } from "@ton/ton";
import { useMemo } from "react";

// The hook to initialize and expose the guaranteed TON Testnet client connection.
export function useTonClient() {
  const client = useMemo(() => {
    // ULTRA-FIX: Explicitly and unconditionally set the endpoint to the Testnet RPC URL.
    // This bypasses any connection conflicts defaulting to Masterchain (-3).
    return new TonClient({
      endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC", 
      apiKey: "f077d337d1d2797e59f4f464d2d41b59c73562477c7f66a22c5478470a7b1b36", 
    });
  }, []); // Empty dependency array ensures it runs only once and immediately.

  return { client };
}
