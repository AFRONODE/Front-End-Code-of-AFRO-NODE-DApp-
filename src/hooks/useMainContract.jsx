import { useEffect, useState } from "react";
import { Address } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

const ANODE_MASTER_ADDR = "0:622bfefe1fff1fef695db7df24fc7f9999fef695db7df24fc7f9999fef695db7";
const ESCROW_ADDR = "0:6e5bf4c767ac97f86ea7bd7dfdf67cad3a9edddf67cad3a9edddf67cad3a9d9c";
const MARKETPLACE_ADDR = "0:7113a992fef9f9fef695db7df24fc7f9999fef695db7df24fc7f9999fef695db";

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
  };

  const sendDeposit = async () => {
    if (!sender) return;
  };

  const sendWithdraw = async () => {
    if (!sender) return;
  };

  const sendMint = async () => {
    if (!sender || !isAdmin) return;
  };

  const sendAirdrop = async () => {
    if (!sender || !isAdmin) return;
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
