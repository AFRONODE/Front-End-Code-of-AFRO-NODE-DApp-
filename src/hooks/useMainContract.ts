import { useEffect, useState } from "react";
import { Address, toNano, beginCell, Cell } from "@ton/core";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";

const MASTER_ADDR = "EQBAG5qBNaTLePaCtjeHjGMcGl9tEk4o6OQXx3DO161ncnBS";
const MARKETPLACE_ADDR = "EQBGt7POdkpvf1_U5hb65KgvlVT-3FAtban1raJvpFKV89GI";
const DAO_ADDR = "REPLACE_WITH_HUB_DAO_FUNC_ADDR";
const ESCROW_ADDR = "REPLACE_WITH_ESCROW_ADDR"; 
const VESTING_ADDR = "REPLACE_WITH_VESTING_ADDR";
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
      if (!connected || !sender.address || !client) return;
      const userAddr = sender.address;
      const adminAddr = Address.parse(ADMIN_WALLET);

      try {
        if (userAddr.toRawString() === adminAddr.toRawString()) {
          setMemberRank({ score: 999, rank: "Admin/Owner 🦄" });
        } else if (DAO_ADDR !== "REPLACE_WITH_HUB_DAO_FUNC_ADDR") {
          const userCell = beginCell().storeAddress(userAddr).endCell();
          const rankRes = await client.runMethod(Address.parse(DAO_ADDR), "get_member_rank", [{ type: "slice", cell: userCell }]);
          const score = Number(rankRes.stack.readBigNumber());
          let rankLabel = score >= 201 ? "Unicorn 🦄" : (score <= 30 ? "Rookie" : "Member");
          setMemberRank({ score, rank: rankLabel });
        }

        const master = Address.parse(MASTER_ADDR);
        const userCell = beginCell().storeAddress(userAddr).endCell();
        const walletRes = await client.runMethod(master, "get_wallet_address", [{ type: "slice", cell: userCell }]);
        const walletAddr = walletRes.stack.readAddress();
        setUserJettonWallet(walletAddr.toString());

        const balanceRes = await client.runMethod(walletAddr, "get_wallet_data");
        setJettonBalance((Number(balanceRes.stack.readBigNumber()) / 1e9).toLocaleString());

        const counterRes = await client.runMethod(master, "get_counter");
        setCounter(Number(counterRes.stack.readBigNumber()));
      } catch (e) { console.log("Syncing..."); }
    }
    fetchData();
    const pollInterval = setInterval(fetchData, 10000);
    return () => clearInterval(pollInterval);
  }, [client, connected, sender.address]);

  return {
    contract_address: MASTER_ADDR,
    marketplace_address: MARKETPLACE_ADDR,
    dao_address: DAO_ADDR,
    escrow_address: ESCROW_ADDR,
    vesting_address: VESTING_ADDR,
    counter_value: counter,
    jetton_balance: jettonBalance,
    member_rank: memberRank,
    connected,
    
    executeCreateTask: async (description: string, totalAmount: string) => {
      if (!userJettonWallet || !sender.address || ESCROW_ADDR.includes("REPLACE")) return;
      return sender.send({
        to: Address.parse(userJettonWallet),
        value: toNano("0.1"),
        body: beginCell()
          .storeUint(0x0f8a7ea5, 32)
          .storeUint(0, 64)
          .storeCoins(toNano(totalAmount))
          .storeAddress(Address.parse(ESCROW_ADDR))
          .storeAddress(sender.address)
          .storeBit(false)
          .storeCoins(toNano("0.05"))
          .storeMaybeRef(beginCell().storeUint(0, 32).storeStringTail(description).endCell())
          .endCell()
      });
    },

    executeVestingClaim: async (totalAllocation: string, proofBoc: string) => {
      if (VESTING_ADDR.includes("REPLACE")) return;
      const proofCell = Cell.fromBase64(proofBoc);
      return sender.send({
        to: Address.parse(VESTING_ADDR),
        value: toNano("0.15"),
        body: beginCell()
          .storeUint(0x436c61696d, 32)
          .storeCoins(toNano(totalAllocation))
          .storeRef(proofCell)
          .endCell()
      });
    },

    executeAdminTriggerRelease: async () => {
        if (VESTING_ADDR.includes("REPLACE")) return;
        return sender.send({
            to: Address.parse(VESTING_ADDR),
            value: toNano("0.1"),
            body: beginCell().storeUint(0x52656c65617365, 32).endCell() 
        });
    },

    executeKillVesting: async () => {
        if (VESTING_ADDR.includes("REPLACE")) return;
        return sender.send({
            to: Address.parse(VESTING_ADDR),
            value: toNano("0.1"),
            body: beginCell().storeUint(0xffff, 32).endCell() 
        });
    },

    executeAnodePayment: async (type: 'marketplace' | 'escrow', id: number, price: string) => {
      if (!userJettonWallet || !sender.address) return;
      const dest = type === 'marketplace' ? MARKETPLACE_ADDR : ESCROW_ADDR;
      if (dest.includes("REPLACE")) return;
      return sender.send({
        to: Address.parse(userJettonWallet),
        value: toNano("0.1"),
        body: beginCell()
          .storeUint(0x0f8a7ea5, 32)
          .storeUint(0, 64)
          .storeCoins(toNano(price))
          .storeAddress(Address.parse(dest))
          .storeAddress(sender.address)
          .storeBit(false)
          .storeCoins(toNano("0.05"))
          .storeMaybeRef(beginCell().storeUint(id, 32).endCell())
          .endCell()
      });
    },
    executeMemberReg: () => sender.send({ to: Address.parse(DAO_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0x526567, 32).endCell() }),
    sendIncrement: () => sender.send({ to: Address.parse(MASTER_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0xc47de002, 32).endCell() }),
    sendDeposit: () => sender.send({ to: Address.parse(MASTER_ADDR), value: toNano("2.0"), body: beginCell().storeUint(0x0, 32).endCell() }),
    sendWithdraw: () => sender.send({ to: Address.parse(MASTER_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0x41836980, 32).endCell() }),
    sendMint: () => sender.send({ to: Address.parse(MASTER_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0x15, 32).endCell() }),
    sendAirdrop: () => sender.send({ to: Address.parse(MASTER_ADDR), value: toNano("0.1"), body: beginCell().storeUint(0x16, 32).endCell() }),
    executeAnodeStaking: (amount: string, time: number) => sender.send({ to: Address.parse(MASTER_ADDR), value: toNano("0.1"), body: beginCell().storeUint(0x17, 32).storeCoins(toNano(amount)).storeUint(time, 32).endCell() }),
    executeAnodeP2P: (to: string, amount: string) => sender.send({ to: Address.parse(userJettonWallet!), value: toNano("0.1"), body: beginCell().storeUint(0x0f8a7ea5, 32).storeUint(0, 64).storeCoins(toNano(amount)).storeAddress(Address.parse(to)).storeAddress(sender.address!).storeBit(false).storeCoins(toNano("0.05")).endCell() }),
    executeDaoVote: (proposalId: number, vote: boolean) => sender.send({ to: Address.parse(DAO_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0x18, 32).storeUint(proposalId, 32).storeBit(vote).endCell() }),
    executeTalentPayment: (amount: number) => sender.send({ to: Address.parse(DAO_ADDR), value: toNano("0.05"), body: beginCell().storeUint(0x19, 32).storeCoins(toNano(amount.toString())).endCell() })
  };
}
