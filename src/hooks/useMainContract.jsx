import { useEffect, useState } from "react";
import { Address } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

const ANODE_MASTER_ADDR = "EQBYiv7_H_9v6S07Sre9fS_ZpM_9v6S07Sre9fS_ZpM_9v6S";
const ESCROW_ADDR = "EQBvW_THZ6yX-G6noA7f_32fK06noA7f_32fK06noA7f_22k";
const MARKETPLACE_ADDR = "EQCxE6mS_v9v6S07Sre9fS_ZpM_9v6S07Sre9fS_ZpM_9v23";

export function useMainContract() {
  const { sender, wallet } = useTonConnect();
  const [contractData, setContractData] = useState(null);
  const [userAnodeWallet, setUserAnodeWallet] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const masterAddress = Address.parse(ANODE_MASTER_ADDR);

  useEffect(() => {
    if (contractData) return;

    setContractData({
      master_address: masterAddress.toString({ testOnly: true }),
      escrow_address: Address.parse(ESCROW_ADDR).toString({ testOnly: true }),
      marketplace_address: Address.parse(MARKETPLACE_ADDR).toString({ testOnly: true }),
    });
  }, [masterAddress, contractData]);

  useEffect(() => {
    if (wallet) {
      setUserAnodeWallet("Discovery Pending");
      setIsAdmin(true); 
    } else {
      setIsAdmin(false);
    }
  }, [wallet]);

  const sendIncrement = async () => {
    if (!sender) return;
    console.log("Master: Increment");
  };

  const sendDeposit = async () => {
    if (!sender) return;
    console.log("Escrow: Deposit");
  };

  const sendWithdraw = async () => {
    if (!sender) return;
    console.log("Withdraw");
  };

  const sendMint = async () => {
    if (!sender || !isAdmin) return;
    console.log("Admin: Mint");
  };

  const sendAirdrop = async () => {
    if (!sender || !isAdmin) return;
    console.log("Admin: Airdrop");
  };

  return {
    ...contractData,
    user_anode_wallet: userAnodeWallet,
    isAdmin,
    sendIncrement,
    sendDeposit,
    sendWithdraw,
    sendMint,
    sendAirdrop,
  };
}
