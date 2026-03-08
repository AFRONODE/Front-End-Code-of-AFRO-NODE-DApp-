import { useEffect, useState } from "react";
import { Address, toNano, beginCell, Cell } from "@ton/core";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";

const MASTER_ADDR = "EQBAG5qBNaTLePaCtjeHjGMcGl9tEk4o6OQXx3DO161ncnBS";
const MARKETPLACE_ADDR = "EQBGt7POdkpvf1_U5hb65KgvlVT-3FAtban1raJvpFKV89GI";

// These will be replaced with real deployed addresses once contracts are live
const DAO_ADDR = "REPLACE_WITH_HUB_DAO_FUNC_ADDR";
const ESCROW_ADDR = "REPLACE_WITH_ESCROW_TACT_ADDR";
const VESTING_ADDR = "REPLACE_WITH_VESTING_TACT_ADDR";
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
      if (!connected || !sender?.address || !client) return;

      const userAddr = sender.address;
      const adminAddr = Address.parse(ADMIN_WALLET);

      try {
        // Admin / Rank detection
        if (userAddr.toRawString() === adminAddr.toRawString()) {
          setMemberRank({ score: 999, rank: "Admin/Owner 🦄" });
        } else if (DAO_ADDR !== "REPLACE_WITH_HUB_DAO_FUNC_ADDR") {
          try {
            const userCell = beginCell().storeAddress(userAddr).endCell();
            const rankRes = await client.runMethod(
              Address.parse(DAO_ADDR),
              "get_member_rank",
              [{ type: "slice", cell: userCell }]
            );
            const score = Number(rankRes.stack.readBigNumber());
            let rankLabel = score >= 201 ? "Unicorn 🦄" : score <= 30 ? "Rookie" : "Member";
            setMemberRank({ score, rank: rankLabel });
          } catch (rankErr) {
            console.warn("Could not fetch DAO member rank:", rankErr);
          }
        }

        // Jetton wallet & balance
        const master = Address.parse(MASTER_ADDR);
        const userCell = beginCell().storeAddress(userAddr).endCell();

        const walletRes = await client.runMethod(master, "get_wallet_address", [
          { type: "slice", cell: userCell },
        ]);
        const walletAddr = walletRes.stack.readAddress();
        setUserJettonWallet(walletAddr.toString());

        if (walletAddr) {
          try {
            const balanceRes = await client.runMethod(walletAddr, "get_wallet_data");
            const balanceBn = balanceRes.stack.readBigNumber();
            setJettonBalance((Number(balanceBn) / 1e9).toLocaleString());
          } catch (balErr) {
            console.warn("Could not read jetton balance:", balErr);
          }
        }

        // Master counter
        try {
          const counterRes = await client.runMethod(master, "get_counter");
          setCounter(Number(counterRes.stack.readBigNumber()));
        } catch (cntErr) {
          console.warn("Could not read counter:", cntErr);
        }
      } catch (e) {
        console.error("Error during contract data sync:", e);
      }
    }

    fetchData();
    const poll = setInterval(fetchData, 12000);
    return () => clearInterval(poll);
  }, [client, connected, sender?.address]);

  const isContractReady = (addr: string) => !addr.includes("REPLACE");

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

    // Gig / Task Creation (Escrow)
    executeCreateTask: async (description: string, totalAmountStr: string) => {
      if (!isContractReady(ESCROW_ADDR) || !userJettonWallet || !sender) {
        console.warn("Cannot create task: missing addresses or connection");
        return;
      }

      const totalAmount = toNano(totalAmountStr);

      return sender.send({
        to: Address.parse(userJettonWallet),
        value: toNano("0.12"),
        bounce: true,
        body: beginCell()
          .storeUint(0x0f8a7ea5, 32)     // jetton transfer
          .storeUint(0, 64)              // query id
          .storeCoins(totalAmount)
          .storeAddress(Address.parse(ESCROW_ADDR))
          .storeAddress(sender.address)
          .storeBit(false)
          .storeCoins(toNano("0.05"))
          .storeMaybeRef(
            beginCell()
              .storeUint(0x01, 32)       // ← replace with real create_task opcode from Escrow.tact
              .storeStringTail(description)
              .endCell()
          )
          .endCell(),
      });
    },

    // Vesting Claim (Merkle-based)
    executeVestingClaim: async (allocationAmount: string, merkleProofBase64: string) => {
      if (!isContractReady(VESTING_ADDR) || !sender) return;

      let proofCell: Cell;
      try {
        proofCell = Cell.fromBase64(merkleProofBase64);
      } catch (e) {
        console.error("Invalid Merkle proof format:", e);
        return;
      }

      return sender.send({
        to: Address.parse(VESTING_ADDR),
        value: toNano("0.18"),
        bounce: true,
        body: beginCell()
          .storeUint(0x436c61696d, 32)   // "Claim" – must match Vesting.tact
          .storeCoins(toNano(allocationAmount))
          .storeRef(proofCell)
          .endCell(),
      });
    },

    // Admin: Release vested tokens (Team / SAFT)
    executeReleaseTeam: async () => {
      if (!isContractReady(VESTING_ADDR) || !sender) return;
      return sender.send({
        to: Address.parse(VESTING_ADDR),
        value: toNano("0.12"),
        body: beginCell()
          .storeUint(0x52656c656173655f7465616d, 32) // "Release_team"
          .endCell(),
      });
    },

    executeReleaseSaft: async () => {
      if (!isContractReady(VESTING_ADDR) || !sender) return;
      return sender.send({
        to: Address.parse(VESTING_ADDR),
        value: toNano("0.12"),
        body: beginCell()
          .storeUint(0x52656c656173655f73616674, 32) // "Release_saft"
          .endCell(),
      });
    },

    executeKillVesting: async () => {
      if (!isContractReady(VESTING_ADDR) || !sender) return;
      return sender.send({
        to: Address.parse(VESTING_ADDR),
        value: toNano("0.1"),
        body: beginCell().storeUint(0xffff, 32).endCell(),
      });
    },

    // Marketplace & Payment
    executeAnodePayment: async (type: "marketplace" | "escrow", itemId: number, price: string) => {
      if (!userJettonWallet || !sender) return;

      const destination = type === "marketplace" ? MARKETPLACE_ADDR : ESCROW_ADDR;
      if (!isContractReady(destination)) return;

      return sender.send({
        to: Address.parse(userJettonWallet),
        value: toNano("0.12"),
        bounce: true,
        body: beginCell()
          .storeUint(0x0f8a7ea5, 32)
          .storeUint(0, 64)
          .storeCoins(toNano(price))
          .storeAddress(Address.parse(destination))
          .storeAddress(sender.address)
          .storeBit(false)
          .storeCoins(toNano("0.06"))
          .storeMaybeRef(
            beginCell()
              .storeUint(0x4d41524b, 32)   // placeholder – replace with real marketplace reference opcode
              .storeUint(itemId, 64)
              .endCell()
          )
          .endCell(),
      });
    },

    // DAO & Membership
    executeMemberReg: async () => {
      if (!isContractReady(DAO_ADDR) || !sender) return;
      return sender.send({
        to: Address.parse(DAO_ADDR),
        value: toNano("0.07"),
        bounce: true,
        body: beginCell().storeUint(0x526567, 32).endCell(),
      });
    },

    executeDaoVote: async (proposalId: number, vote: boolean) => {
      if (!isContractReady(DAO_ADDR) || !sender) return;
      return sender.send({
        to: Address.parse(DAO_ADDR),
        value: toNano("0.06"),
        body: beginCell()
          .storeUint(0x18, 32)
          .storeUint(proposalId, 32)
          .storeBit(vote)
          .endCell(),
      });
    },

    executeTalentPayment: async (amountAnode: number) => {
      if (!isContractReady(DAO_ADDR) || !sender) return;
      return sender.send({
        to: Address.parse(DAO_ADDR),
        value: toNano("0.07"),
        body: beginCell()
          .storeUint(0x19, 32)
          .storeCoins(toNano(amountAnode.toString()))
          .endCell(),
      });
    },

    // Admin Controls
    sendIncrement: async () => {
      if (!sender) return;
      return sender.send({
        to: Address.parse(MASTER_ADDR),
        value: toNano("0.05"),
        body: beginCell().storeUint(0xc47de002, 32).endCell(),
      });
    },

    sendDeposit: async () => {
      if (!sender) return;
      return sender.send({
        to: Address.parse(MASTER_ADDR),
        value: toNano("2.0"),
        body: beginCell().storeUint(0x0, 32).endCell(),
      });
    },

    sendWithdraw: async () => {
      if (!sender) return;
      return sender.send({
        to: Address.parse(MASTER_ADDR),
        value: toNano("0.05"),
        body: beginCell().storeUint(0x41836980, 32).endCell(),
      });
    },

    sendMint: async () => {
      if (!sender) return;
      return sender.send({
        to: Address.parse(MASTER_ADDR),
        value: toNano("0.08"),
        body: beginCell().storeUint(0x15, 32).endCell(),
      });
    },

    sendAirdrop: async () => {
      if (!sender) return;
      return sender.send({
        to: Address.parse(MASTER_ADDR),
        value: toNano("0.12"),
        body: beginCell().storeUint(0x16, 32).endCell(),
      });
    },

    executeAnodeStaking: async (amount: string, lockSeconds: number) => {
      if (!sender) return;
      return sender.send({
        to: Address.parse(MASTER_ADDR),
        value: toNano("0.12"),
        body: beginCell()
          .storeUint(0x17, 32)
          .storeCoins(toNano(amount))
          .storeUint(lockSeconds, 64)
          .endCell(),
      });
    },

    executeAnodeP2P: async (to: string, amount: string) => {
      if (!userJettonWallet || !sender) return;
      return sender.send({
        to: Address.parse(userJettonWallet),
        value: toNano("0.12"),
        body: beginCell()
          .storeUint(0x0f8a7ea5, 32)
          .storeUint(0, 64)
          .storeCoins(toNano(amount))
          .storeAddress(Address.parse(to))
          .storeAddress(sender.address!)
          .storeBit(false)
          .storeCoins(toNano("0.06"))
          .endCell(),
      });
    },

    // Marketplace Admin Functions
    executeAddMarketItem: async (title: string, priceAnode: string) => {
      if (!isContractReady(MARKETPLACE_ADDR) || !sender) return;
      return sender.send({
        to: Address.parse(MARKETPLACE_ADDR),
        value: toNano("0.07"),
        body: beginCell()
          .storeUint(0xadd1, 32)         // ← replace with real add_listing opcode
          .storeStringTail(title)
          .storeCoins(toNano(priceAnode))
          .endCell(),
      });
    },

    executeUpdateMarketPrice: async (itemId: number, newPriceAnode: string) => {
      if (!isContractReady(MARKETPLACE_ADDR) || !sender) return;
      return sender.send({
        to: Address.parse(MARKETPLACE_ADDR),
        value: toNano("0.06"),
        body: beginCell()
          .storeUint(0xupd4, 32)         // ← replace with real update opcode
          .storeUint(itemId, 64)
          .storeCoins(toNano(newPriceAnode))
          .endCell(),
      });
    },

    executeRemoveMarketItem: async (itemId: number) => {
      if (!isContractReady(MARKETPLACE_ADDR) || !sender) return;
      return sender.send({
        to: Address.parse(MARKETPLACE_ADDR),
        value: toNano("0.06"),
        body: beginCell()
          .storeUint(0xrem3, 32)         // ← replace with real remove opcode
          .storeUint(itemId, 64)
          .endCell(),
      });
    },
  };
}
