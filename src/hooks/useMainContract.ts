import { useEffect, useState } from "react";
import { Address, toNano, beginCell } from "@ton/core";
import { useTonConnect } from "./useTonConnect";
import { useTonClient } from "./useTonClient";

const ANODE_MASTER_ADDR = "EQBAG5qBNaTLePaCtjeHjGMcGl9tEk4o6OQXx3DO161ncnBS";

export function useMainContract() {
  const { sender, connected } = useTonConnect();
  const { client } = useTonClient();
  const [contractData, setContractData] = useState({ counter_value: 0 });

  useEffect(() => {
    async function getValue() {
      if (!client) return;
      try {
        const result = await client.runMethod(Address.parse(ANODE_MASTER_ADDR), "get_counter");
        setContractData({ 
          counter_value: Number(result.stack.readBigNumber()) 
        });
      } catch (e) { 
        console.log("Waiting for AnodeMaster RPC..."); 
      }
    }
    getValue();
  }, [client]);

  return {
    contract_address: ANODE_MASTER_ADDR,
    counter_value: contractData.counter_value,
    connected,
    sendMint: async () => {
      const body = beginCell()
        .storeUint(0x15, 32) // Op-code for Mint
        .storeUint(0, 64)    // Query ID
        .storeCoins(toNano("1000")) 
        .endCell();
        
      return sender.send({
        to: Address.parse(ANODE_MASTER_ADDR),
        value: toNano("0.05"),
        body: body,
      });
    }
  };
}
