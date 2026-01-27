import { useEffect, useState } from "react";
import { Address, toNano, beginCell } from "@ton/core";
import { useTonConnect } from "./useTonConnect";
import { useTonClient } from "./useTonClient";

const ANODE_MASTER_ADDR = "EQBAG5qBNaTLePaCtjeHjGMcGl9tEk4o6OQXx3DO161ncnBS";
const ESCROW_ADDR = "EQDJNggvUv1ZTRe-L9VhIZlqQF3Fw9kP-tZWreEsqIppSeRC";
const MARKETPLACE_ADDR = "EQD-rLNksqy7ideJTKIw-wnhO3Zt6dsoGCoYiMlwu-4V9xrf";
const HUB_DAO_ADDR = "EQDRBjOD-W1fypLGfCRhyUp5JXZPOdNHtEZWjrBKTiHi70Qq";

export function useMainContract() {
  const { sender, connected, wallet } = useTonConnect();
  const { client } = useTonClient();
  const [contractData, setContractData] = useState({ counter_value: 0, jetton_balance: 0 });

  useEffect(() => {
    async function getValue() {
      if (!client) return;
      try {
        const result = await client.runMethod(Address.parse(ANODE_MASTER_ADDR), "get_counter");
        setContractData(prev => ({ ...prev, counter_value: result.stack.readNumber() }));
      } catch (e) { console.log("Master not yet active or error fetching counter"); }
    }
    getValue();
  }, [client]);

  const safeSend = async (to, value, body = null) => {
    if (!connected || !sender) throw new Error("Wallet not connected");
    
    // Create transaction request with valid timestamp to avoid 'ci {}' errors
    await sender.send({
      to: Address.parse(to),
      value: toNano(value),
      body: body,
      validUntil: Math.floor(Date.now() / 1000) + 60, // Valid for 60 seconds
    });
  };

  return {
    contract_address: ANODE_MASTER_ADDR,
    dao_address: HUB_DAO_ADDR,
    ...contractData,

    sendIncrement: () => safeSend(ANODE_MASTER_ADDR, "0.05", beginCell().storeUint(0x37491f2f, 32).storeUint(0, 64).endCell()),
    sendDeposit: () => safeSend(ANODE_MASTER_ADDR, "2.0"),
    sendWithdraw: () => safeSend(ANODE_MASTER_ADDR, "0.05", beginCell().storeUint(0x41836980, 32).storeUint(0, 64).endCell()),
    
    executeAnodePayment: (type) => {
      const body = beginCell().storeUint(0x2d1f760e, 32).storeUint(0, 64).endCell();
      const addr = type === 'marketplace' ? MARKETPLACE_ADDR : ESCROW_ADDR;
      return safeSend(addr, "1.0", body);
    },

    executeAnodeStaking: (amount) => {
      const body = beginCell().storeUint(0x11223344, 32).storeCoins(toNano(amount || "0")).endCell();
      return safeSend(ANODE_MASTER_ADDR, "0.1", body);
    },

    sendMint: () => safeSend(ANODE_MASTER_ADDR, "0.1", beginCell().storeUint(0x15, 32).storeCoins(toNano("1000")).endCell()),
    sendAirdrop: () => safeSend(ANODE_MASTER_ADDR, "0.1", beginCell().storeUint(0x44, 32).endCell()),
    executeAnodeP2P: (recp, amt) => safeSend(ANODE_MASTER_ADDR, "0.05") 
  };
}
