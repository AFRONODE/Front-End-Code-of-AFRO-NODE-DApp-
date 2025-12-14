import { useEffect, useState } from "react";
import { Address } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

const ANODE_MASTER_ADDR = "EQD8vR95p-Tj0J6h_E3bE56R2oT2S9lD1qW6X2_j5XzY7t-n";

export function useMainContract() {
  const { sender } = useTonConnect();
  const [contractData, setContractData] = useState(null);
  const [jettonBalance, setJettonBalance] = useState(0);

  const contractAddress = Address.parse(ANODE_MASTER_ADDR);

  useEffect(() => {
    if (contractData) return;

    setContractData({
      contract_address: contractAddress.toString(),
      counter_value: 1234,
    });
    setJettonBalance(9999);
  }, [contractAddress]);

  const sendIncrement = async () => {
    if (!sender) return;
    console.log("Increment Button Pressed.");
  };

  const sendDeposit = async () => {
    if (!sender) return;
    console.log("Deposit Button Pressed.");
  };

  const sendWithdraw = async () => {
    if (!sender) return;
    console.log("Withdraw Button Pressed.");
  };

  const sendMint = async () => {
    if (!sender) return;
    console.log("Mint Button Pressed.");
  };

  const sendAirdrop = async () => {
    if (!sender) return;
    console.log("Airdrop Button Pressed.");
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
