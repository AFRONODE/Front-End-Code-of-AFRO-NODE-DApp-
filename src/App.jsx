import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/useMainContract';
import { useTonConnect } from './hooks/useTonConnect';
import { Address, toNano } from '@ton/core';
import { useState } from 'react';

const ADMIN_WALLET_ADDRESS = "0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u";

function App() {
  const { connected } = useTonConnect();
  const [tonConnectUI] = useTonConnectUI();
  const [txStatus, setTxStatus] = useState("");
  
  // States for P2P and Staking inputs
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
    executeAnodePayment,
    executeAnodeP2P,      // Added for logic handshake
    executeAnodeStaking   // Added for logic handshake
  } = useMainContract(); 

  let isAdmin = false;
  const connectedAddress = tonConnectUI?.account?.address;

  if (connected && connectedAddress) {
    try {
      const connectedFriendly = Address.parse(connectedAddress).toString();
      const adminFriendly = Address.parse(ADMIN_WALLET_ADDRESS).toString();
      if (connectedFriendly === adminFriendly) isAdmin = true;
    } catch (e) {}
  }

  const handleProtectedAction = (action, label) => {
    if (!connected) {
      tonConnectUI.openModal();
      setTxStatus("Please connect your wallet to proceed.");
      return;
    }
    setTxStatus(`Initiating ${label}... Check wallet!`);
    action();
  };

  const marketplaceItems = [
    { id: 1, title: "Web3 DApp Architecture", price: "200" },
    { id: 2, title: "AI LLM & Machine Learning", price: "500" },
    { id: 3, title: "Smart Contract Security Audit", price: "300" },
    { id: 4, title: "Crypto Legal Compliance (Africa)", price: "150" },
    { id: 5, title: "Tokenomics Design", price: "250" },
    { id: 6, title: "Full-Stack Web2 Services", price: "100" },
  ];

  if (!contract_address) {
    return <div className="p-10 text-center text-blue-400 bg-slate-900 min-h-screen">Initializing AFRO-NODE...</div>;
  }

  return (
    <div className="app-container p-4 bg-slate-900 min-h-screen text-white font-sans">
      
      {/* HEADER */}
      <div className="header flex justify-between items-center mb-6 bg-slate-800 p-4 rounded-lg shadow-lg border-b-2 border-blue-500">
        <img src="/afro-node-logo.png" alt="Logo" className="h-10 w-10" />
        <h1 className="text-xl font-black">AFRO-NODE DApp 🌍</h1>
        <img src="/anode-token.png" alt="Token" className="h-10 w-10" />
        <TonConnectButton />
      </div>

      {/* LIVE TRANSACTION NOTIFICATIONS */}
      {txStatus && (
        <div className="mb-4 p-3 bg-blue-600/20 border border-blue-400 rounded-lg animate-pulse">
          <p className="text-blue-300 text-center font-bold text-sm">📡 {txStatus}</p>
        </div>
      )}

      {/* BLOCKCHAIN VAULT & STAKING SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-blue-400">Blockchain Vault 🏦</h2>
          <div className="flex justify-between mb-4">
            <span>Counter: <b>{counter_value}</b></span>
            <span>Balance: <b className="text-yellow-500">{jetton_balance} $ANODE</b></span>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => handleProtectedAction(sendIncrement, "Increment")} className="bg-blue-600 p-2 rounded font-bold hover:bg-blue-500 transition-colors">➕ Increment</button>
            <button onClick={() => handleProtectedAction(sendDeposit, "Deposit")} className="bg-green-600 p-2 rounded font-bold hover:bg-green-500 transition-colors">📥 Deposit 2 TON</button>
            <button onClick={() => handleProtectedAction(sendWithdraw, "Withdraw")} className="bg-red-600 p-2 rounded font-bold hover:bg-red-500 transition-colors">📤 Withdraw 1 TON</button>
          </div>
        </div>

        {/* $ANODE UTILITY SECTION: STAKING & P2P */}
        <div className="card bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-pink-400">Utility & Governance 🌱</h2>
          <div className="space-y-4">
            {/* Staking Input */}
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Amount to Stake" 
                className="flex-1 bg-slate-900 p-2 rounded text-sm border border-slate-700 outline-none focus:border-pink-500"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <button 
                onClick={() => handleProtectedAction(() => executeAnodeStaking(stakeAmount), "Staking")}
                className="bg-pink-600 px-4 py-2 rounded font-bold text-xs"
              >
                STAKE $ANODE
              </button>
            </div>
            {/* P2P Transfer */}
            <div className="border-t border-slate-700 pt-4">
              <p className="text-xs text-gray-400 mb-2 font-bold uppercase">↔️ P2P Wallet Transfer</p>
              <input 
                type="text" 
                placeholder="Recipient Address" 
                className="w-full bg-slate-900 p-2 rounded text-sm border border-slate-700 mb-2 outline-none focus:border-orange-500"
                value={p2pRecipient}
                onChange={(e) => setP2pRecipient(e.target.value)}
              />
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Amount" 
                  className="w-1/3 bg-slate-900 p-2 rounded text-sm border border-slate-700 outline-none focus:border-orange-500"
                  value={p2pAmount}
                  onChange={(e) => setP2pAmount(e.target.value)}
                />
                <button 
                  onClick={() => handleProtectedAction(() => executeAnodeP2P(p2pRecipient, p2pAmount), "P2P Transfer")}
                  className="flex-1 bg-orange-600 py-2 rounded font-bold text-xs"
                >
                  SEND TO WALLET
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ESCROW & MARKETPLACE REMAINS UNCHANGED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-purple-400">Escrow Calculator 🔒</h2>
          <div className="bg-slate-900 p-3 rounded mb-3 text-sm">
            <p>Service Payment: 100%</p>
            <p>Service Fee: 10%</p>
            <hr className="my-1 border-slate-700"/>
            <p className="font-bold text-green-400">Total Remittance: 110%</p>
          </div>
          <button 
            onClick={() => handleProtectedAction(() => executeAnodePayment('escrow'), "Escrow Payment")}
            className="w-full bg-purple-600 p-2 rounded font-bold hover:bg-purple-500 transition-colors"
          >
            Initiate Secure Escrow
          </button>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-bold mb-4 text-orange-400">Innovation Hub DAO 💡</h3>
          <div className="grid grid-cols-1 gap-4 text-center">
              <button onClick={() => window.open(`https://testnet.tonviewer.com/${dao_address}`)} className="bg-slate-700 p-4 rounded hover:border-orange-500 border border-transparent transition-all">
                 🗳️ DAO Proposals & Voting
              </button>
              <div className="text-xs text-gray-400">
                  <p>Remittance: 10% Marketplace / 15% Hub Talent</p>
              </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-blue-400">Services Marketplace ($ANODE) 🌐</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketplaceItems.map(item => (
            <div key={item.id} className="p-3 bg-slate-700 rounded-lg flex justify-between items-center border border-slate-600">
              <div>
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-xs text-yellow-500">{item.price} $ANODE</p>
              </div>
              <button 
                onClick={() => handleProtectedAction(() => executeAnodePayment('marketplace'), item.title)}
                className="bg-blue-500 text-xs px-3 py-1 rounded hover:bg-blue-400 transition-colors"
              >
                Order
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ADMIN TOOLS */}
      {isAdmin && (
        <div className="bg-red-900/20 p-6 rounded-xl border border-red-600">
          <h3 className="text-red-500 font-bold mb-2 text-center underline tracking-widest">ADMIN GOVERNANCE</h3>
          <div className="flex gap-2">
            <button onClick={sendMint} className="flex-1 bg-red-600 p-2 rounded text-xs font-bold shadow-lg">MINT $ANODE</button>
            <button onClick={sendAirdrop} className="flex-1 bg-orange-600 p-2 rounded text-xs font-bold shadow-lg">AIRDROP</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
