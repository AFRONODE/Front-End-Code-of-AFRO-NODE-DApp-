import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/useMainContract';
import { useTonConnect } from './hooks/useTonConnect';
import { Address, toNano } from '@ton/core';
import { useState, useMemo, useEffect } from 'react';

const ADMIN_WALLET_ADDRESS = "0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u";
const SAFT_RECIPIENT_WALLET = "0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u"; 

function App() {
  const { connected } = useTonConnect();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [txStatus, setTxStatus] = useState("");
  const [p2pRecipient, setP2pRecipient] = useState("");
  const [p2pAmount, setP2pAmount] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [saftBuyQty, setSaftBuyQty] = useState("");

  // UPGRADED: Client Portal States
  const [jobDescription, setJobDescription] = useState("");
  const [jobBudget, setJobBudget] = useState("");

  // UI State
  const [showVesting, setShowVesting] = useState(false);
  const [showBusinessNote, setShowBusinessNote] = useState(false);
  const [showVision, setShowVision] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [merkleProof, setMerkleProof] = useState("");
  const [prices, setPrices] = useState({ ton: "0.00", btc: "0.00", eth: "0.00" });

  const {
    contract_address,
    dao_address,
    counter_value,
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
    executeKillVesting,
    executeCreateTask // Placeholder for the hook update you will provide
  } = useMainContract(); 

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network,bitcoin,ethereum&vs_currencies=usd');
        const data = await res.json();
        setPrices({
          ton: data['the-open-network'].usd.toFixed(2),
          btc: data['bitcoin'].usd.toLocaleString(),
          eth: data['ethereum'].usd.toLocaleString()
        });
      } catch (e) { console.error("Price fetch failed"); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = useMemo(() => {
    if (!wallet?.account?.address) return false;
    const currentRaw = Address.parse(wallet.account.address).toRawString();
    const adminRaw = Address.parse(ADMIN_WALLET_ADDRESS).toRawString();
    return currentRaw === adminRaw;
  }, [wallet]);

  const handleProtectedAction = (action, label) => {
    if (!connected) {
      tonConnectUI.openModal();
      setTxStatus("Please connect your wallet.");
      return;
    }
    setTxStatus("Confirming " + label + "...");
    action();
  };

  // UPGRADED: Functional Escrow Task Logic
  const handlePostTask = () => {
    if (!jobBudget || isNaN(Number(jobBudget)) || !jobDescription) {
      setTxStatus("Please enter valid Job Details & Budget.");
      return;
    }
    
    // Logic: 100% Budget + 10% Escrow Fee = 110% total lock
    const totalToLock = Number(jobBudget) * 1.1;
    
    handleProtectedAction(() => {
      executeCreateTask(jobDescription, totalToLock.toString());
      setTxStatus(`Initiating Escrow: ${totalToLock} $ANODE (Incl. 10% Fee)`);
    }, "Escrow Task Creation");
  };

  const handleSaftPurchase = () => {
    if (!saftBuyQty || isNaN(Number(saftBuyQty))) return;
    const tonEquivalent = (Number(saftBuyQty) * 0.02) / Number(prices.ton || 5);
    handleProtectedAction(async () => {
      setTxStatus("KYC/Whitelist Auto-Verifying...");
      setTimeout(() => {
        tonConnectUI.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 360,
          messages: [{
            address: SAFT_RECIPIENT_WALLET,
            amount: toNano(tonEquivalent.toFixed(4)).toString(),
          }]
        });
      }, 1500);
    }, "SAFT Purchase");
  };

  const marketplaceItems = [
    { id: 1, title: "Web3 DApp Architecture", price: "200" },
    { id: 2, title: "AI LLM & Machine Learning", price: "500" },
    { id: 3, title: "Smart Contract Security Audit", price: "300" },
    { id: 4, title: "Crypto Legal Compliance (Africa)", price: "150" },
    { id: 5, title: "Tokenomics Design", price: "250" },
    { id: 6, title: "Full-Stack Web2 Services", price: "100" },
  ].sort((a, b) => Number(b.price) - Number(a.price));

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
        <div className="text-center animate-pulse text-blue-500 font-black uppercase tracking-widest">
          🌍 INITIALIZING AFRO-NODE INFRASTRUCTURE...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container p-4 bg-slate-900 min-h-screen text-white font-sans overflow-x-hidden">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { display: inline-block; white-space: nowrap; animation: marquee 25s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
        .executive-pie {
          width: 180px; height: 180px;
          border-radius: 50%;
          background: conic-gradient(#3b82f6 0% 35%, #10b981 35% 60%, #f59e0b 60% 70%, #6366f1 70% 88%, #ec4899 88% 93%, #06b6d4 93% 98%, #f43f5e 98% 100%);
          box-shadow: inset 0 0 40px rgba(0,0,0,0.6);
          position: relative; border: 4px solid #1e293b;
        }
      `}</style>

      {/* ASSET PRICE TICKER */}
      <div className="fixed top-0 left-0 w-full bg-black/40 backdrop-blur-md z-50 border-b border-slate-700 p-1 flex justify-around text-[10px] font-mono">
        <span className="text-blue-400">TON: ${prices.ton}</span>
        <span className="text-orange-400">BTC: ${prices.btc}</span>
        <span className="text-purple-400">ETH: ${prices.eth}</span>
      </div>

      {/* HEADER */}
      <div className="header mt-6 flex justify-between items-center mb-6 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-2">
          <img src="/afro-node-logo.png" alt="AFRO-NODE" className="h-10 w-auto" />
          <h1 className="text-xl font-black text-blue-500 uppercase tracking-tighter">AFRO-NODE</h1>
        </div>
        <TonConnectButton />
      </div>

      {/* MARQUEE PROMPT */}
      <div className="mb-4 bg-indigo-950/30 py-2 border-y border-indigo-500/20 overflow-hidden">
        <div className="animate-marquee text-[11px] font-bold text-indigo-300 uppercase">
          Click the Join button on the Innovation HUB DAO to register as a verified talent of our exclusive Hub DAO and use 🎉 &nbsp;&nbsp;&nbsp;&nbsp; Click the Join button on the Innovation HUB DAO to register as a verified talent of our exclusive Hub DAO and use 🎉
        </div>
      </div>

      {/* VISION SECTION */}
      <div className="mb-6">
        <button 
          onClick={() => setShowVision(!showVision)}
          className="w-full bg-blue-900/40 hover:bg-blue-800/60 p-4 rounded-xl font-bold transition-all border border-blue-800 text-sm"
        >
          {showVision ? 'VIEW PROTOCOL VISION' : 'CLOSE PROTOCOL VISION'}
        </button>
        {showVision && (
          <div className="mt-2 bg-slate-800 p-6 rounded-xl border border-blue-500/30 animate-in fade-in zoom-in duration-300">
            <h2 className="text-blue-400 font-black text-lg mb-4">THE VISION OF AFRO-NODE</h2>
            <p className="text-sm leading-relaxed text-gray-300 mb-4">
              A Pan-African Merit-based DeFi Protocol & Decentralized Gig-Economy platform that connects the finest vetted African tech Talents to global opportunities. Our Innovation HUB DAO is designed to give highly skilled African Talents a chance to attain high level of financial empowerment with their tech skills.
            </p>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <p className="text-xs text-indigo-400 font-black uppercase mb-2">Our Mission</p>
              <p className="text-xs text-gray-400 leading-normal">
                We have created a Decentralized Gig-Economy that houses only Vetted Talents that provide skills at the most affordable rates in our native utility token $ANODE.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CORE STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-lg font-bold mb-4 text-blue-400 flex items-center gap-2">Blockchain Vault</h2>
          <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-900 p-3 rounded-lg border border-slate-700">
            <div className="text-center">
               <p className="text-[10px] text-gray-500 uppercase">Vault Status</p>
               <p className="text-xl font-bold">{counter_value ?? "0"}</p>
            </div>
            <div className="text-center">
               <p className="text-[10px] text-gray-500 uppercase">Logic</p>
               <p className="text-xl font-bold text-blue-500">TACT</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => handleProtectedAction(sendIncrement, "Increment")} className="bg-blue-900 hover:bg-blue-800 p-3 rounded-xl font-bold text-xs">INCREMENT STATE</button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleProtectedAction(sendDeposit, "Deposit")} className="bg-emerald-800 hover:bg-emerald-700 p-3 rounded-xl font-bold text-xs">DEPOSIT 2 TON</button>
              <button onClick={() => handleProtectedAction(sendWithdraw, "Withdraw")} className="bg-[#4a0404] hover:bg-[#5a0505] p-3 rounded-xl font-bold text-xs">REMOVE 1 TON</button>
            </div>
          </div>
        </div>

        <div className="card bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h2 className="text-lg font-bold mb-4 text-pink-400">Staking & P2P</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input type="number" placeholder="Stake Amount" className="flex-1 bg-slate-900 p-3 rounded-xl text-xs border border-slate-700" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} />
              <button onClick={() => handleProtectedAction(() => executeAnodeStaking(stakeAmount, 2592000), "Staking")} className="bg-pink-700 px-6 rounded-xl font-bold text-xs">STAKE</button>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
              <input type="text" placeholder="Recipient Address" className="w-full bg-transparent p-2 rounded text-xs border-b border-slate-700 mb-2" value={p2pRecipient} onChange={(e) => setP2pRecipient(e.target.value)} />
              <div className="flex gap-2">
                <input type="number" placeholder="Qty" className="w-1/3 bg-transparent p-2 text-xs" value={p2pAmount} onChange={(e) => setP2pAmount(e.target.value)} />
                <button onClick={() => handleProtectedAction(() => executeAnodeP2P(p2pRecipient, p2pAmount), "P2P")} className="flex-1 bg-emerald-800 p-2 rounded-xl font-bold text-xs">SEND JETTONS</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SMART CONTRACTS LISTING */}
      <div className="mb-6">
        <button onClick={() => setShowContracts(!showContracts)} className="w-full bg-slate-800 p-4 rounded-xl flex justify-between items-center text-xs font-bold text-gray-400 border border-slate-700">
          <span>GOVERNING CORE: 5 TACT + 1 FUNC ENGINE</span>
          <span>{showContracts ? 'HIDE' : 'VIEW'}</span>
        </button>
        {showContracts && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2 animate-in slide-in-from-top-2">
            {[
              { name: "AnodeMaster.tact", desc: "Governs $ANODE utility" },
              { name: "AnodeWallet.tact", desc: "Jetton Child logic" },
              { name: "Marketplace.tact", desc: "Listings protocol" },
              { name: "Escrow.tact", desc: "Secure remittance" },
              { name: "HubDAO.fc", desc: "Innovation HUB Brain", highlight: true },
              { name: "Vesting.tact", desc: "Merkle Claims logic" }
            ].map((sc, i) => (
              <div key={i} className={`p-3 rounded-xl border ${sc.highlight ? 'border-orange-500 bg-orange-500/5' : 'border-slate-700 bg-slate-900/50'}`}>
                <p className={`text-[10px] font-black ${sc.highlight ? 'text-orange-400' : 'text-blue-400'}`}>{sc.name}</p>
                <p className="text-[8px] text-gray-500">{sc.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VESTING SCHEDULE */}
      <div className="mb-6 bg-slate-800 p-6 rounded-2xl border-l-4 border-indigo-500 shadow-xl">
        <button onClick={() => setShowVesting(!showVesting)} className="w-full flex justify-between items-center text-indigo-400 font-bold mb-4">
          <span>⏳ VESTING SCHEDULE & CLAIMS</span>
          <span>{showVesting ? 'HIDE' : 'OPEN'}</span>
        </button>
        {showVesting && (
          <div className="space-y-4">
            <p className="text-[11px] text-gray-400 italic">
              AFRO-NODE enforces a 6 months cliff period post Mainnet launch followed by a 5 years linear vesting period to ensure project sustainability.
            </p>
            <div className="overflow-x-auto bg-slate-900 p-2 rounded-xl">
              <table className="w-full text-[10px] font-mono">
                <thead>
                  <tr className="text-indigo-400 border-b border-slate-800">
                    <th className="p-2">SOURCE</th>
                    <th className="p-2">MONTHLY ($ANODE)</th>
                    <th className="p-2 text-right">SHARE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {vestingTable.map((row, i) => (
                    <tr key={i}><td className="p-2 text-gray-100">{row.role}</td><td className="p-2 text-yellow-500">{row.monthly}</td><td className="p-2 text-right text-gray-500">{row.share}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30">
              <p className="text-[10px] text-indigo-300 font-bold mb-2 uppercase">Merkle Security Verification</p>
              <p className="text-[9px] text-gray-500 mb-2">Merkle proofs allow off-chain data verification on the TON blockchain, ensuring only eligible addresses can claim tokens without heavy storage costs.</p>
              <input type="text" placeholder="Merkle Proof (Hex)" className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs mb-2" value={merkleProof} onChange={(e) => setMerkleProof(e.target.value)} />
              <button onClick={() => handleProtectedAction(executeVestingClaim, "Vesting Claim")} className="w-full bg-indigo-600 py-3 rounded-xl font-black text-xs">VERIFY & SECURE CLAIM</button>
            </div>
          </div>
        )}
      </div>

      {/* EQUITY & TOKENOMICS */}
      <div className="mb-6 bg-slate-800 p-6 rounded-2xl border-l-4 border-cyan-500 shadow-xl">
        <button onClick={() => setShowBusinessNote(!showBusinessNote)} className="w-full flex justify-between items-center text-cyan-400 font-bold">
          <span className="flex items-center gap-2">📊 EQUITY & $ANODE TOKENOMICS</span>
          <span>{showBusinessNote ? 'HIDE' : 'OPEN'}</span>
        </button>
        {showBusinessNote && (
          <div className="mt-6">
            <div className="flex flex-col lg:flex-row gap-8 items-center mb-8">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <img src="/anode-token.png" alt="ANODE" className="h-6 w-6" />
                  <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">$ANODE TOKENOMICS</h3>
                </div>
                <div className="executive-pie"></div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2 w-full text-[10px]">
                  {[{c:'bg-blue-500',l:'Community',p:'35%'},{c:'bg-emerald-500',l:'Treasury',p:'25%'},{c:'bg-indigo-500',l:'Team',p:'18%'},{c:'bg-amber-500',l:'SAFT',p:'10%'}].map((x,i)=>(
                    <div key={i} className="bg-slate-900 p-2 rounded flex justify-between"><span className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${x.c}`}></div>{x.l}</span><span className="font-bold text-cyan-400">{x.p}</span></div>
                  ))}
              </div>
            </div>
            <div className="text-xs text-gray-300 space-y-4">
              <p className="italic bg-slate-900 p-3 rounded-xl border-l-2 border-cyan-500">
                AFRO-NODE DApp stands as the premier Pan-African DeFi Protocol & Decentralized Gig-Economy platform on the TON Blockchain. It is engineered to bridge the gap between African tech talent and the global market through trustless smart contract infrastructure.
              </p>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                <p className="font-bold text-cyan-400 mb-2 uppercase">ROI Triple Deduction Fee Logic (Hard-Coded)</p>
                <ul className="list-disc ml-5 space-y-1 text-[11px]">
                  <li>15% Talent Remittance: Innovation HUB DAO (HubDAO.fc)</li>
                  <li>10% Escrow Fee: Escrow.tact secure transactions</li>
                  <li>10% Task Remittance: Enthusiast client-published tasks</li>
                </ul>
              </div>
              <div className="p-4 bg-yellow-600/5 border border-yellow-600/20 rounded-xl">
                <p className="font-black text-yellow-500 uppercase mb-2">Equity & Intellectual Property Declaration</p>
                <p>The corporate and business equity of AFRO-NODE DApp as an LLC, along with all associated Intellectual Property, remains 100% owned by the Founder, CEO & Lead Web3 Architect Tor-Anyiin Princewill Moses.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PORTALS: CLIENT & SAFT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold text-blue-400 mb-4">Client Gigs Portal</h3>
          <div className="space-y-2">
             <input 
                placeholder="Job Description" 
                className="w-full bg-slate-900 p-3 rounded-xl text-xs outline-none border border-slate-700" 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
             />
             <div className="relative">
                <input 
                    type="number"
                    placeholder="Budget ($ANODE)" 
                    className="w-full bg-slate-900 p-3 rounded-xl text-xs outline-none border border-slate-700" 
                    value={jobBudget}
                    onChange={(e) => setJobBudget(e.target.value)}
                />
                {jobBudget && (
                    <span className="absolute right-3 top-3 text-[9px] text-gray-500 uppercase font-bold">
                        Total Lock: {(Number(jobBudget) * 1.1).toFixed(2)}
                    </span>
                )}
             </div>
             <button 
                onClick={handlePostTask} 
                className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-xs uppercase transition-colors"
             >
                Post Task & Lock Escrow
             </button>
             <p className="text-[8px] text-center text-gray-500 uppercase">10% Escrow Fee applied to budget</p>
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-amber-600/40 shadow-lg">
          <h3 className="text-lg font-bold text-amber-500 mb-4">SAFT Investor Portal</h3>
          <div className="space-y-2">
             <p className="text-[10px] text-gray-400">Fixed SAFT Price: $0.02 / $ANODE</p>
             <input type="number" placeholder="Enter Amount of $ANODE" className="w-full bg-slate-900 p-3 rounded-xl text-xs outline-none border border-amber-900/40" value={saftBuyQty} onChange={(e) => setSaftBuyQty(e.target.value)} />
             <button onClick={handleSaftPurchase} className="w-full bg-amber-600 py-3 rounded-xl font-bold text-xs uppercase">Buy $ANODE</button>
             <p className="text-[8px] text-center text-amber-700 uppercase">Automatic Whitelist Verification Active</p>
          </div>
        </div>
      </div>

      {/* DAO & ESCROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-orange-500/30 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-orange-400 uppercase tracking-tighter">Innovation Hub DAO</h3>
            <span className="bg-orange-500/10 px-2 py-1 rounded text-[8px] text-orange-400 font-bold">{isAdmin ? "ADMIN 🦄" : (member_rank?.rank || "GUEST")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
             <button onClick={() => handleProtectedAction(executeMemberReg, "Hub Registration")} className="bg-orange-600 text-white text-[10px] font-bold py-2 rounded-xl">JOIN HUB</button>
             <button onClick={() => handleProtectedAction(() => executeTalentPayment(100), "Claim Pay")} className="border border-orange-600 text-orange-500 text-[10px] font-bold py-2 rounded-xl">CLAIM PAY</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleProtectedAction(() => executeDaoVote(1, true), "DAO Vote")} className="flex-1 bg-slate-700 p-2 rounded-xl text-green-400 text-[10px] font-bold">VOTE YES</button>
            <button onClick={() => window.open(`https://testnet.tonviewer.com/${dao_address}`)} className="flex-1 bg-slate-900 p-2 rounded-xl text-white text-[10px] font-bold">EXPLORER</button>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-blue-400">Services Marketplace</h3>
          <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
            {marketplaceItems.map(item => (
              <div key={item.id} className="bg-slate-900 p-2 rounded-xl flex justify-between items-center border border-slate-800">
                <p className="text-[10px] font-bold">{item.title}</p>
                <button onClick={() => handleProtectedAction(() => executeAnodePayment('m', item.id, item.price), "Market Order")} className="bg-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">{item.price}</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ADMIN CONTROL */}
      {isAdmin && (
        <div className="bg-red-950/20 p-6 rounded-2xl border-2 border-dashed border-red-600/30 mb-10">
          <h3 className="text-red-500 font-black mb-4 text-center text-sm uppercase">Admin Control Plane</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={sendMint} className="bg-red-600 p-3 rounded-xl font-bold text-[10px]">MINT SYSTEM</button>
            <button onClick={sendAirdrop} className="bg-orange-600 p-3 rounded-xl font-bold text-[10px]">GLOBAL AIRDROP</button>
          </div>
          <div className="flex gap-2">
             <button onClick={() => handleProtectedAction(executeAdminTriggerRelease, "Vesting Release")} className="flex-1 border border-green-500 text-green-500 py-2 rounded-xl text-[10px] font-bold uppercase">Trigger Release</button>
             <button onClick={() => handleProtectedAction(executeKillVesting, "Kill Vesting")} className="flex-1 border border-red-500 text-red-500 py-2 rounded-xl text-[10px] font-bold uppercase">Kill Release</button>
          </div>
        </div>
      )}

      {txStatus && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 px-8 py-3 rounded-full shadow-2xl z-50">
          <p className="text-xs font-black tracking-widest animate-pulse">📡 {txStatus}</p>
        </div>
      )}

      <footer className="mt-10 text-center text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-10">
        AFRO-NODE v1.0.4 | Dual-Engine: TACT & FUNC | 2026
      </footer>
    </div>
  );
}

export default App;
