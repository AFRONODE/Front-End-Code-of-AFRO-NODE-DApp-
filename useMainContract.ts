import { useEffect, useState } from "react";
import { Address, toNano, beginCell, Cell } from "@ton/core";
import { useTonConnect } from "./useTonConnect";

const ANODE_MASTER_ADDR = "EQBAG5qBNaTLePaCtjeHjGMcGl9tEk4o6OQXx3DO161ncnBS";
const ESCROW_ADDR = "EQDJNggvUv1ZTRe-L9VhIZlqQF3Fw9kP-tZWreEsqIppSeRC";
const MARKETPLACE_ADDR = "EQD-rLNksqy7ideJTKIw-wnhO3Zt6dsoGCoYiMlwu-4V9xrf";
const HUB_DAO_ADDR = "EQDRBjOD-W1fypLGfCRhyUp5JXZPOdNHtEZWjrBKTiHi70Qq";

export function useMainContract() {
  const { sender, connected, wallet } = useTonConnect();
  const [contractData, setContractData] = useState({
    master_address: ANODE_MASTER_ADDR,
    escrow_address: ESCROW_ADDR,
    marketplace_address: MARKETPLACE_ADDR,
    dao_address: HUB_DAO_ADDR,
    counter_value: 0,
    jetton_balance: 0
  });

  const safeSend = async (to: string, value: string, body: Cell | null = null) => {
    if (!connected || !sender) throw new Error("Wallet not connected");
    await sender.send({
      to: Address.parse(to),
      value: toNano(value),
      body: body,
    });
  };

  return {
    ...contractData,
    contract_address: contractData.master_address,
    connected,

    // Sync with AnodeMaster.tact
    sendIncrement: () => safeSend(ANODE_MASTER_ADDR, "0.05", beginCell().storeUint(0, 32).storeStringTail("Increment").endCell()),
    sendDeposit: (amount = "2") => safeSend(ANODE_MASTER_ADDR, amount),
    sendWithdraw: () => safeSend(ANODE_MASTER_ADDR, "0.05", beginCell().storeUint(0, 32).storeStringTail("Withdraw").endCell()), 

    // Sync with Marketplace.tact: PurchaseService { service_id: Int }
    // Tact message layout: op (32-bit hash) + payload
    executeAnodePayment: (type: 'escrow' | 'marketplace', amount: string = "1") => {
      if (type === 'marketplace') {
        const body = beginCell()
          .storeUint(0x2d1f760e, 32) // CRC32 hash of "PurchaseService"
          .storeUint(1, 257)         // service_id (Defaulting to 1 for demo)
          .endCell();
        return safeSend(MARKETPLACE_ADDR, amount, body);
      } else {
        // Sync with Escrow.tact: FundGig { gig_id, provider, is_dao }
        const body = beginCell()
          .storeUint(0x1a2b3c4d, 32) // Example OP for FundGig
          .storeUint(Math.floor(Math.random() * 1000), 257) // gig_id
          .storeAddress(Address.parse(ANODE_MASTER_ADDR))   // provider (Master as placeholder)
          .storeBit(false)                                 // is_dao
          .endCell();
        return safeSend(ESCROW_ADDR, amount, body);
      }
    },

    // Sync with AnodeWallet.tact: StakeTokens { amount, lock_period }
    executeAnodeStaking: (amount: string) => {
      const body = beginCell()
        .storeUint(0x11223344, 32) // Example OP for StakeTokens hash
        .storeInt(toNano(amount), 257)
        .storeInt(60 * 60 * 24 * 7, 257) // 1 week lock period
        .endCell();
      // In a real flow, this would be sent to the user's specific AnodeWallet contract
      return safeSend(ANODE_MASTER_ADDR, "0.1", body);
    },

    // Sync with P2P Jetton Transfer (Standard 0xf8a7ea5)
    executeAnodeP2P: (recipient: string, amount: string) => {
      const body = beginCell()
        .storeUint(0xf8a7ea5, 32) 
        .storeUint(0, 64)        
        .storeCoins(toNano(amount)) 
        .storeAddress(Address.parse(recipient))
        .storeAddress(wallet ? Address.parse(wallet) : null)
        .storeBit(0)             
        .storeCoins(toNano("0.02")) 
        .storeBit(0)             
        .endCell();
      return safeSend(ANODE_MASTER_ADDR, "0.05", body);
    },

    // Admin Tools sync with AnodeMaster.tact: Mint { to, amount }
    sendMint: () => {
        const body = beginCell()
            .storeUint(0x15, 32) // Example hash for Mint
            .storeAddress(wallet ? Address.parse(wallet) : Address.parse(ANODE_MASTER_ADDR))
            .storeInt(toNano("1000"), 257)
            .endCell();
        return safeSend(ANODE_MASTER_ADDR, "0.1", body);
    },
    
    sendAirdrop: () => safeSend(ANODE_MASTER_ADDR, "0.1"),
  };
}
