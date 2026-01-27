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

  // FIXED: Removed ': string', ': Cell', and type casting for JS compatibility
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

    sendIncrement: () => safeSend(ANODE_MASTER_ADDR, "0.05", beginCell().storeUint(0, 32).storeStringTail("Increment").endCell()),
    sendDeposit: (amount = "2") => safeSend(ANODE_MASTER_ADDR, amount),
    sendWithdraw: () => safeSend(ANODE_MASTER_ADDR, "0.05", beginCell().storeUint(0, 32).storeStringTail("Withdraw").endCell()),

    executeAnodePayment: (type, amount = "1") => {
      if (type === 'marketplace') {
        const body = beginCell()
          .storeUint(0x2d1f760e, 32) 
          .storeUint(1, 257)         
          .endCell();
        return safeSend(MARKETPLACE_ADDR, amount, body);
      } else {
        const body = beginCell()
          .storeUint(0x1a2b3c4d, 32) 
          .storeUint(Math.floor(Math.random() * 1000), 257) 
          .storeAddress(Address.parse(ANODE_MASTER_ADDR))   
          .storeBit(false)                                 
          .endCell();
        return safeSend(ESCROW_ADDR, amount, body);
      }
    },

    executeAnodeStaking: (amount) => {
      const body = beginCell()
        .storeUint(0x11223344, 32) 
        .storeInt(toNano(amount), 257)
        .storeInt(604800, 257) 
        .endCell();
      return safeSend(ANODE_MASTER_ADDR, "0.1", body);
    },

    executeAnodeP2P: (recipient, amount) => {
      const body = beginCell()
        .storeUint(0xf8a7ea5, 32)
        .storeUint(0, 64)
        .storeCoins(toNano(amount))
        .storeAddress(Address.parse(recipient))
        .storeAddress(wallet ? Address.parse(wallet) : null)
        .storeBit(0)
        .storeCoins(toNano("0.02"))
        .storeBit(0)
        .endCell();
      return safeSend(ANODE_MASTER_ADDR, "0.05", body);
    },

    sendMint: () => {
        const body = beginCell()
            .storeUint(0x15, 32) 
            .storeAddress(wallet ? Address.parse(wallet) : Address.parse(ANODE_MASTER_ADDR))
            .storeInt(toNano("1000"), 257)
            .endCell();
        return safeSend(ANODE_MASTER_ADDR, "0.1", body);
    },

    sendAirdrop: () => safeSend(ANODE_MASTER_ADDR, "0.1"),
  };
}
