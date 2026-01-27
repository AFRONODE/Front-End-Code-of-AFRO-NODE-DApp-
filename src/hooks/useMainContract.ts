import { useEffect, useState } from "react";
import { Address, toNano, beginCell } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

const ANODE_MASTER_ADDR = "EQBAG5qBNaTLePaCtjeHjGMcGl9tEk4o6OQXx3DO161ncnBS";
const ESCROW_ADDR = "EQDJNggvUv1ZTRe-L9VhIZlqQF3Fw9kP-tZWreEsqIppSeRC";
const MARKETPLACE_ADDR = "EQD-rLNksqy7ideJTKIw-wnhO3Zt6dsoGCoYiMlwu-4V9xrf";
const HUB_DAO_ADDR = "EQDRBjOD-W1fypLGfCRhyUp5JXZPOdNHtEZWjrBKTiHi70Qq";

export function useMainContract() {
  const { sender, connected } = useTonConnect();
  const [contractData] = useState({
    master_address: ANODE_MASTER_ADDR,
    escrow_address: ESCROW_ADDR,
    marketplace_address: MARKETPLACE_ADDR,
    dao_address: HUB_DAO_ADDR,
    counter_value: 0,
    jetton_balance: 0
  });

  const sendAnodePayment = async (toAddress: string, amount: string) => {
    if (!connected || !sender.address) return;
    const body = beginCell()
      .storeUint(0xf8a7ea5, 32)
      .storeUint(0, 64)
      .storeCoins(toNano(amount))
      .storeAddress(Address.parse(toAddress))
      .storeAddress(sender.address)
      .storeBit(0)
      .storeCoins(toNano("0.05"))
      .storeBit(0)
      .endCell();

    return await sender.send({
      to: Address.parse(ANODE_MASTER_ADDR),
      value: toNano("0.1"),
      body: body,
    });
  };

  return {
    ...contractData,
    contract_address: contractData.master_address,
    sendAnodePayment,
    sendIncrement: async () => sender.send({ to: Address.parse(ANODE_MASTER_ADDR), value: toNano("0.05") }),
    sendDeposit: async () => sender.send({ to: Address.parse(ANODE_MASTER_ADDR), value: toNano("2") }),
    sendWithdraw: async () => sender.send({ to: Address.parse(ANODE_MASTER_ADDR), value: toNano("1") }),
    sendMint: async () => console.log("Minting..."),
    sendAirdrop: async () => console.log("Airdropping...")
  };
}
