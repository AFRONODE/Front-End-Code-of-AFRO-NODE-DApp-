import { useEffect, useState } from "react";
import { Address, toNano, beginCell } from "@ton/core";
import { useTonConnect } from "./useTonConnect";
import { useTonClient } from "./useTonClient";

const ANODE_MASTER_ADDR = "EQBGt7POdkpvf1_U5hb65KgvlVT-3FAtban1raJvpFKV89GI";

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
        console.error("Contract Error:", e);
      }
    }
    getValue();
  }, [client]);

  return {
    contract_address: ANODE_MASTER_ADDR,
    counter_value: contractData.counter_value,
    connected,
    sendMint: async () => {
      const body = beginCell().storeUint(0x15, 32).storeUint(0, 64).storeCoins(toNano("1000")).endCell();
      return sender.send({
        to: Address.parse(ANODE_MASTER_ADDR),
        value: toNano("0.05"),
        body: body,
      });
    }
  };
}
