import { useEffect, useState } from "react";
import { Address } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

const ANODE_MASTER_ADDR = "0:622bfefe1fff1fef695db7df24fc7f9999fef695db7df24fc7f9999fef695db7";
const ESCROW_ADDR = "0:6e5bf4c767ac97f86ea7bd7dfdf67cad3a9edddf67cad3a9edddf67cad3a9d9c";
const MARKETPLACE_ADDR = "0:7113a992fef9f9fef695db7df24fc7f9999fef695db7df24fc7f9999fef695db";

export function useMainContract() {
  const { sender, wallet } = useTonConnect();
  
  const [contractData] = useState({
    master_address: Address.parse(ANODE_MASTER_ADDR).toString({ testOnly: true }),
    escrow_address: Address.parse(ESCROW_ADDR).toString({ testOnly: true }),
    marketplace_address: Address.parse(MARKETPLACE_ADDR).toString({ testOnly: true }),
    counter_value: 1234
  });
  
  // Removed the <string | null> type annotation for .jsx compatibility
  const [userAnodeWallet, setUserAnodeWallet] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);

    if (wallet) {
      setUserAnodeWallet("Discovery Pending (Mock)");
      setIsAdmin(true); 
      console.log("Wallet detected:", wallet);
    } else {
      setIsAdmin(false);
      setUserAnodeWallet(null);
    }
  }, [wallet]);

  const sendIncrement = async () => { console.log("Mock Increment"); };
  const sendDeposit = async () => { console.log("Mock Deposit"); };
  const sendWithdraw = async () => { console.log("Mock Withdraw"); };
  const sendMint = async () => { console.log("Mock Minting triggered"); };
  const sendAirdrop = async () => { console.log("Mock Airdrop triggered"); };

  return {
    ...contractData,
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
