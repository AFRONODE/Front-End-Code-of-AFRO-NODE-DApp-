import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/useMainContract';
import { useTonConnect } from './hooks/useTonConnect';
import { Address, toNano } from '@ton/core';
import { useState, useMemo } from 'react';

const ADMIN_WALLET_ADDRESS = "0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u";

function App() {
  const { connected } = useTonConnect();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [txStatus, setTxStatus] = useState("");
  const [p2pRecipient, setP2pRecipient] = useState("");
  const [p2pAmount, setP2pAmount] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");

  // UI State for Arrays
  const [showVesting, setShowVesting] = useState(false);
  const [showBusinessNote, setShowBusinessNote] = useState(false);
  const [showVision, setShowVision] = useState(false);
  const [merkleProof, setMerkleProof] = useState("");
  const [vestingAllocation, setVestingAllocation] = useState("");

  const {
    contract_address,
    dao_address,
    counter_value,
    jetton_balance,
    member_rank,
    sendIncrement,
    sendDeposit,
    sendWithdraw,
    sendMint,
    sendAirdrop,
    executeAnodePayment,
    executeAnodeP2P,      
    executeAnodeStaking,
    executeDaoVote,          
    executeMemberReg,        
    executeTalentPayment,
    executeVestingClaim,
    executeAdminTriggerRelease,
    executeKillVesting
  } = useMainContract(); 

  const isAdmin = useMemo(() => {
    if (!wallet?.account?.address) return false;
    try {
      const currentRaw = Address.parse(wallet.account.address).toRawString();
      const adminRaw = Address.parse(ADMIN_WALLET_ADDRESS).toRawString();
      return currentRaw === adminRaw || member_rank?.rank?.includes("🦄");
    } catch (e) {
      return false;
    }
  }, [wallet, member_rank]);

  const handleProtectedAction = (action, label) => {
    if (!connected) {
      tonConnectUI.openModal();
      setTxStatus("Please connect your wallet.");
      return;
    }
    setTxStatus("Confirming " + label + "...");
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

  const vestingTable = [
    { role: "Founder & CEO", total: "104M", monthly: "1,733,333.33", share: "10.4%" },
    { role: "Advisor", total: "36M", monthly: "600,000.00", share: "3.6%" },
    { role: "Legal Lead", total: "18M", monthly: "300,000.00", share: "1.8%" },
    { role: "SAFT & Marketing", total: "14M", monthly: "233,333.33", share: "1.4%" },
    { role: "Ambassadors Lead", total: "12M", monthly: "200,000.00", share: "1.2%" },
  ];

  if (!contract_address) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center animate-bounce text-blue-400 font-bold uppercase">
          🌍 Initializing AFRO-NODE Infrastructure...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container p-4 bg-slate-900 min-h-screen text-white font-sans">
      <style>{`
        @keyframes rollIn {
          from { transform: rotate(-120deg) scale(0.5); opacity: 0; }
          to { transform: rotate(0deg) scale(1); opacity: 1; }
        }
        .executive-pie {
          width: 180px; height: 180px;
          border-radius: 50%;
          background: conic-gradient(
            #3b82f6 0% 35%,       /* Community 35% */
            #10b981 35% 60%,     /* Ecosystem 25% */
            #f59e0b 60% 70%,     /* SAFT 10% */
            #6366f1 70% 88%,     /* Team 18% */
            #ec4899 88% 93%,     /* KOLs 5% */
            #06b6d4 93% 98%,     /* Liquidity 5% */
            #f43f5e 98% 100%     /* IDO 2% */
          );
          box-shadow: inset 0 0 40px rgba(0,0,0,0.6), 0 0 20px rgba(59, 130, 246, 0.3);
          animation: rollIn 1.2s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          border: 4px solid #1e293b;
        }
        .executive-pie::after {
          content: '1B';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: #0f172a;
          width: 60px; height: 60px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; color: #60a5fa; font-size: 14px;
        }
      `}</style>

      {/* HEADER */}
      <div className="header flex justify-between items-center mb-6 bg-slate-800 p-4 rounded-lg shadow-lg border-b-2 border-blue-500">
        <div className="flex items-center gap-2">
          <img src="/afro-node-logo.png" alt="AFRO-NODE" className="h-10 w-auto" />
          <div className="h-8 w-[1px] bg-slate-700 mx-2"></div>
          <img src="/anode-token.png" alt="Token" className="h-8 w-8" />
          <h1 className="text-xl font-black text-blue-400 uppercase tracking-tighter">AFRO-NODE</h1>
        </div>
        <div className="flex items-center gap-4">
          <TonConnectButton />
        </div>
      </div>

      {txStatus && (
        <div className="mb-4 p-3 bg-blue-600/20 border border-blue-400 rounded-lg text-center">
          <p className="text-blue-300 font-bold text-sm">📡 {txStatus}</p>
        </div>
      )}

      {/* VISION BUTTON (NEW) */}
      <div className="mb-6">
        <button 
          onClick={() => setShowVision(!showVision)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-xl font-black text-center shadow-xl hover:scale-[1.01] transition-all border border-blue-400"
        >
          {showVision ? 'CLOSE PROTOCOL VISION' : '👁️ VIEW AFRO-NODE VISION & MISSION'}
        </button>
        {showVision && (
          <div className="mt-2 bg-slate-800 border-2 border-blue-500 p-6 rounded-xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-blue-400 font-black text-xl mb-4 underline">THE VISION OF AFRO-NODE</h2>
            <p className="text-sm leading-relaxed text-gray-200 italic mb-4">
              "A Pan-African Merit-based DeFi Protocol & Decentralized Gig-Economy platform that connects the finest vetted African tech Talents to global opportunities. Our Innovation HUB DAO is designed to give highly skilled African Talents a chance to attain high level of financial empowerment with their tech skills."
            </p>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mb-2">Our Mission:</p>
              <p className="text-xs text-gray-300 leading-normal">
                We have created a Decentralized Gig-Economy that houses only Vetted Talents that provide skills at the most affordable rates in our native utility token $ANODE.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2"><span>🏦</span> Blockchain Vault</h2>
          <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-900 p-3 rounded-lg border border-slate-700">
            <div className="text-center border-r border-slate-700">
               <p className="text-xs text-gray-400 uppercase">Vault Status</p>
               <p className="text-xl font-bold">{counter_value ?? "..."}</p>
            </div>
            <div className="text-center">
               <p className="text-xs text-gray-400 uppercase">Logic</p>
               <p className="text-xl font-bold text-blue-500">TACT</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => handleProtectedAction(sendIncrement, "Increment")} className="bg-blue-600 p-2 rounded font-bold hover:bg-blue-500">➕ Increment State</button>
            <button onClick={() => handleProtectedAction(sendDeposit, "Deposit")} className="bg-green-600 p-2 rounded font-bold hover:bg-green-500">📥 Deposit 2 TON</button>
            <button onClick={() => handleProtectedAction(sendWithdraw, "Withdraw")} className="bg-red-600 p-2 rounded font-bold hover:bg-red-500">📤 Withdraw 1 TON</button>
          </div>
        </div>

        <div className="card bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-pink-400 flex items-center gap-2"><span>🌱</span> Staking & P2P</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input type="number" placeholder="Stake Amount" className="flex-1 bg-slate-900 p-2 rounded text-sm border border-slate-700" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} />
              <button onClick={() => handleProtectedAction(() => executeAnodeStaking(stakeAmount, 2592000), "Staking")} className="bg-pink-600 px-4 py-2 rounded font-bold text-xs hover:bg-pink-500">STAKE</button>
            </div>
            <div className="border-t border-slate-700 pt-4">
              <input type="text" placeholder="Recipient Address" className="w-full bg-slate-900 p-2 rounded text-sm border border-slate-700 mb-2" value={p2pRecipient} onChange={(e) => setP2pRecipient(e.target.value)} />
              <div className="flex gap-2">
                <input type="number" placeholder="Qty" className="w-1/3 bg-slate-900 p-2 rounded text-sm" value={p2pAmount} onChange={(e) => setP2pAmount(e.target.value)} />
                <button onClick={() => handleProtectedAction(() => executeAnodeP2P(p2pRecipient, p2pAmount), "P2P")} className="flex-1 bg-orange-600 py-2 rounded font-bold text-xs hover:bg-orange-500">SEND JETTONS</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TACT & FUNC SMART CONTRACT LISTING (NEW) */}
      <div className="mb-6 bg-slate-800 p-5 rounded-xl border border-slate-700">
        <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Governing Core: 5 Tact + 1 FunC Engine</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: "Anodemaster.tact", desc: "Governs $ANODE native utility token" },
            { name: "Anodewallet.tact", desc: "Child contract: store/send/stake Jettons" },
            { name: "Marketplace.tact", desc: "Governs product/service listings" },
            { name: "Escrow.tact", desc: "Secure payments, disputes & remittance" },
            { name: "HubDAO.fc", desc: "Brain of Protocol (Innovation HUB DAO)", highlight: true },
            { name: "Vesting.tact", desc: "Merkle Proof Vesting & Claims" }
          ].map((sc, i) => (
            <div key={i} className={`p-3 rounded border ${sc.highlight ? 'border-orange-500 bg-orange-500/5' : 'border-slate-700 bg-slate-900/50'}`}>
              <p className={`text-[10px] font-black ${sc.highlight ? 'text-orange-400' : 'text-blue-400'}`}>{sc.name}</p>
              <p className="text-[9px] text-gray-400 leading-tight">{sc.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TOGGLES FOR VESTING & BUSINESS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button onClick={() => setShowVesting(!showVesting)} className="bg-indigo-900/40 border border-indigo-500 p-4 rounded-xl flex items-center justify-between hover:bg-indigo-800 transition-all">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div className="text-left">
              <p className="font-bold text-indigo-300 text-sm">Vesting Schedule & Claim</p>
              <p className="text-[9px] text-indigo-400/70 uppercase">Off-Chain Merkle Verification</p>
            </div>
          </div>
          <span className="text-indigo-500 text-xs">{showVesting ? 'HIDE' : 'OPEN'}</span>
        </button>

        <button onClick={() => setShowBusinessNote(!showBusinessNote)} className="bg-cyan-900/40 border border-cyan-500 p-4 rounded-xl flex items-center justify-between hover:bg-cyan-800 transition-all">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div className="text-left">
              <p className="font-bold text-cyan-300 text-sm uppercase">Equity & Tokenomics</p>
              <p className="text-[9px] text-cyan-400/70 uppercase">ROI & Triple Remittance</p>
            </div>
          </div>
          <span className="text-cyan-500 text-xs">{showBusinessNote ? 'HIDE' : 'OPEN'}</span>
        </button>
      </div>

      {/* VESTING PANEL */}
      {showVesting && (
        <div className="mb-6 bg-slate-800 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-2xl animate-in slide-in-from-top duration-300">
          <h3 className="text-lg font-black text-indigo-400 mb-2 uppercase tracking-tighter underline">💎 $ANODE Token Vesting Framework</h3>
          <div className="overflow-x-auto mb-6 bg-slate-900 p-2 rounded-lg border border-slate-700">
            <table className="w-full text-left text-[10px] font-mono">
              <thead>
                <tr className="text-indigo-400 border-b border-indigo-900/50">
                  <th className="p-2">ALLOCATION SOURCE</th>
                  <th className="p-2">TOTAL ($ANODE)</th>
                  <th className="p-2 text-right">SHARE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {vestingTable.map((row, i) => (
                  <tr key={i} className="hover:bg-indigo-900/10">
                    <td className="p-2 font-bold text-gray-100">{row.role}</td>
                    <td className="p-2 text-yellow-500">{row.total}</td>
                    <td className="p-2 text-right text-gray-400">{row.share}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-indigo-500/30">
            <input type="text" placeholder="Merkle Proof (Hex Cell)" className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs mb-3" value={merkleProof} onChange={(e) => setMerkleProof(e.target.value)} />
            <button onClick={() => handleProtectedAction(() => executeVestingClaim(vestingAllocation, merkleProof), "Vesting Claim")} className="w-full bg-indigo-600 py-3 rounded font-black text-xs uppercase shadow-lg">Verify Proof & Secure Claim</button>
          </div>
        </div>
      )}

      {/* TOKENOMICS & EQUITY (FIXED PER REQUIREMENTS) */}
      {showBusinessNote && (
        <div className="mb-6 bg-slate-800 border-l-4 border-cyan-500 p-6 rounded-r-xl shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start mb-8">
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest">ANODE Supply Architecture</h3>
              <div className="executive-pie"></div>
              <p className="text-lg font-black text-white">1,000,000,000 $ANODE</p>
            </div>
            <div className="flex-1 space-y-2 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { color: 'bg-blue-500', label: 'Community', pc: '35%', qty: '350M' },
                  { color: 'bg-emerald-500', label: 'Ecosystem & Treasury', pc: '25%', qty: '250M' },
                  { color: 'bg-indigo-500', label: 'Team & Advisor', pc: '18%', qty: '180M' },
                  { color: 'bg-amber-500', label: 'Private SAFT', pc: '10%', qty: '100M' },
                  { color: 'bg-pink-500', label: 'KOLs & Marketing', pc: '5%', qty: '50M' },
                  { color: 'bg-cyan-500', label: 'DEX Liquidity', pc: '5%', qty: '50M' },
                  { color: 'bg-rose-500', label: 'Public IDO', pc: '2%', qty: '20M' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700 text-[10px]">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                      <span className="font-bold text-gray-200">{item.label}</span>
                    </div>
                    <span className="font-mono text-cyan-400">{item.pc}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-cyan-950/20 p-6 rounded-lg border border-cyan-900/50">
            <h3 className="text-lg font-black text-cyan-400 mb-4 uppercase underline underline-offset-4">Declaration of Business & Equity</h3>
            <div className="space-y-4 text-xs leading-relaxed text-gray-300">
              <p className="italic bg-slate-900 p-3 rounded border-l-2 border-cyan-500">
                "AFRO-NODE DApp stands as the premier **Pan-African DeFi Protocol & Decentralized Gig-Economy platform on the TON Blockchain**. It is engineered to bridge the gap between African tech talent and the global market through trustless smart contract infrastructure."
              </p>
              
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <p className="font-bold text-cyan-400 mb-2 uppercase tracking-tighter">ROI Triple Deduction Fee Logic (Hard-Coded):</p>
                <ul className="list-disc ml-5 space-y-2 text-[11px]">
                  <li><span className="text-white font-bold">15% Talent Remittance:</span> Deducted from gig payments within the exclusive <b>Innovation HUB DAO (HubDAO.fc)</b>.</li>
                  <li><span className="text-white font-bold">10% Escrow Fee:</span> Separate from the service fee, governed by <b>Escrow.tact</b> for secure transactions.</li>
                  <li><span className="text-white font-bold">10% Task Remittance:</span> Deducted from general enthusiast payments executing client-published tasks (smaller gigs).</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950 rounded border border-yellow-600/30">
                <p className="font-black text-yellow-500 uppercase mb-2">Equity & Intellectual Property Declaration:</p>
                <p>
                  The corporate and business equity of AFRO-NODE DApp as an LLC, along with all associated Intellectual Property, remains **100% owned by the Founder, CEO & Lead Web3 Architect Tor-Anyiin Princewill Moses**. While the $ANODE token serves as the financial vehicle for the ecosystem, the underlying infrastructure and revenue-generating models are retained by the Founder.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DAO & ESCROW PROTOCOLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-2 text-purple-400">Escrow Protocol 🔒</h2>
          <p className="text-[10px] text-gray-400 mb-4 italic">* Governing: Escrow.tact | 10% Protocol Fee Apply.</p>
          <button onClick={() => handleProtectedAction(() => executeAnodePayment('escrow', 0, "100"), "Escrow")} className="w-full bg-purple-600 p-3 rounded font-bold hover:bg-purple-500">INITIATE SECURE CONTRACT</button>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-orange-500/50 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-orange-400">Innovation Hub DAO 💡</h3>
            <div className="text-right">
                <p className="text-[8px] text-gray-400 uppercase">Skill: {isAdmin ? 999 : (member_rank?.score || 0)}</p>
                <p className="text-[10px] font-bold text-white uppercase">{isAdmin ? "Admin/Owner 🦄" : (member_rank?.rank || "Guest")}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mb-4 italic">* Talent Rule: 15% Remittance via HubDAO.fc.</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
             <button onClick={() => handleProtectedAction(executeMemberReg, "Registration")} className="bg-orange-600/10 border border-orange-600 text-orange-500 text-[10px] font-bold py-2 rounded uppercase">Join Hub</button>
             <button onClick={() => handleProtectedAction(() => executeTalentPayment(100), "Remittance")} className="bg-orange-600 text-white text-[10px] font-bold py-2 rounded uppercase shadow-md active:scale-95">Claim Pay</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleProtectedAction(() => executeDaoVote(1, true), "Voting")} className="flex-1 bg-slate-700 p-2 rounded border border-green-500/50 text-green-400 text-[10px] font-bold">VOTE YES</button>
            <button onClick={() => window.open(`https://testnet.tonviewer.com/${dao_address}`)} className="flex-1 bg-slate-700 p-2 rounded border border-orange-500 text-white text-[10px] font-bold">EXPLORER</button>
          </div>
        </div>
      </div>

      {/* MARKETPLACE */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg mb-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4 text-blue-400">Services Marketplace ($ANODE)</h3>
        <p className="text-[10px] text-gray-400 mb-4 italic">* Enthusiast Remittance: 10% governed by Marketplace.tact.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {marketplaceItems.map(item => (
            <div key={item.id} className="p-4 bg-slate-900 rounded-lg flex justify-between items-center border border-slate-800 hover:border-blue-500 transition-colors">
              <div>
                <p className="font-bold text-sm text-gray-100">{item.title}</p>
                <p className="text-xs text-yellow-500 font-mono">{item.price} $ANODE</p>
              </div>
              <button onClick={() => handleProtectedAction(() => executeAnodePayment('marketplace', item.id, item.price), item.title)} className="bg-blue-500 text-[10px] px-4 py-2 rounded font-black hover:bg-blue-400 uppercase">ORDER NOW</button>
            </div>
          ))}
        </div>
      </div>

      {/* ADMIN CONTROL PLANE */}
      {isAdmin && (
        <div className="bg-red-900/10 p-6 rounded-xl border-2 border-dashed border-red-600/50">
          <h3 className="text-red-500 font-black mb-4 text-center text-sm uppercase tracking-widest underline decoration-red-900">Admin Control Plane</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button onClick={sendMint} className="flex-1 bg-red-600 p-3 rounded font-bold hover:bg-red-500 text-xs">MINT SYSTEM TOKENS</button>
            <button onClick={sendAirdrop} className="flex-1 bg-orange-600 p-3 rounded font-bold hover:bg-orange-500 text-xs">TRIGGER GLOBAL AIRDROP</button>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-red-900/30">
             <p className="text-[9px] text-red-400 font-black mb-3 uppercase text-center tracking-tighter">Vesting Protocol Governance (Vesting.tact)</p>
             <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleProtectedAction(executeAdminTriggerRelease, "Vesting Release")} className="flex-1 bg-green-900/40 border border-green-500 text-green-500 p-3 rounded font-black text-[10px] hover:bg-green-800/40 uppercase">Trigger Release</button>
                <button onClick={() => handleProtectedAction(executeKillVesting, "Kill Release")} className="flex-1 bg-red-900/40 border border-red-500 text-red-500 p-3 rounded font-black text-[10px] hover:bg-red-800/40 uppercase">Kill Vesting</button>
             </div>
          </div>
        </div>
      )}

      <footer className="mt-10 text-center text-[10px] text-gray-500 font-mono uppercase tracking-widest">
        AFRO-NODE v1.0.4 | Dual-Engine: TACT & FUNC | 2026
      </footer>
    </div>
  );
}

export default App;
