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
  
  // Input States
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
    executeAnodeP2P,
    executeAnodeStaking
  } = useMainContract(); 

  const connectedAddress = tonConnectUI?.account?.address;
  let isAdmin = false;

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
      setTxStatus("Please connect your wallet.");
      return;
    }
    setTxStatus(`Processing ${label}...`);
    action();
  };

  const marketplaceItems = [
    { id: 1, title: "Web3 DApp Architecture", price: "200" },
    { id: 2, title: "AI LLM & Machine Learning", price: "500" },
    { id: 3, title: "Smart Contract Security Audit", price: "300" },
    { id: 4, title: "Crypto Legal Compliance (Africa)", price: "150" },
    { id: 21, title: "UI/UX Design for Web3", price: "120" },
    { id: 22, title: "Rust/Solidity Consultation", price: "400" }
  ];

  if (!contract_address) {
    return <div className="p-10 text-center text-blue-400 bg-slate-950 min-h-screen font-bold">Initializing AFRO-NODE...</div>;
  }

  return (
    <div className="app-container p-4 bg-slate-950 min-h-screen text-white font-sans max-w-4xl mx-auto">
      
      {/* HEADER - FIXED LOGOS */}
      <div className="header flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-2xl border-b-4 border-blue-600 shadow-2xl">
        <div className="flex items-center gap-2">
            <img src="/afro-node-logo.png" alt="AFRO-NODE" className="h-10 w-10 object-contain" />
            <h1 className="text-xl font-black hidden sm:block">AFRO-NODE</h1>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <img src="/anode-token.png" alt="$ANODE" className="h-5 w-5" />
                <span className="text-xs font-bold text-yellow-500">{jetton_balance}</span>
            </div>
            <TonConnectButton />
        </div>
      </div>

      {txStatus && (
        <div className="mb-4 p-2 bg-blue-600/20 border border-blue-400 rounded-lg text-center animate-pulse">
          <p className="text-blue-300 font-bold text-xs italic">📡 {txStatus}</p>
        </div>
      )}

      {/* ECOSYSTEM GRID (SCREENSHOT REPLICATION) */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-600 aspect-square rounded-3xl flex flex-col items-center justify-center text-center p-4 shadow-lg border-2 border-blue-400">
           <span className="text-3xl mb-1">🌐</span>
           <h2 className="text-sm font-black leading-tight">Central<br/>Marketplace</h2>
        </div>

        <div className="bg-green-600 aspect-square rounded-3xl flex flex-col items-center justify-center text-center p-4 shadow-lg border-2 border-green-400">
           <span className="text-3xl mb-1">🔒</span>
           <h2 className="text-sm font-black leading-tight">Escrow<br/>Services +<br/>Calculator</h2>
        </div>

        <div className="bg-purple-600 aspect-square rounded-3xl flex flex-col items-center justify-center text-center p-4 shadow-lg border-2 border-purple-400">
           <span className="text-3xl mb-1">💡</span>
           <h2 className="text-sm font-black leading-tight">Innovation<br/>Hub DAO</h2>
        </div>

        <div className="bg-orange-500 aspect-square rounded-3xl flex flex-col items-center justify-center text-center p-4 shadow-lg border-2 border-orange-300">
           <span className="text-3xl mb-1">↔️</span>
           <h2 className="text-sm font-black leading-tight">P2P<br/>$ANODE<br/>Transfer</h2>
        </div>

        <div className="bg-pink-600 aspect-square rounded-3xl flex flex-col items-center justify-center text-center p-4 shadow-lg border-2 border-pink-400">
           <span className="text-3xl mb-1">🌱</span>
           <h2 className="text-sm font-black leading-tight">$ANODE<br/>Staking</h2>
        </div>

        <div className="bg-orange-600 aspect-square rounded-3xl flex flex-col items-center justify-center text-center p-4 shadow-lg border-2 border-orange-400">
           <span className="text-3xl mb-1">🗃️</span>
           <h2 className="text-sm font-black leading-tight">DAO Proposal:<br/>African Tech<br/>Talents</h2>
        </div>
      </div>

      {/* REMITTANCE LOGIC EXPLAINER */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 mb-6">
        <h3 className="text-yellow-500 font-black text-sm mb-3 underline">TREASURY REMITTANCE LOGIC</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] font-mono">
            <div className="p-2 bg-slate-950 rounded border border-green-900">
                <p className="text-green-500 font-bold uppercase mb-1">Escrow Deposits</p>
                <p>100% Service Fee + 10% Surcharge</p>
                <p className="mt-1 text-white">Total: 110% Remittance</p>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-purple-900">
                <p className="text-purple-500 font-bold uppercase mb-1">Hub Talent Jobs</p>
                <p>Vetted Tech Talents</p>
                <p className="mt-1 text-white">15% Treasury Deduction</p>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-blue-900">
                <p className="text-blue-500 font-bold uppercase mb-1">Marketplace Tasks</p>
                <p>Normal User/Enthusiast</p>
                <p className="mt-1 text-white">10% Treasury Deduction</p>
            </div>
        </div>
      </div>

      {/* UTILITY ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h4 className="text-pink-500 font-bold text-xs mb-3 flex items-center gap-2">🌱 $ANODE STAKING (TACT)</h4>
              <div className="flex gap-2">
                  <input type="number" placeholder="Amt" value={stakeAmount} onChange={(e)=>setStakeAmount(e.target.value)} className="bg-slate-950 border border-slate-700 p-2 rounded text-xs flex-1" />
                  <button onClick={() => handleProtectedAction(() => executeAnodeStaking(stakeAmount), "Staking")} className="bg-pink-600 px-4 rounded font-bold text-xs">STAKE</button>
              </div>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h4 className="text-orange-500 font-bold text-xs mb-3 flex items-center gap-2">↔️ P2P TRANSFER</h4>
              <input type="text" placeholder="Recipient..." value={p2pRecipient} onChange={(e)=>setP2pRecipient(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-xs mb-2" />
              <div className="flex gap-2">
                  <input type="number" placeholder="Amt" value={p2pAmount} onChange={(e)=>setP2pAmount(e.target.value)} className="w-1/3 bg-slate-950 border border-slate-700 p-2 rounded text-xs" />
                  <button onClick={() => handleProtectedAction(() => executeAnodeP2P(p2pRecipient, p2pAmount), "P2P")} className="flex-1 bg-orange-600 rounded font-bold text-xs text-white">SEND</button>
              </div>
          </div>
      </div>

      {/* QUICK DEMAND MARKETPLACE */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6">
          <h4 className="text-blue-500 font-bold text-xs mb-3">🌐 QUICK-DEMAND SERVICES (10% FEE)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {marketplaceItems.map(item => (
                  <div key={item.id} className="bg-slate-950 p-2 rounded flex justify-between items-center border border-slate-800">
                      <span className="text-[10px] font-bold">{item.title}</span>
                      <button onClick={() => handleProtectedAction(() => executeAnodePayment('marketplace'), item.title)} className="bg-blue-600 text-[9px] px-2 py-1 rounded font-black">ORDER</button>
                  </div>
              ))}
          </div>
      </div>

      {isAdmin && (
        <div className="bg-red-950/20 p-4 rounded-xl border border-red-600 mb-6">
          <h4 className="text-red-500 font-black text-center text-xs mb-3">ADMIN TOOLS</h4>
          <div className="flex gap-2">
            <button onClick={sendMint} className="flex-1 bg-red-600 py-2 rounded text-[10px] font-bold">MINT $ANODE</button>
            <button onClick={sendAirdrop} className="flex-1 bg-orange-700 py-2 rounded text-[10px] font-bold">AIRDROP</button>
          </div>
        </div>
      )}

      <footer className="text-center opacity-30 text-[8px] pb-10">
          <p>MASTER: {contract_address}</p>
          <p>DAO (FunC): {dao_address}</p>
      </footer>
    </div>
  );
}

export default App;
