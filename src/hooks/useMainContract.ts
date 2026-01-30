import { useEffect, useState } from "react";
import { Address, toNano, beginCell } from "@ton/core";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";

// --- CONTRACT ADDRESSES ---
const MASTER_ADDR = "EQBAG5qBNaTLePaCtjeHjGMcGl9tEk4o6OQXx3DO161ncnBS"; 
const MARKETPLACE_ADDR = "EQBGt7POdkpvf1_U5hb65KgvlVT-3FAtban1raJvpFKV89GI"; 
const DAO_ADDR = "REPLACE_WITH_HUB_DAO_FUNC_ADDR"; 
const ESCROW_ADDR = "REPLACE_WITH_ESCROW_ADDR";

export function useMainContract() {
  const { client } = useTonClient();
  const { sender, connected } = useTonConnect();
  const [counter, setCounter] = useState<number | null>(null);
  const [userJettonWallet, setUserJettonWallet] = useState<string | null>(null);
  const [jettonBalance, setJettonBalance] = useState<string>("0");

  useEffect(() => {
    async function fetchData() {
      if (!client || !connected || !sender.address) return;
      try {
        const master = Address.parse(MASTER_ADDR);
        
        const res = await client.runMethod(master, "get_counter");
        setCounter(Number(res.stack.readBigNumber()));

        const userAddrCell = beginCell().storeAddress(sender.address).endCell();
        const walletRes = await client.runMethod(master, "get_wallet_address", [
          { type: "slice", cell: userAddrCell }
        ]);
        const walletAddr = walletRes.stack.readAddress();
        setUserJettonWallet(walletAddr.toString());

        const balanceRes = await client.runMethod(walletAddr, "get_wallet_data");
        setJettonBalance((balanceRes.stack.readBigNumber() / BigInt(1e9)).toString());

      } catch (e) { console.log("Erika syncing hardware..."); }
    }
    fetchData();
  }, [client, connected, sender.address]);

  return {
    contract_address: MASTER_ADDR,
    marketplace_address: MARKETPLACE_ADDR,
    dao_address: DAO_ADDR,
    counter_value: counter,
    jetton_balance: jettonBalance,
    connected,

    // Hub DAO Voting Logic
    executeDaoVote: async (proposalId: number, support: boolean) => {
      const body = beginCell()
        .storeUint(0x1c0f, 32) 
        .storeUint(proposalId, 32)
        .storeBit(support)
        .endCell();

      return sender.send({
        to: Address.parse(DAO_ADDR),
        value: toNano("0.05"),
        body: body
      });
    },

    // Sync with HubDAO.fc OP_PAY_TALENT (0x1C0F)
    executeTalentPayment: async (proposalId: number) => {
      const body = beginCell()
        .storeUint(0x1C0F, 32) 
        .storeUint(proposalId, 32)
        .endCell();

      return sender.send({
        to: Address.parse(DAO_ADDR),
        value: toNano("0.05"),
        body: body
      });
    },

    executeAnodePayment: async (type: string, id: number, price: string) => {
      if (!userJettonWallet) return alert("Wallet not synced!");
      const destination = type === 'marketplace' ? MARKETPLACE_ADDR : ESCROW_ADDR;
      const forward = beginCell().storeUint(id, 32).endCell();

      return sender.send({
        to: Address.parse(userJettonWallet),
        value: toNano("0.1"),
        body: beginCell()
          .storeUint(0x0f8a7ea5, 32)
          .storeUint(0, 64)
          .storeCoins(toNano(price))
          .storeAddress(Address.parse(destination))
          .storeAddress(sender.address!)
          .storeBit(false)
          .storeCoins(toNano("0.05"))
          .storeMaybeRef(forward)
          .endCell()
      });
    }
  };
}
