import { useEffect, useState } from "react";
import { Address, toNano, beginCell } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

const ANODE_MASTER_ADDR = "EQBAG5qBNaTLePaCtjeHjGMcGl9tEk4o6OQXx3DO161ncnBS";
const ESCROW_ADDR = "EQDJNggvUv1ZTRe-L9VhIZlqQF3Fw9kP-tZWreEsqIppSeRC";
const MARKETPLACE_ADDR = "EQD-rLNksqy7ideJTKIw-wnhO3Zt6dsoGCoYiMlwu-4V9xrf";
const HUB_DAO_ADDR = "EQDRBjOD-W1fypLGfCRhyUp5JXZPOdNHtEZWjrBKTiHi70Qq";

export function useMainContract() {
  const { sender, connected, wallet } = useTonConnect();
  const [contractData, setContractData] = useState({
    master_address: ANODE_MASTER_ADDR,
    escrow_address: ESCROW_ADDR,
    marketplace_address: MARKETPLACE_ADDR,
    dao_address: HUB_DAO_ADDR,
    counter_value: 0,
    jetton_balance: 0
  });

  useEffect(() => {
    if (!connected) return;
    console.log("Handshake: AFRO-NODE Ecosystem Ready");
  }, [connected]);

  // Helper for $ANODE Jetton Transfer Payload
  const createJettonTransferBody = (toAddress, amount) => {
    return beginCell()
      .storeUint(0xf8a7ea5, 32) // op::transfer
      .storeUint(0, 64)        // query_id
      .storeCoins(toNano(amount)) 
      .storeAddress(Address.parse(toAddress))
      .storeAddress(wallet ? Address.parse(wallet) : null)
      .storeBit(0)             
      .storeCoins(toNano("0.05")) 
      .storeBit(0)             
      .endCell();
  };

  const safeSend = async (to, value, body = null) => {
    if (!connected || !sender) throw new Error("Wallet not connected");
    await sender.send({
      to: Address.parse(to),
      value: toNano(value),
      body: body,
    });
  };

  return {
    ...contractData,
    contract_address: contractData.master_address,
    connected,
    sendIncrement: () => safeSend(ANODE_MASTER_ADDR, "0.05"),
    sendDeposit: (amount = "2") => safeSend(ANODE_MASTER_ADDR, amount),
    sendWithdraw: () => safeSend(ANODE_MASTER_ADDR, "0.05"), 
    
    // UI HANDSHAKE: MARKETPLACE & ESCROW
    executeAnodePayment: (type) => {
      const target = type === 'escrow' ? ESCROW_ADDR : MARKETPLACE_ADDR;
      return safeSend(target, "0.1"); 
    },

    // UI HANDSHAKE: P2P TRANSFER
    executeAnodeP2P: (recipient, amount) => {
      // NOTE: Replace ANODE_MASTER_ADDR with User's Jetton Wallet in production
      return safeSend(ANODE_MASTER_ADDR, "0.1", createJettonTransferBody(recipient, amount));
    },

    // UI HANDSHAKE: STAKING
    executeAnodeStaking: (amount) => {
      return safeSend(ANODE_MASTER_ADDR, "0.1", createJettonTransferBody(ANODE_MASTER_ADDR, amount));
    },

    sendMint: () => safeSend(ANODE_MASTER_ADDR, "0.1"),
    sendAirdrop: () => safeSend(ANODE_MASTER_ADDR, "0.1"),
  };
}
