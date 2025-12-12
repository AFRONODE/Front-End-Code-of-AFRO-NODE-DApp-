import { useEffect, useState } from "react";
import { Address } from "@ton/core";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";

// @dev Deployment address for AnodeMaster
const ANODE_MASTER_ADDR = "EQCD39VS5VADWfG8K_N_pYkK493Nl44_I5HhK0-r3Nn2t_Hl";

export function useMainContract() {
  const { client } = useTonClient();
  const { sender } = useTonConnect();
  const [contractData, setContractData] = useState(null);
  const [jettonBalance, setJettonBalance] = useState(0);

  const contractAddress = Address.parse(ANODE_MASTER_ADDR);

  useEffect(() => {
    // @dev State initialization for UI testing
    setContractData({
      contract_address: contractAddress.toString(),
      counter_value: 1234,
    });
    setJettonBalance(9999);
  }, [contractAddress]);

  const sendIncrement = async () => {
    if (!sender) return;
    console.log("[Contract] Trigger: Increment");
  };

  const sendDeposit = async () => {
    if (!sender) return;
    console.log("[Contract] Trigger: Deposit");
  };

  const sendWithdraw = async () => {
    if (!sender) return;
    console.log("[Contract] Trigger: Withdraw");
  };

  const sendMint = async () => {
    if (!sender) return;
    console.log("[Admin] Trigger: Mint");
  };

  const sendAirdrop = async () => {
    if (!sender) return;
    console.log("[Admin] Trigger: Airdrop");
  };

  return {
    contract_address: contractData?.contract_address,
    counter_value: contractData?.counter_value,
    jetton_balance: jettonBalance,
    sendIncrement,
    sendDeposit,
    sendWithdraw,
    sendMint,
    sendAirdrop,
  };
}
