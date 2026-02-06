import { useEffect, useState } from "react";
import { Address, toNano, beginCell } from "@ton/core";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";

const MASTER_ADDR = "EQBAG5qBNaTLePaCtjeHjGMcGl9tEk4o6OQXx3DO161ncnBS"; 
const MARKETPLACE_ADDR = "EQBGt7POdkpvf1_U5hb65KgvlVT-3FAtban1raJvpFKV89GI"; 
const DAO_ADDR = "REPLACE_WITH_HUB_DAO_FUNC_ADDR"; 
const ADMIN_WALLET = "0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u";

export function useMainContract() {
  const { client } = useTonClient();
  const { sender, connected } = useTonConnect();
  const [counter, setCounter] = useState<number | null>(null);
  const [userJettonWallet, setUserJettonWallet] = useState<string | null>(null);
  const [jettonBalance, setJettonBalance] = useState<string>("0");
  const [memberRank, setMemberRank] = useState({score: 0, rank: "Guest"});

  useEffect(() => {
    async function fetchData() {
      if (!client || !connected || !sender.address) return;
      
      const userAddr = sender.address;
      const adminAddr = Address.parse(ADMIN_WALLET);

      // --- ADMIN UNICORN CHECK ---
      // We use .equals() to compare the underlying account hash
      if (userAddr.equals(adminAddr)) {
        setMemberRank({ score: 9999, rank: "Admin/Owner 🦄" });
      }

      try {
        const master = Address.parse(MASTER_ADDR);
        const userAddrCell = beginCell().storeAddress(userAddr).endCell();
        
        const walletRes = await client.runMethod(master, "get_wallet_address", [{ type: "slice", cell: userAddrCell }]);
        const walletAddr = walletRes.stack.readAddress();
        setUserJettonWallet(walletAddr.toString());

        const balanceRes = await client.runMethod(walletAddr, "get_wallet_data");
        setJettonBalance((balanceRes.stack.readBigNumber() / BigInt(1e9)).toString());

        // Fetch DAO rank only if deployed and NOT admin
        if (!DAO_ADDR.includes("REPLACE") && !userAddr.equals(adminAddr)) {
          const rankRes = await client.runMethod(Address.parse(DAO_ADDR), "get_member_rank", [{ type: "slice", cell: userAddrCell }]);
          setMemberRank({
              score: Number(rankRes.stack.readBigNumber()),
              rank: rankRes.stack.readString() || "Verified User"
          });
        }

        const res = await client.runMethod(master, "get_counter");
        setCounter(Number(res.stack.readBigNumber()));
      } catch (e) { 
        console.log("Syncing Afro-Node data..."); 
      }
    }
    fetchData();
  }, [client, connected, sender.address]);

  return {
    contract_address: MASTER_ADDR,
    dao_address: DAO_ADDR,
    counter_value: counter,
    jetton_balance: jettonBalance,
    member_rank: memberRank,
    connected,
    executeMemberReg: async () => sender.send({ to: Address.parse(DAO_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0x526567, 32).endCell() }),
    executeAnodePayment: async (t: string, id: number, p: string) => {
      const dest = t === 'marketplace' ? MARKETPLACE_ADDR : "REPLACE_WITH_ESCROW";
      return sender.send({
        to: Address.parse(userJettonWallet!),
        value: toNano("0.1"),
        body: beginCell().storeUint(0x0f8a7ea5, 32).storeUint(0, 64).storeCoins(toNano(p)).storeAddress(Address.parse(dest)).storeAddress(sender.address!).storeBit(false).storeCoins(toNano("0.05")).storeMaybeRef(beginCell().storeUint(id, 32).endCell()).endCell()
      });
    },
    executeTalentPayment: (amt: number) => sender.send({ to: Address.parse(DAO_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0x1C0F, 32).storeCoins(toNano(amt.toString())).storeAddress(sender.address!).endCell() }),
    executeDaoVote: (id: number, s: boolean) => sender.send({ to: Address.parse(DAO_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0x1c0f, 32).storeUint(id, 32).storeBit(s).endCell() }),
    sendIncrement: () => sender.send({ to: Address.parse(MASTER_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0x37491701, 32).storeUint(0, 64).endCell() }),
    sendDeposit: () => sender.send({ to: Address.parse(MASTER_ADDR), value: toNano("2.0") }),
    sendWithdraw: () => sender.send({ to: Address.parse(MASTER_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0x41836979, 32).storeUint(0, 64).storeCoins(toNano("1.0")).endCell() }),
    sendMint: () => sender.send({ to: Address.parse(MASTER_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0x15, 32).endCell() }),
    sendAirdrop: () => sender.send({ to: Address.parse(MASTER_ADDR), value: toNano("0.1"), body: beginCell().storeUint(0x16, 32).endCell() }),
    executeAnodeStaking: (amt: string, time: number) => sender.send({ to: Address.parse(userJettonWallet!), value: toNano("0.1"), body: beginCell().storeUint(0x17, 32).storeCoins(toNano(amt)).storeUint(time, 32).endCell() }),
    executeAnodeP2P: (to: string, amt: string) => sender.send({ to: Address.parse(userJettonWallet!), value: toNano("0.1"), body: beginCell().storeUint(0x0f8a7ea5, 32).storeUint(0, 64).storeCoins(toNano(amt)).storeAddress(Address.parse(to)).storeAddress(sender.address!).storeBit(false).storeCoins(toNano("0.01")).storeMaybeRef(null).endCell() })
  };
}
