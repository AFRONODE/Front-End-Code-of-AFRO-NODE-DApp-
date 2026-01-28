import { TonClient } from "@ton/ton";
import { useAsyncInitialize } from "./useAsyncInitialize";

export function useTonClient() {
  return {
    client: useAsyncInitialize(async () => {
      return new TonClient({
        endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
      });
    }),
  };
}
