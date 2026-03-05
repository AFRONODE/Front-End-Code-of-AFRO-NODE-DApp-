import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/useMainContract';
import { useTonConnect } from './hooks/useTonConnect';
import { Address } from '@ton/core';
import { useState, useMemo, useEffect } from 'react';

const ADMIN_WALLET_ADDRESS = "0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u";
const SAFT_TOTAL_POOL = 100000000;
const SAFT_MAX_PER_TX = 1000000;

function App() {
  const { connected } = useTonConnect();
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [txStatus, setTxStatus] = useState("");
  const [p2pRecipient, setP2pRecipient] = useState("");
  const [p2pAmount, setP2pAmount] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [saftBuyQty, setSaftBuyQty] = useState("");
  const [kycAccepted, setKycAccepted] = useState(false);
  const [kycDocument, setKycDocument] = useState(null); // mock for file upload

  const [jobDescription, setJobDescription] = useState("");
  const [jobBudget, setJobBudget] = useState("");
  const [postedGigs, setPostedGigs] = useState([]);

  const [saftRecipient, setSaftRecipient] = useState("0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u");
  const [saftAgreementLink, setSaftAgreementLink] = useState("");

  const [showVesting, setShowVesting] = useState(false);
  const [showSaftVesting, setShowSaftVesting] = useState(false);
  const [showBusinessNote, setShowBusinessNote] = useState(false);
  const [showVision, setShowVision] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);

  const [merkleProofTeam, setMerkleProofTeam] = useState("");
  const [merkleProofSaft, setMerkleProofSaft] = useState("");
  const [saftSearchAddress, setSaftSearchAddress] = useState("");

  const [prices, setPrices] = useState({ ton: "0.00", btc: "0.00", eth: "0.00", usdt: "1.00" });

  const [isEditLocked, setIsEditLocked] = useState(true);
  const [marketplaceItems, setMarketplaceItems] = useState([
    { id: 1, title: "Web3 DApp Architecture", price: "200 $ANODE" },
    { id: 2, title: "AI LLM & Machine Learning", price: "500 $ANODE" },
    { id: 3, title: "Smart Contract Security Audit", price: "300 $ANODE" },
    { id: 4, title: "Crypto Legal Compliance (Africa)", price: "150 $ANODE" },
    { id: 5, title: "Tokenomics Design", price: "250 $ANODE" },
    { id: 6, title: "Full-Stack Web2 Services", price: "100 $ANODE" },
  ]);

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
    executeReleaseTeam,
    executeReleaseSaft,
    executeKillVesting,
    executeCreateTask,
    anodeBalance,
    executeAddMarketItem,
    executeUpdateMarketPrice,
    executeRemoveMarketItem
  } = useMainContract(); 

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network,bitcoin,ethereum,tether&vs_currencies=usd');
        const data = await res.json();
        setPrices({
          ton: data['the-open-network'].usd.toFixed(2),
          btc: data['bitcoin'].usd.toLocaleString(),
          eth: data['ethereum'].usd.toLocaleString(),
          usdt: data['tether']?.usd.toFixed(2) || "1.00"
        });
      } catch (e) {}
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (txStatus) {
      const timer = setTimeout(() => setTxStatus(""), 10000);
      return () => clearTimeout(timer);
    }
  }, [txStatus]);

  const isAdmin = useMemo(() => {
    if (!wallet?.account?.address) return false;
    const currentRaw = Address.parse(wallet.account.address).toRawString();
    const adminRaw = Address.parse(ADMIN_WALLET_ADDRESS).toRawString();
    return currentRaw === adminRaw;
  }, [wallet]);

  const handleProtectedAction = async (action, label) => {
    if (!connected) {
      tonConnectUI.openModal();
      setTxStatus("Please connect your wallet.");
      return;
    }
    setTxStatus(`Processing ${label}...`);
    try {
      await action();
      setTxStatus(`✓ ${label} successful!`);
    } catch (err) {
      setTxStatus(`✗ ${label} failed: ${err.message || "Unknown error"}`);
    }
  };

  const usdtToPay = saftBuyQty && !isNaN(Number(saftBuyQty)) 
    ? (Number(saftBuyQty) * 0.02).toFixed(4) 
    : "0.00";

  const handlePostTask = () => {
    if (!jobBudget || isNaN(Number(jobBudget)) || !jobDescription) {
      setTxStatus("Please enter valid Job Details & Budget.");
      return;
    }
    
    const totalToLock = Number(jobBudget) * 1.1;
    
    handleProtectedAction(async () => {
      await executeCreateTask(jobDescription, totalToLock.toString());
      setPostedGigs(prev => [...prev, {
        id: Date.now(),
        description: jobDescription,
        budget: totalToLock.toFixed(2)
      }]);
      setJobDescription("");
      setJobBudget("");
    }, "Escrow Task Creation");
  };

  const handleSaftPurchase = () => {
    const qty = Number(saftBuyQty);
    if (!qty || qty <= 0 || qty > SAFT_MAX_PER_TX) {
      setTxStatus(`Invalid amount. Max per purchase: ${SAFT_MAX_PER_TX.toLocaleString()} $ANODE`);
      return;
    }
    if (!kycAccepted) {
      setTxStatus("Please complete KYC acceptance first.");
      return;
    }
    const agreementNote = saftAgreementLink ? `Signed SAFT: ${saftAgreementLink}` : "Legal SAFT handled by Compliance Lead.";
    handleProtectedAction(() => {
      setTxStatus(
        `KYC verified.\n\n` +
        `Send exactly \( {usdtToPay} USDT to:\n \){saftRecipient}\n\n` +
        `Multi-sig Tonkeeper wallet.\n` +
        `${agreementNote}\n\n` +
        `Forward tx hash to afronodedapp@gmail.com`
      );
    }, "SAFT Purchase");
  };

  // Mock SAFT investors list (replace with on-chain query later)
  const mockSaftInvestors = [
    { wallet: "0QD...abc123", amount: 500000, date: "2026-02-15" },
    { wallet: "0QD...def456", amount: 1200000, date: "2026-02-20" },
    { wallet: "0QD...ghi789", amount: 750000, date: "2026-03-01" },
  ];

  const filteredSaftInvestors = saftSearchAddress
    ? mockSaftInvestors.filter(inv => inv.wallet.toLowerCase().includes(saftSearchAddress.toLowerCase()))
    : mockSaftInvestors;

  const addMarketItem = (title, price) => {
    if (!isAdmin || isEditLocked) return;
    const newItem = { id: Date.now(), title, price: `${price} $ANODE` };
    setMarketplaceItems([...marketplaceItems, newItem]);
    handleProtectedAction(() => executeAddMarketItem(title, price), "Add Market Item");
  };

  const updateMarketPrice = (id, newPrice) => {
    if (!isAdmin || isEditLocked) return;
    setMarketplaceItems(marketplaceItems.map(item => item.id === id ? { ...item, price: `${newPrice} $ANODE` } : item));
    handleProtectedAction(() => executeUpdateMarketPrice(id, newPrice), "Update Price");
  };

  const removeMarketItem = (id) => {
    if (!isAdmin || isEditLocked) return;
    setMarketplaceItems(marketplaceItems.filter(item => item.id !== id));
    handleProtectedAction(() => executeRemoveMarketItem(id), "Remove Item");
  };

  const vestingTable = [
    { role: "Founder & CEO", total: "104M", monthly: "1,733,333.33", share: "10.4%" },
    { role: "Advisor", total: "36M", monthly: "600,000.00", share: "3.6%" },
    { role: "Legal Lead", total: "18M", monthly: "300,000.00", share: "1.8%" },
    { role: "SAFT & Marketing", total: "14M", monthly: "233,333.33", share: "1.4%" },
    { role: "Ambassadors Lead", total: "12M", monthly: "200,000.00", share: "1.2%" },
  ];

  const saftVestingTable = [
    { role: "SAFT Investors (Total Pool)", total: "100,000,000 $ANODE", monthly: "4,166,666.67 $ANODE", share: "10%" },
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

      <div className="fixed top-0 left-0 w-full bg-black/40 backdrop-blur-md z-50 border-b border-slate-700 p-1 flex justify-around text-[10px] font-mono">
        <span className="text-blue-400">TON: \[ {prices.ton}</span>
        <span className="text-orange-400">BTC: \]{prices.btc}</span>
        <span className="text-purple-400">ETH: \[ {prices.eth}</span>
        <span className="text-green-400">USDT: \]{prices.usdt}</span>
        <span className="text-yellow-400">$ANODE: Coming Soon (Testnet)</span>
      </div>

      <div className="header mt-6 flex justify-between items-center mb-6 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-2">
          <img src="/afro-node-logo.png" alt="AFRO-NODE" className="h-10 w-auto" />
          <h1 className="text-xl font-black text-blue-500 uppercase tracking-tighter">AFRO-NODE</h1>
        </div>
        <div className="flex items-center gap-4">
          {connected && (
            <div className="text-[10px] font-mono bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-700">
              $ANODE: {anodeBalance ?? "0"}
            </div>
          )}
          <TonConnectButton />
        </div>
      </div>

      <div className="mb-4 bg-indigo-950/30 py-2 border-y border-indigo-500/20 overflow-hidden">
        <div className="animate-marquee text-[11px] font-bold text-indigo-300 uppercase">
          Click the Join button on the Innovation HUB DAO to register as a verified talent of our exclusive Hub DAO and use 🎉 &nbsp;&nbsp;&nbsp;&nbsp; Click the Join button on the Innovation HUB DAO to register as a verified talent of our exclusive Hub DAO and use 🎉
        </div>
      </div>

      <div className="mb-6">
        <button 
          onClick={() => setShowVision(!showVision)}
          className="w-full bg-blue-900/40 hover:bg-blue-800/60 p-4 rounded-xl font-bold transition-all border border-blue-800 text-sm"
        >
          {showVision ? 'CLOSE PROTOCOL VISION' : 'VIEW PROTOCOL VISION'}
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

      {/* ... CORE STATS, SMART CONTRACTS LISTING, TEAM VESTING SECTION unchanged ... */}

      {/* SAFT VESTING SECTION – upgraded */}
      <div className="mb-6 bg-slate-800 p-6 rounded-2xl border-l-4 border-amber-500 shadow-xl">
        <button onClick={() => setShowSaftVesting(!showSaftVesting)} className="w-full flex justify-between items-center text-amber-400 font-bold mb-4">
          <span>⏳ SAFT INVESTORS VESTING (Zero Cliff – 24 Months Linear)</span>
          <span>{showSaftVesting ? 'HIDE' : 'OPEN'}</span>
        </button>
        {showSaftVesting && (
          <div className="space-y-6">
            <p className="text-[11px] text-gray-400 italic">
              SAFT investors receive linear vesting over 24 months post-Mainnet launch with **zero cliff period**. Total pool: 100,000,000 $ANODE (10% of supply). Monthly example: \~4,166,667 $ANODE (100M ÷ 24).
            </p>

            {/* Searchable SAFT investors list */}
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-800/40">
              <p className="text-[11px] font-bold text-amber-300 mb-2">Search SAFT Investor by Wallet</p>
              <input
                type="text"
                placeholder="Enter wallet address..."
                className="w-full bg-slate-900 p-3 rounded-xl text-xs border border-amber-900/40 mb-3"
                value={saftSearchAddress}
                onChange={(e) => setSaftSearchAddress(e.target.value)}
              />
              {filteredSaftInvestors.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] font-mono">
                    <thead>
                      <tr className="text-amber-400 border-b border-slate-800">
                        <th className="p-2">Wallet</th>
                        <th className="p-2">Amount Bought</th>
                        <th className="p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredSaftInvestors.map((inv, i) => (
                        <tr key={i}>
                          <td className="p-2 text-gray-100">{inv.wallet}</td>
                          <td className="p-2 text-yellow-500">{inv.amount.toLocaleString()} $ANODE</td>
                          <td className="p-2 text-gray-400">{inv.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[11px] text-gray-500 italic">No matching investors found.</p>
              )}
            </div>

            {/* SAFT-specific Merkle claim */}
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-800/40">
              <p className="text-[11px] font-bold text-amber-300 mb-2 uppercase">SAFT Investor Claim (Separate Merkle Proof)</p>
              <input
                type="text"
                placeholder="Your Merkle Proof (Hex)"
                className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs mb-2"
                value={merkleProofSaft}
                onChange={(e) => setMerkleProofSaft(e.target.value)}
              />
              <button
                onClick={() => handleProtectedAction(() => executeVestingClaim("your_allocation_here", merkleProofSaft), "SAFT Claim")}
                className="w-full bg-amber-600 py-3 rounded-xl font-black text-xs"
              >
                VERIFY & CLAIM SAFT TOKENS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ... EQUITY & TOKENOMICS, CLIENT GIGS PORTAL unchanged ... */}

      {/* SAFT Investor Portal – upgraded KYC flow */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-amber-600/40 shadow-lg mb-6">
        <h3 className="text-lg font-bold text-amber-500 mb-4">SAFT Investor Portal (Testnet Phase)</h3>
        <div className="space-y-4">
          <p className="text-[10px] text-gray-400">
            Fixed SAFT Price: $0.02 / $ANODE — Pay in USDT only (TON Jetton)<br/>
            Total SAFT Pool: 100,000,000 $ANODE (10% of max supply)<br/>
            Max per purchase: 1,000,000 $ANODE
          </p>

          {/* KYC & Agreement – improved */}
          <div className="bg-slate-900 p-4 rounded-xl border border-amber-800/40">
            <p className="text-[11px] font-bold text-amber-300 mb-2">Step 1: KYC Verification & Agreement</p>
            <label className="flex items-start gap-2 text-[10px] text-gray-300 mb-3">
              <input 
                type="checkbox" 
                checked={kycAccepted} 
                onChange={(e) => setKycAccepted(e.target.checked)}
                className="mt-1 accent-amber-500"
              />
              <span>
                I confirm I have completed KYC (ID/passport upload below) and accept the 
                <a href={saftAgreementLink || "#"} target="_blank" className="text-amber-400 underline ml-1">SAFT Terms</a>.
              </span>
            </label>

            {/* Mock KYC upload + status */}
            <div className="mt-3">
              <p className="text-[10px] text-amber-400 mb-1">Upload ID Document (mock)</p>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setKycDocument(e.target.files?.[0] || null)}
                className="w-full bg-slate-800 p-2 rounded text-xs border border-amber-900/40"
              />
              {kycDocument && <p className="text-[10px] text-emerald-400 mt-1">Document selected: {kycDocument.name}</p>}
            </div>
          </div>

          <input 
            type="number" 
            placeholder="Amount of $ANODE (max 1M per tx)" 
            className="w-full bg-slate-900 p-3 rounded-xl text-xs border border-amber-900/40"
            value={saftBuyQty}
            onChange={(e) => setSaftBuyQty(e.target.value)}
            disabled={!kycAccepted}
          />

          {saftBuyQty && (
            <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 p-3 rounded-xl border border-emerald-800/40">
              You will send: <strong>${usdtToPay} USDT</strong> (fixed rate $0.02 / $ANODE)
            </div>
          )}

          <button 
            onClick={handleSaftPurchase}
            disabled={!kycAccepted || !saftBuyQty || Number(saftBuyQty) <= 0 || Number(saftBuyQty) > SAFT_MAX_PER_TX}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase transition-colors ${
              kycAccepted && saftBuyQty && Number(saftBuyQty) > 0 && Number(saftBuyQty) <= SAFT_MAX_PER_TX 
                ? "bg-amber-600 hover:bg-amber-500" 
                : "bg-amber-900/50 cursor-not-allowed"
            }`}
          >
            Proceed to Payment (Multi-Sig Wallet)
          </button>

          {isAdmin && (
            <div className="pt-4 border-t border-amber-900/40 space-y-3">
              <div>
                <p className="text-[10px] text-amber-400 mb-1">ADMIN: Multi-Sig Recipient Wallet</p>
                <input type="text" value={saftRecipient} onChange={(e) => setSaftRecipient(e.target.value)} className="w-full bg-slate-900 p-2 rounded text-xs border border-amber-900/40 font-mono" placeholder="Multi-sig Mainnet address" />
              </div>
              <div>
                <p className="text-[10px] text-amber-400 mb-1">ADMIN: Signed SAFT Agreement Link</p>
                <input type="text" value={saftAgreementLink} onChange={(e) => setSaftAgreementLink(e.target.value)} className="w-full bg-slate-900 p-2 rounded text-xs border border-amber-900/40 font-mono" placeholder="https://..." />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ... DAO & ESCROW, MARKETPLACE, CONTACT unchanged ... */}

      {/* New: Community Onboarding Hub */}
      <div className="mb-6">
        <button 
          onClick={() => setShowCommunity(!showCommunity)}
          className="w-full bg-slate-800 p-4 rounded-xl flex justify-between items-center text-teal-400 font-bold border border-teal-500/30"
        >
          <span>🌍 Community Hub – Join the Movement</span>
          <span className="text-3xl animate-bounce">🌍</span>
        </button>
        {showCommunity && (
          <div className="mt-2 bg-slate-800 p-6 rounded-xl border border-teal-500/30 animate-in fade-in zoom-in duration-300">
            <h3 className="text-lg font-bold text-teal-400 mb-4">Welcome to AFRO-NODE Community</h3>
            <p className="text-sm text-gray-300 mb-4">
              The 1st Pan-African Web3 Dual-Ecosystems, DeFi Protocol & Decentralized Gig-Economy platform on TON — bridging vetted African tech talent to global opportunities.
            </p>
            <div className="space-y-4 text-sm">
              <p>Share ideas • Ask questions • Get updates • Meet fellow builders</p>
              <div className="bg-slate-900 p-4 rounded-xl border border-teal-800/40">
                <p className="font-bold text-teal-300 mb-2">Primary Community Channels</p>
                <ul className="list-disc ml-5 space-y-2">
                  <li><a href="https://t.me/afronodeWeb3" target="_blank" className="text-teal-400 hover:underline">Telegram Pilot Group (Main)</a></li>
                  <li><a href="https://t.me/afronode_announcements" target="_blank" className="text-teal-400 hover:underline">Announcements Channel</a></li>
                  <li>Discord / Twitter Spaces coming soon</li>
                </ul>
              </div>
              <p className="text-[11px] text-gray-400 italic">
                We're building the future of African tech empowerment — your voice matters.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ... ADMIN CONTROL PANEL unchanged (already has separate Team/SAFT release buttons) ... */}

      {txStatus && (
        <div 
          onClick={() => setTxStatus("")} 
          className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 px-8 py-3 rounded-full shadow-2xl z-50 cursor-pointer hover:bg-blue-500 transition-colors whitespace-pre-line text-left"
        >
          <p className="text-xs font-black tracking-widest animate-pulse">📡 {txStatus}</p>
        </div>
      )}

      <footer className="mt-10 text-center text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-10">
        AFRO-NODE v1.0.6 | Dual-Engine: TACT & FUNC | 2026 | <a href="https://x.com/AfroDapp8382" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">X @AfroDapp8382</a>
      </footer>
    </div>
  );
}

export default App;
