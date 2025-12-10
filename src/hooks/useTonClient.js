// src/hooks/useTonClient.js - FINAL CLEAN CODE

// We now import the correct, browser-compatible library (TonWeb)
import TonWeb from 'tonweb';
import { CHAIN } from "@tonconnect/protocol";
import { useTonConnect } from "./useTonConnect";
import { useAsyncInitialize } from "./useAsyncInit>

// CRITICAL: Hardcode the Tatum Testnet endpoint for stability
const TATUM_TESTNET_ENDPOINT = "https://ton-testnet.gateway.tatum.io/json-rpc"; 

// Hook to get the TonClient instance
export function useTonClient() {
  const { isTestnet } = useTonConnect() || {};

  // The hook relies on useAsyncInitialize, which >
  const client = useAsyncInitialize(async () => {
    if (isTestnet === undefined) return null;

    // Use the Tatum endpoint directly for TonWeb
    const endpoint = TATUM_TESTNET_ENDPOINT;

    console.log("DEBUG: Endpoint retrieved:", endpoint);

    try {
      // 2. Initialize TonWeb (using the correct constructor)
      console.log("DEBUG: Attempting to initialize TonWeb...");
      
      // TonWeb needs an HTTP provider URL
      const provider = new TonWeb.HttpProvider(endpoint); 
      const newClient = new TonWeb(provider);

      // LOG SUCCESS
      console.log("DEBUG: TonWeb initialized successfully.");
      return newClient;

    } catch (e) {
      console.error("CRITICAL DEBUG ERROR: TonWeb initialization failed.");
      console.error(e);
      return null;
    }
  }, [isTestnet]);

  return { client };
}
