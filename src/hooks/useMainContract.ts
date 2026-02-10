import { useEffect, useState } from "react";
import { Address, toNano, beginCell } from "@ton/core";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";

const MASTER_ADDR = "EQBAG5qBNaTLePaCtjeHjGMcGl9tEk4o6OQXx3DO161ncnBS";
const MARKETPLACE_ADDR = "EQBGt7POdkpvf1_U5hb65KgvlVT-3FAtban1raJvpFKV89GI";
const DAO_ADDR = "REPLACE_WITH_HUB_DAO_FUNC_ADDR";
const ESCROW_ADDR = "REPLACE_WITH_ESCROW_ADDR"; // PENDING DEPLOYMENT
const ADMIN_WALLET = "0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u";

export function useMainContract() {
  const { client } = useTonClient();
  const { sender, connected } = useTonConnect();
  const [counter, setCounter] = useState<number | null>(null);
  const [jettonBalance, setJettonBalance] = useState("0");
  const [userJettonWallet, setUserJettonWallet] = useState<string | null>(null);
  const [memberRank, setMemberRank] = useState({ score: 0, rank: "Guest" });

  useEffect(() => {
    async function fetchData() {
      if (!connected || !sender.address) return;

      const userAddr = sender.address;
      const adminAddr = Address.parse(ADMIN_WALLET);

      try {
        // 1. RANK LOGIC: 201+ = 🦄 | 0-30 = Rookie
        if (userAddr.equals(adminAddr)) {
          setMemberRank({ score: 999, rank: "Admin/Owner 🦄" });
        } else if (!DAO_ADDR.includes("REPLACE") && client) {
          const userCell = beginCell().storeAddress(userAddr).endCell();
          const rankRes = await client.runMethod(Address.parse(DAO_ADDR), "get_member_rank", [{ type: "slice", cell: userCell }]);
          const score = Number(rankRes.stack.readBigNumber());
          
          let rankLabel = "Member";
          if (score >= 201) rankLabel = "Unicorn 🦄";
          else if (score <= 30) rankLabel = "Rookie";
          
          setMemberRank({ score, rank: rankLabel });
        }

        if (!client) return;

        // 2. JETTON DATA (MASTER + WALLET)
        const master = Address.parse(MASTER_ADDR);
        const userCell = beginCell().storeAddress(userAddr).endCell();
        
        const walletRes = await client.runMethod(master, "get_wallet_address", [{ type: "slice", cell: userCell }]);
        const walletAddr = walletRes.stack.readAddress();
        setUserJettonWallet(walletAddr.toString());

        const balanceRes = await client.runMethod(walletAddr, "get_wallet_data");
        setJettonBalance((balanceRes.stack.readBigNumber() / BigInt(1e9)).toString());

        const counterRes = await client.runMethod(master, "get_counter");
        setCounter(Number(counterRes.stack.readBigNumber()));

      } catch (e) { console.log("Ecosystem syncing..."); }
    }
    fetchData();
  }, [client, connected, sender.address]);

  return {
    contract_address: MASTER_ADDR,
    marketplace_address: MARKETPLACE_ADDR,
    dao_address: DAO_ADDR,
    escrow_address: ESCROW_ADDR,
    counter_value: counter,
    jetton_balance: jettonBalance,
    member_rank: memberRank,
    connected,
    // Unified Payment Logic for Marketplace and Escrow
    executeAnodePayment: async (type: 'marketplace' | 'escrow', id: number, price: string) => {
      if (!userJettonWallet || !sender.address) return;
      const destination = type === 'marketplace' ? MARKETPLACE_ADDR : ESCROW_ADDR;
      
      return sender.send({
        to: Address.parse(userJettonWallet),
        value: toNano("0.1"),
        body: beginCell()
          .storeUint(0x0f8a7ea5, 32)
          .storeUint(0, 64)
          .storeCoins(toNano(price))
          .storeAddress(Address.parse(destination))
          .storeAddress(sender.address)
          .storeBit(false)
          .storeCoins(toNano("0.05"))
          .storeMaybeRef(beginCell().storeUint(id, 32).endCell())
          .endCell()
      });
    },
    executeMemberReg: () => sender.send({ to: Address.parse(DAO_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0x526567, 32).endCell() }),
    sendMint: () => sender.send({ to: Address.parse(MASTER_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0x15, 32).endCell() }),
    sendAirdrop: () => sender.send({ to: Address.parse(MASTER_ADDR), value: toNano("0.1"), body: beginCell().storeUint(0x16, 32).endCell() })
  };
}
