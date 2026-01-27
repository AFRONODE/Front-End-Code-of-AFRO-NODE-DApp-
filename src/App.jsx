import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/useMainContract';
import { useTonConnect } from './hooks/useTonConnect';
import { Address, toNano } from '@ton/core';
import { useState } from 'react';

// Sync with TREASURY / AFRO_NODE constant in Back-End
const ADMIN_WALLET_ADDRESS = "0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u";

function App() {
  const { connected } = useTonConnect();
  const [tonConnectUI] = useTonConnectUI();
  const [txStatus, setTxStatus] = useState("");
  
  // UI State for User Inputs
  const [p2pRecipient, setP2pRecipient] = useState("");
  const [p2pAmount, setP2pAmount] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");

  const {
    contract_address,
    marketplace_address,
    escrow_address,
    dao_address,
    counter_value,
    jetton_balance,
    sendIncrement,
    sendDeposit,
    sendWithdraw,
    sendMint,
    sendAirdrop,
    executeAnodePayment, // For Marketplace & Escrow
    executeAnodeP2P,      
    executeAnodeStaking   // Syncs with AnodeWallet.tact StakeTokens
  } = useMainContract(); 

  let isAdmin = false;
  const connectedAddress = tonConnectUI?.account?.address;

  // Wallet Normalization for Admin Check
  if (connected && connectedAddress) {
    try {
      const connectedFriendly = Address.parse(connectedAddress).toString();
      const adminFriendly = Address.parse(ADMIN_WALLET_ADDRESS).toString();
      if (connectedFriendly === adminFriendly) isAdmin = true;
    } catch (e) {}
  }

  // FIXED: Removed TypeScript types to ensure Netlify/Vite builds correctly
  const handleProtectedAction = (action, label) => {
    if (!connected) {
      tonConnectUI.openModal();
      setTxStatus("Please connect your wallet to proceed.");
      return;
    }
    setTxStatus(`Initiating ${label}... Check wallet!`);
    action();
  };

  // Sync with Marketplace.tact logic
  const marketplaceItems = [
    { id: 1, title: "Web3 DApp Architecture", price: "200" },
    { id: 2, title: "AI LLM & Machine Learning", price: "500" },
    { id: 3, title: "Smart Contract Security Audit", price: "300" },
    { id: 4, title: "Crypto Legal Compliance (Africa)", price: "150" },
    { id: 5, title: "Tokenomics Design", price: "250" },
    { id: 6, title: "Full-Stack Web2 Services", price: "100" },
  ];

  if (!contract_address) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center animate-bounce text-blue-400 font-bold">
          🌍 INITIALIZING AFRO-NODE ECOSYSTEM...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container p-4 bg-slate-900 min-h-screen text-white font-sans">
      
      {/* HEADER SECTION */}
      <div className="header flex justify-between items-center mb-6 bg-slate-800 p-4 rounded-lg shadow-lg border-b-2 border-blue-500">
        <div className="flex items-center gap-2">
          <img src="/afro-node-logo.png" alt="Logo" className="h-10 w-10" />
          <h1 className="text-xl font-black hidden md:block text-blue-400">AFRO-NODE DApp</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-blue-400 font-mono">WALLET CONNECTED</p>
            <p className="text-xs font-bold text-yellow-500">{jetton_balance} $ANODE</p>
          </div>
          <TonConnectButton />
        </div>
      </div>

      {/* STATUS NOTIFICATIONS */}
      {txStatus && (
        <div className="mb-4 p-3 bg-blue-600/20 border border-blue-400 rounded-lg text-center">
          <p className="text-blue-300 font-bold text-sm tracking-wide">📡 {txStatus}</p>
        </div>
      )}

      {/* CORE UTILITY: VAULT & STAKING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* AnodeMaster.tact Logic Interaction */}
        <div className="card bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
            <span>🏦</span> Blockchain Vault
          </h2>
          <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-900 p-3 rounded-lg border border-slate-700">
            <div className="text-center border-r border-slate-700">
               <p className="text-xs text-gray-400 uppercase">Counter</p>
               <p className="text-xl font-bold">{counter_value}</p>
            </div>
            <div className="text-center">
               <p className="text-xs text-gray-400 uppercase">Vault Type</p>
               <p className="text-xl font-bold text-blue-500">TACT</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => handleProtectedAction(sendIncrement, "Increment")} className="bg-blue-600 p-2 rounded font-bold hover:bg-blue-500 transition-all active:scale-95">➕ Increment State</button>
            <button onClick={() => handleProtectedAction(sendDeposit, "Deposit")} className="bg-green-600 p-2 rounded font-bold hover:bg-green-500 transition-all active:scale-95">📥 Deposit 2 TON</button>
            <button onClick={() => handleProtectedAction(sendWithdraw, "Withdraw")} className="bg-red-600 p-2 rounded font-bold hover:bg-red-500 transition-all active:scale-95">📤 Withdraw 1 TON</button>
          </div>
        </div>

        {/* AnodeWallet.tact Logic Interaction */}
        <div className="card bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-pink-400 flex items-center gap-2">
            <span>🌱</span> Staking & P2P
          </h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Stake Amount ($ANODE)" 
                className="flex-1 bg-slate-900 p-2 rounded text-sm border border-slate-700 outline-none focus:border-pink-500"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <button 
                onClick={() => handleProtectedAction(() => executeAnodeStaking(stakeAmount), "Staking")}
                className="bg-pink-600 px-4 py-2 rounded font-bold text-xs hover:bg-pink-500"
              >
                STAKE
              </button>
            </div>
            <div className="border-t border-slate-700 pt-4">
              <p className="text-[10px] text-gray-400 mb-2 font-bold uppercase tracking-widest text-center">Direct $ANODE Transfer</p>
              <input 
                type="text" 
                placeholder="Recipient TON Address" 
                className="w-full bg-slate-900 p-2 rounded text-sm border border-slate-700 mb-2 outline-none focus:border-orange-500"
                value={p2pRecipient}
                onChange={(e) => setP2pRecipient(e.target.value)}
              />
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Amount" 
                  className="w-1/3 bg-slate-900 p-2 rounded text-sm border border-slate-700 outline-none"
                  value={p2pAmount}
                  onChange={(e) => setP2pAmount(e.target.value)}
                />
                <button 
                  onClick={() => handleProtectedAction(() => executeAnodeP2P(p2pRecipient, p2pAmount), "P2P Transfer")}
                  className="flex-1 bg-orange-600 py-2 rounded font-bold text-xs hover:bg-orange-500"
                >
                  SEND JETTONS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GOVERNANCE & ESCROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Escrow.tact Logic Alignment (10% Fee) */}
        <div className="card bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-purple-400">Escrow Protocol 🔒</h2>
          <div className="bg-slate-900 p-4 rounded-lg mb-3 text-xs font-mono space-y-1">
            <div className="flex justify-between"><span>SERVICE BASE:</span> <span className="text-white">100%</span></div>
            <div className="flex justify-between border-b border-slate-800 pb-1"><span>NODE FEE:</span> <span className="text-blue-400">10%</span></div>
            <div className="flex justify-between pt-1 font-bold"><span>TOTAL REQUIRED:</span> <span className="text-green-400">110%</span></div>
          </div>
          <button 
            onClick={() => handleProtectedAction(() => executeAnodePayment('escrow'), "Escrow Payment")}
            className="w-full bg-purple-600 p-3 rounded font-bold hover:bg-purple-500 shadow-lg shadow-purple-900/20"
          >
            INITIATE SECURE CONTRACT
          </button>
        </div>

        {/* HubDAO.fc Logic Alignment (15% Talent Remittance) */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-xl font-bold mb-4 text-orange-400 flex items-center gap-2">
              <span>💡</span> Innovation Hub DAO
            </h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Governed by FunC smart contracts. Hub Talent payments incur a 15% remittance to the DAO Treasury for ecosystem growth.
            </p>
          </div>
          <button onClick={() => window.open(`https://testnet.tonviewer.com/${dao_address}`)} className="bg-slate-700 p-3 rounded hover:border-orange-500 border border-transparent transition-all font-bold text-sm">
             🗳️ OPEN PROPOSALS & VOTING
          </button>
        </div>
      </div>

      {/* Marketplace.tact Logic Alignment */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4 text-blue-400">Services Marketplace ($ANODE)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {marketplaceItems.map(item => (
            <div key={item.id} className="p-4 bg-slate-900 rounded-lg flex justify-between items-center border border-slate-800 hover:border-blue-500/50 transition-all">
              <div>
                <p className="font-bold text-sm text-gray-100">{item.title}</p>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] bg-blue-900 text-blue-200 px-2 rounded">Verified</span>
                   <p className="text-xs text-yellow-500 font-mono">{item.price} $ANODE</p>
                </div>
              </div>
              <button 
                onClick={() => handleProtectedAction(() => executeAnodePayment('marketplace'), item.title)}
                className="bg-blue-500 text-[10px] px-4 py-2 rounded font-black hover:bg-blue-400 uppercase tracking-tighter"
              >
                ORDER NOW
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ADMIN GOVERNANCE - Sync with Master Owner Check */}
      {isAdmin && (
        <div className="bg-red-900/10 p-6 rounded-xl border-2 border-dashed border-red-600/50">
          <h3 className="text-red-500 font-black mb-4 text-center tracking-[0.3em] text-sm uppercase">Administrative Control Plane</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={sendMint} className="flex-1 bg-red-600 p-3 rounded font-bold shadow-lg hover:bg-red-500 transition-colors">MINT SYSTEM TOKENS</button>
            <button onClick={sendAirdrop} className="flex-1 bg-orange-600 p-3 rounded font-bold shadow-lg hover:bg-orange-500 transition-colors">TRIGGER GLOBAL AIRDROP</button>
          </div>
        </div>
      )}

      <footer className="mt-10 text-center text-[10px] text-gray-500 font-mono">
        AFRO-NODE v1.0.4 | SECURED BY TACT & FUNC | 2026
      </footer>
    </div>
  );
}

export default App;
