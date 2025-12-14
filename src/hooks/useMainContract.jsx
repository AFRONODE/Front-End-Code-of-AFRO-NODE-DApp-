import { useEffect, useState } from "react";
import { Address } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

const ANODE_MASTER_ADDR = "0:622bfefe1fff1fef695db7df24fc7f9999fef695db7df24fc7f9999fef695db7";
const ESCROW_ADDR = "0:6e5bf4c767ac97f86ea7bd7dfdf67cad3a9edddf67cad3a9edddf67cad3a9d9c";
const MARKETPLACE_ADDR = "0:7113a992fef9f9fef695db7df24fc7f9999fef695db7df24fc7f9999fef695db";

export function useMainContract() {
  const { sender, wallet } = useTonConnect();
  
  const [contractData] = useState(() => {
    try {
      return {
        master_address: Address.parse(ANODE_MASTER_ADDR).toString({ testOnly: true }),
        escrow_address: Address.parse(ESCROW_ADDR).toString({ testOnly: true }),
        marketplace_address: Address.parse(MARKETPLACE_ADDR).toString({ testOnly: true }),
        counter_value: 1234,
        jetton_balance: 0
      };
    } catch (e) {
      return {
        master_address: ANODE_MASTER_ADDR,
        escrow_address: ESCROW_ADDR,
        marketplace_address: MARKETPLACE_ADDR,
        counter_value: 0,
        jetton_balance: 0
      };
    }
  });
  
  const [userAnodeWallet, setUserAnodeWallet] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    setIsLoading(false);
    if (wallet) {
      setUserAnodeWallet("Discovery Pending (Mock)");
      setIsAdmin(true); 
    } else {
      setIsAdmin(false);
      setUserAnodeWallet(null);
    }
  }, [wallet]);

  const sendIncrement = async () => { console.log("Incrementing..."); };
  const sendDeposit = async () => { console.log("Depositing..."); };
  const sendWithdraw = async () => { console.log("Withdrawing..."); };
  const sendMint = async () => { console.log("Minting..."); };
  const sendAirdrop = async () => { console.log("Airdropping..."); };

  return {
    ...contractData,
    contract_address: contractData.master_address, // Matches App.jsx
    user_anode_wallet: userAnodeWallet,
    isAdmin,
    isLoading,
    sendIncrement,
    sendDeposit,
    sendWithdraw,
    sendMint,
    sendAirdrop,
  };
}
