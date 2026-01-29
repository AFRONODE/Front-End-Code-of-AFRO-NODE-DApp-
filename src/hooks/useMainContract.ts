import { useEffect, useState } from "react";
import { Address, toNano, beginCell } from "@ton/core";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";

const MASTER_ADDR = "EQBGt7POdkpvf1_U5hb65KgvlVT-3FAtban1raJvpFKV89GI";
const MARKETPLACE_ADDR = "REPLACE_WITH_MARKET_ADDR"; 
const ESCROW_ADDR = "REPLACE_WITH_ESCROW_ADDR";

export function useMainContract() {
  const { client } = useTonClient();
  const { sender, connected } = useTonConnect();
  const [counter, setCounter] = useState<number | null>(null);
  const [userJettonWallet, setUserJettonWallet] = useState<string | null>(null);

  // 1. Fetch Master Data & User's Specific Anode-Wallet Address
  useEffect(() => {
    async function fetchData() {
      if (!client || !connected || !sender.address) return;
      try {
        const master = Address.parse(MASTER_ADDR);
        
        // Fetch Counter
        const res = await client.runMethod(master, "get_counter");
        setCounter(Number(res.stack.readBigNumber()));

        // FIND USER'S ANODE-WALLET: This is the magic step
        const userAddrCell = beginCell().storeAddress(sender.address).endCell();
        const walletRes = await client.runMethod(master, "get_wallet_address", [
          { type: "slice", cell: userAddrCell }
        ]);
        setUserJettonWallet(walletRes.stack.readAddress().toString());

      } catch (e) { console.log("Contract syncing..."); }
    }
    fetchData();
  }, [client, connected, sender.address]);

  // 2. INTERNAL HELPER: The $ANODE Transfer Payload
  const createAnodeTransfer = (to: string, amount: string, forward: any) => {
    return beginCell()
      .storeUint(0x0f8a7ea5, 32) // Standard Jetton Transfer Op
      .storeUint(0, 64)          // query_id
      .storeCoins(toNano(amount)) 
      .storeAddress(Address.parse(to)) 
      .storeAddress(sender.address!) 
      .storeBit(false) 
      .storeCoins(toNano("0.05")) // Forward gas for the contract logic
      .storeMaybeRef(forward)
      .endCell();
  };

  return {
    contract_address: MASTER_ADDR,
    counter_value: counter,
    connected,
    
    // PAY FOR MARKETPLACE SERVICE
    executeAnodePayment: async (serviceId: number, price: string) => {
      if (!userJettonWallet) return alert("Anode Wallet not detected!");
      const forward = beginCell().storeUint(serviceId, 32).endCell();
      return sender.send({
        to: Address.parse(userJettonWallet),
        value: toNano("0.1"), 
        body: createAnodeTransfer(MARKETPLACE_ADDR, price, forward)
      });
    },

    // FUND ESCROW GIG
    executeEscrowFund: async (gigId: number, provider: string, amount: string) => {
      if (!userJettonWallet) return alert("Anode Wallet not detected!");
      const forward = beginCell().storeUint(gigId, 32).storeAddress(Address.parse(provider)).endCell();
      return sender.send({
        to: Address.parse(userJettonWallet),
        value: toNano("0.1"),
        body: createAnodeTransfer(ESCROW_ADDR, amount, forward)
      });
    }
  };
}
