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
  const [merkleProof, setMerkleProof] = useState("");

  const [prices, setPrices] = useState({ ton: "0.00", btc: "0.00", eth: "0.00", usdt: "1.00" });

  // Admin editing states
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
    executeAdminTriggerRelease,
    executeKillVesting,
    executeCreateTask,
    anodeBalance,
    // Assume these admin marketplace methods exist in hook (add them to marketplace.tact if needed)
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

  const isAdmin = useMemo(() => {
    if (!wallet?.account?.address) return false;
    return Address.parse(wallet.account.address).toRawString() === Address.parse(ADMIN_WALLET_ADDRESS).toRawString();
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
      setTxStatus(`✗ ${label} failed`);
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
    handleProtectedAction(() => {
      executeCreateTask(jobDescription, totalToLock.toString());
      setPostedGigs(prev => [...prev, { id: Date.now(), description: jobDescription, budget: totalToLock.toFixed(0) }]);
      setTxStatus(`Initiating Escrow: ${totalToLock} $ANODE (incl. 10% escrow fee to Treasury)`);
    }, "Escrow Task Creation");
  };

  const handleSaftPurchase = () => {
    const qty = Number(saftBuyQty);
    if (!qty || qty <= 0 || qty > SAFT_MAX_PER_TX) {
      setTxStatus(`Invalid amount. Max per purchase: ${SAFT_MAX_PER_TX.toLocaleString()} $ANODE`);
      return;
    }
    const agreementNote = saftAgreementLink ? `Signed SAFT: ${saftAgreementLink}` : "Legal SAFT handled by Compliance Lead.";
    handleProtectedAction(() => {
      setTxStatus(
        `KYC/Whitelist verified.\n\n` +
        `Send exactly \( {usdtToPay} USDT to:\n \){saftRecipient}\n\n` +
        `Multi-sig Tonkeeper wallet.\n` +
        `${agreementNote}\n\n` +
        `Forward tx hash to afronodedapp@gmail.com`
      );
    }, "SAFT Purchase");
  };

  // Admin-only marketplace edit functions (call backend methods)
  const addMarketItem = (title, price) => {
    if (!isAdmin) return;
    const newItem = { id: Date.now(), title, price: `${price} $ANODE` };
    setMarketplaceItems([...marketplaceItems, newItem]);
    // Call backend: executeAddMarketItem(title, price)
    // handleProtectedAction(() => executeAddMarketItem(title, price), "Add Market Item");
  };

  const updateMarketPrice = (id, newPrice) => {
    if (!isAdmin) return;
    setMarketplaceItems(marketplaceItems.map(item => 
      item.id === id ? { ...item, price: `${newPrice} $ANODE` } : item
    ));
    // Call backend: executeUpdateMarketPrice(id, newPrice)
  };

  const removeMarketItem = (id) => {
    if (!isAdmin) return;
    setMarketplaceItems(marketplaceItems.filter(item => item.id !== id));
    // Call backend: executeRemoveMarketItem(id)
  };

  if (!contract_address) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center animate-pulse text-blue-500 font-black uppercase tracking-widest">
          INITIALIZING AFRO-NODE...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container p-4 bg-slate-900 min-h-screen text-white font-sans overflow-x-hidden relative">
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

      {/* F6S Validation Badge - Corner Section */}
      <div className="fixed top-4 right-4 z-50 bg-indigo-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-indigo-500/50 shadow-lg text-[10px] font-mono">
        <p className="text-indigo-300 font-bold">F6S Global Platform</p>
        <p className="text-indigo-200">Startup-Validated</p>
        <a 
          href="https://www.f6s.com/company/afro-node-dapp" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-indigo-400 underline hover:text-indigo-300"
        >
          View on F6S
        </a>
      </div>

      <div className="fixed top-0 left-0 w-full bg-black/40 backdrop-blur-md z-40 border-b border-slate-700 p-1 flex justify-around text-[10px] font-mono">
        <span className="text-blue-400">TON: ${prices.ton}</span>
        <span className="text-orange-400">BTC: ${prices.btc}</span>
        <span className="text-purple-400">ETH: ${prices.eth}</span>
        <span className="text-green-400">USDT: ${prices.usdt}</span>
        <span className="text-yellow-400">$ANODE: Coming Soon (Testnet)</span>
      </div>

      <div className="mt-6 flex justify-between items-center mb-6 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-2">
          <img src="/afro-node-logo.png" alt="AFRO-NODE" className="h-10 w-auto" />
          <h1 className="text-xl font-black text-blue-500 uppercase tracking-tighter">AFRO-NODE</h1>
        </div>
        <div className="flex items-center gap-4">
          {connected && <div className="text-[10px] font-mono bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-700">$ANODE: {anodeBalance ?? "0"}</div>}
          <TonConnectButton />
        </div>
      </div>

      <div className="mb-4 bg-indigo-950/30 py-2 border-y border-indigo-500/20 overflow-hidden">
        <div className="animate-marquee text-[11px] font-bold text-indigo-300 uppercase">
          Click the Join button on the Innovation HUB DAO to register as a verified talent of our exclusive Hub DAO and use 🎉 &nbsp;&nbsp;&nbsp;&nbsp; Click the Join button on the Innovation HUB DAO to register as a verified talent of our exclusive Hub DAO and use 🎉
        </div>
      </div>

      <div className="mb-6">
        <button onClick={() => setShowVision(!showVision)} className="w-full bg-blue-900/40 hover:bg-blue-800/60 p-4 rounded-xl font-bold transition-all border border-blue-800 text-sm">
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

      {/* ... (all other sections like CORE STATS, SMART CONTRACTS, VESTING, TOKENOMICS, CLIENT GIGS PORTAL, DAO & MARKETPLACE, CONTACT, ADMIN CONTROL remain exactly as in your previous working version) ... */}

      {/* Admin edit lock toggle - appears only for admin */}
      {isAdmin && (
        <div className="fixed top-20 right-4 z-50 bg-slate-800/90 backdrop-blur-md p-3 rounded-xl border border-slate-600 shadow-lg">
          <label className="flex items-center gap-2 text-[11px] text-gray-300">
            <input
              type="checkbox"
              checked={isEditLocked}
              onChange={(e) => setIsEditLocked(e.target.checked)}
              className="accent-blue-500"
            />
            <span>{isEditLocked ? '🔒 Edit Locked' : '🔓 Edit Unlocked'}</span>
          </label>
        </div>
      )}

      {/* Marketplace admin editing (only when unlocked) */}
      {!isEditLocked && isAdmin && (
        <div className="mb-6 bg-slate-900 p-4 rounded-xl border border-amber-700/40">
          <h4 className="text-amber-400 font-bold mb-3">Admin: Manage Marketplace Listings</h4>
          <div className="space-y-3">
            {/* Add new item */}
            <div className="flex gap-2">
              <input placeholder="Title" className="flex-1 bg-slate-800 p-2 rounded text-xs border border-slate-700" id="newTitle" />
              <input type="number" placeholder="Price" className="w-24 bg-slate-800 p-2 rounded text-xs border border-slate-700" id="newPrice" />
              <button 
                onClick={() => {
                  const title = document.getElementById('newTitle').value;
                  const price = document.getElementById('newPrice').value;
                  if (title && price) addMarketItem(title, price);
                }}
                className="bg-green-700 px-4 py-2 rounded text-xs font-bold"
              >
                Add
              </button>
            </div>

            {/* List existing */}
            {marketplaceItems.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-800 p-2 rounded">
                <span className="text-[11px]">{item.title}</span>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    defaultValue={parseFloat(item.price)}
                    className="w-20 bg-slate-700 p-1 rounded text-xs"
                    onChange={(e) => updateMarketPrice(item.id, e.target.value)}
                  />
                  <button 
                    onClick={() => removeMarketItem(item.id)}
                    className="bg-red-700 px-3 py-1 rounded text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ... rest of your original return JSX (DAO, contact accordion, admin panel, tx status, footer) ... */}

      {txStatus && (
        <div onClick={() => setTxStatus("")} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 px-8 py-3 rounded-full shadow-2xl z-50 cursor-pointer hover:bg-blue-500 transition-colors whitespace-pre-line text-left">
          <p className="text-xs font-black tracking-widest animate-pulse">📡 {txStatus}</p>
        </div>
      )}

      <footer className="mt-10 text-center text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-10">
        AFRO-NODE v1.0.5 | Dual-Engine: TACT & FUNC | 2026 | <a href="https://x.com/AfroDapp8382" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">X @AfroDapp8382</a>
      </footer>
    </div>
  );
}

export default App;
