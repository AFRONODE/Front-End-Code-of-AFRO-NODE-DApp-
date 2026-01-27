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
  const [contractData, setContractData] = useState({
    counter_value: 0,
    jetton_balance: 0
  });

  // Fetch live data from Tact Get-Methods
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
    if (!connected || !sender) {
        alert("Please connect your wallet first!");
        return;
    }
    try {
        await sender.send({
            to: Address.parse(to),
            value: toNano(value),
            body: body,
        });
    } catch (e) {
        console.error("Transfer error:", e);
    }
  };

  return {
    contract_address: ANODE_MASTER_ADDR,
    dao_address: HUB_DAO_ADDR,
    ...contractData,

    // TACT: Simple Increment (Op-code 0 usually handles text comments in Tact)
    sendIncrement: () => safeSend(ANODE_MASTER_ADDR, "0.05", beginCell().storeUint(0, 32).storeStringTail("increment").endCell()),
    
    // TACT: Deposit (Just sending TON to the contract)
    sendDeposit: () => safeSend(ANODE_MASTER_ADDR, "2.0"),

    // SYNC: Marketplace Logic
    // Even if backend doesn't list items, we send the "Order ID" as part of the payload
    executeAnodePayment: (type, serviceTitle) => {
      const body = beginCell()
        .storeUint(0x2d1f760e, 32) // Match PurchaseService opcode in Marketplace.tact
        .storeUint(Date.now(), 64)  // Unique Query ID
        .storeStringTail(serviceTitle)
        .endCell();
      const target = type === 'marketplace' ? MARKETPLACE_ADDR : ESCROW_ADDR;
      return safeSend(target, "1.0", body);
    },

    // TACT: Staking Logic (AnodeWallet.tact)
    executeAnodeStaking: (amount) => {
      const body = beginCell()
        .storeUint(0x11223344, 32) 
        .storeCoins(toNano(amount || "0"))
        .endCell();
      return safeSend(ANODE_MASTER_ADDR, "0.1", body);
    },

    // ADMIN: Minting (AnodeMaster.tact)
    sendMint: () => {
        const body = beginCell()
            .storeUint(0x15, 32) 
            .storeAddress(Address.parse(ADMIN_WALLET_ADDRESS)) // Hardcoded Admin
            .storeCoins(toNano("1000"))
            .endCell();
        return safeSend(ANODE_MASTER_ADDR, "0.1", body);
    }
  };
}
