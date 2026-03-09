
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
  const [saftUsdtAmount, setSaftUsdtAmount] = useState("");
  const [kycAccepted, setKycAccepted] = useState(false);

  const [jobDescription, setJobDescription] = useState("");
  const [jobBudget, setJobBudget] = useState("");
  const [postedGigs, setPostedGigs] = useState(() => {
    const saved = localStorage.getItem('postedGigs');
    return saved ? JSON.parse(saved) : [];
  });

  const [submitTaskId, setSubmitTaskId] = useState("");
  const [proof, setProof] = useState("");

  const [saftRecipient, setSaftRecipient] = useState("0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u");
  const [saftAgreementLink, setSaftAgreementLink] = useState("");

  const [showVesting, setShowVesting] = useState(false);
  const [showSaftVesting, setShowSaftVesting] = useState(false);
  const [showBusinessNote, setShowBusinessNote] = useState(false);
  const [showVision, setShowVision] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [merkleProof, setMerkleProof] = useState("");
  const [saftMerkleProof, setSaftMerkleProof] = useState("");

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

  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const [saftInvestors, setSaftInvestors] = useState(() => {
    const saved = localStorage.getItem('saftInvestors');
    return saved ? JSON.parse(saved) : [];
  }); 
  const [saftSearchAddress, setSaftSearchAddress] = useState("");
  const [saftInvestorInfo, setSaftInvestorInfo] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(true);

  // KYC form states
  const [fullName, setFullName] = useState("");
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [nationality, setNationality] = useState("");
  const [idType, setIdType] = useState("");
  const [uniqueIdNumber, setUniqueIdNumber] = useState("");
  // For file uploads, simulate with states (no real upload in frontend)
  const [primaryIdFile, setPrimaryIdFile] = useState(null);
  const [residencyProofFile, setResidencyProofFile] = useState(null);
  const [livenessSelfieFile, setLivenessSelfieFile] = useState(null);
  const [sourceOfFunds, setSourceOfFunds] = useState("");
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [kycData, setKycData] = useState(null);

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

  useEffect(() => {
    localStorage.setItem('postedGigs', JSON.stringify(postedGigs));
  }, [postedGigs]);

  useEffect(() => {
    localStorage.setItem('saftInvestors', JSON.stringify(saftInvestors));
  }, [saftInvestors]);

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
    setTxStatus(`Please wait while we process your ${label} on the TON Blockchain...`);
    try {
      await action();
      setTxStatus(`✓ ${label} successful!`);
    } catch (err) {
      setTxStatus(`✗ ${label} failed: ${err.message}`);
    }
  };

  const anodeToGet = saftUsdtAmount && !isNaN(Number(saftUsdtAmount)) 
    ? (Number(saftUsdtAmount) / 0.02).toFixed(0) 
    : "0";

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
        budget: totalToLock.toFixed(2),
        status: 'open',
        proof: '',
        isDaoTalent: false
      }]);
      setJobDescription("");
      setJobBudget("");
    }, "Escrow Task Creation");
  };

  const handleKycSubmit = () => {
    if (!fullName || !primaryEmail || !nationality || !idType || !uniqueIdNumber || !sourceOfFunds || !declarationAccepted) {
      setTxStatus("Please complete all KYC fields and declarations.");
      return;
    }
    // Simulate file checks (in real, validate files)
    if (!primaryIdFile || !residencyProofFile || !livenessSelfieFile) {
      setTxStatus("Please upload all required documents.");
      return;
    }
    const data = {
      fullName,
      primaryEmail,
      nationality,
      idType,
      uniqueIdNumber,
      // Files would be uploaded to server in real app
      primaryIdFile: primaryIdFile.name,
      residencyProofFile: residencyProofFile.name,
      livenessSelfieFile: livenessSelfieFile.name,
      sourceOfFunds
    };
    setKycData(data);
    setKycAccepted(true);
    setTxStatus("KYC submitted successfully. Proceed to investment.");
    // Reset form if needed, but keep for review
  };

  const handleSaftPurchase = () => {
    const usdt = Number(saftUsdtAmount);
    const anodeQty = Number(anodeToGet);
    if (!usdt || usdt <= 0 || anodeQty > SAFT_MAX_PER_TX) {
      setTxStatus(`Invalid amount. Max per purchase: ${SAFT_MAX_PER_TX.toLocaleString()} $ANODE ($${SAFT_MAX_PER_TX * 0.02} USDT)`);
      return;
    }
    if (!kycAccepted || !kycData) {
      setTxStatus("Please complete KYC and terms.");
      return;
    }
    const agreementNote = saftAgreementLink ? `Signed SAFT: ${saftAgreementLink}` : "Legal SAFT handled by Compliance Lead.";
    handleProtectedAction(() => {
      const handshake = {
        "investor_mainnet_wallet": wallet?.account?.address || "UNKNOWN",
        "investment_usdt": usdt.toFixed(4),
        "anode_allocation": anodeQty.toString(),
        "tx_hash": `SIMULATED_TESTNET_${Date.now()}`,
        "timestamp": Math.floor(Date.now() / 1000),
        "kyc_status": "VERIFIED",
        "vesting_type": "LINEAR_24_MONTHS_ZERO_CLIFF"
      };
      // In real, send to backend database
      console.log("Mainnet Handshake Data:", JSON.stringify(handshake, null, 2));
      setTxStatus(
        `KYC/Whitelist verified.\n\n` +
        `Send exactly ${usdt.toFixed(4)} USDT to:\n ${saftRecipient}\n\n` +
        `Multi-sig Tonkeeper wallet.\n` +
        `${agreementNote}\n\n` +
        `Forward tx hash to afronodedapp@gmail.com\n\n` +
        `You will receive ${anodeQty} $ANODE (vested over 24 months).\n` +
        `Handshake Data logged to console for Mainnet prep.`
      );
      // Add to local investors
      setSaftInvestors(prev => [...prev, { ...kycData, address: wallet?.account?.address, usdt: usdt, amount: anodeQty }]);
      setSaftUsdtAmount("");
    }, "SAFT Purchase");
  };

  const handleSaftSearch = () => {
    const found = saftInvestors.find(inv => inv.address === saftSearchAddress);
    setSaftInvestorInfo(found || null);
  };

  const handleAddMarketItem = () => {
    if (!newItemTitle || !newItemPrice || isEditLocked) return;
    executeAddMarketItem(newItemTitle, newItemPrice);
    setNewItemTitle("");
    setNewItemPrice("");
  };

  const handleUpdateMarketPrice = (id, newPrice) => {
    if (isEditLocked) return;
    executeUpdateMarketPrice(id, newPrice);
  };

  const handleRemoveMarketItem = (id) => {
    if (isEditLocked) return;
    executeRemoveMarketItem(id);
  };

  const handleSubmitWork = () => {
    if (!submitTaskId || !proof) {
      setTxStatus("Please enter Task ID and proof.");
      return;
    }
    const taskId = parseInt(submitTaskId);
    const index = postedGigs.findIndex(g => g.id === taskId);
    if (index === -1) {
      setTxStatus("Task ID not found.");
      return;
    }
    const updated = [...postedGigs];
    updated[index].status = 'submitted';
    updated[index].proof = proof;
    updated[index].isDaoTalent = !!member_rank?.rank; // Check if submitter is DAO member
    setPostedGigs(updated);
    setSubmitTaskId("");
    setProof("");
    setTxStatus("Work submitted successfully. Awaiting client review.");
  };

  const handleAccept = (id) => {
    const index = postedGigs.findIndex(g => g.id === id);
    if (index === -1) return;
    const gig = postedGigs[index];
    const remittance = gig.isDaoTalent ? 15 : 10;
    // In real, call contract to release funds
    const updated = [...postedGigs];
    updated[index].status = 'completed';
    setPostedGigs(updated);
    setTxStatus(`Funds released successfully. ${remittance}% remittance applied to Treasury.`);
  };

  const handleReject = (id) => {
    const index = postedGigs.findIndex(g => g.id === id);
    if (index === -1) return;
    const updated = [...postedGigs];
    updated[index].status = 'open';
    updated[index].proof = '';
    setPostedGigs(updated);
    setTxStatus("Work rejected. Gig reopened for other talents.");
  };

  const vestingTable = [
    { role: "Founder & CEO", total: "104M", monthly: "1,733,333.33", share: "10.4%" },
    { role: "Advisor", total: "36M", monthly: "600,000.00", share: "3.6%" },
    { role: "Legal Lead", total: "18M", monthly: "300,000.00", share: "1.8%" },
    { role: "SAFT & Marketing", total: "14M", monthly: "233,333.33", share: "1.4%" },
    { role: "Ambassadors Lead", total: "12M", monthly: "200,000.00", share: "1.2%" },
  ];

  const saftVestingTable = [
    { role: "SAFT Investors", total: "Up to 100M", monthly: "Individual Allocation / 24", share: "10%" },
  ];

  const userGuides = [
    { title: "Connecting Your Wallet", content: "Click the TonConnect button in the header to connect your TON wallet." },
    { title: "Posting a Gig", content: "In Client Gigs Portal, enter description and budget, then post to lock escrow." },
    { title: "Submitting Work", content: "In Services Marketplace, enter Task ID and proof, submit for client review." },
    { title: "Joining HUB DAO", content: "Click 'JOIN HUB' in Innovation Hub DAO section to register as talent." },
    { title: "SAFT Investment", content: "Complete embedded KYC, enter USDT amount, purchase, send USDT to multi-sig." },
    { title: "Vesting Claims", content: "Enter Merkle Proof in vesting sections to claim tokens." },
    { title: "Contact Support", content: "Use emails in Contact section for help." },
  ];

  if (!contract_address) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center animate-pulse text-blue-400 font-black uppercase tracking-widest">
          🌍 INITIALIZING AFRO-NODE INFRASTRUCTURE...
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container p-4 min-h-screen font-sans overflow-x-hidden ${isDarkMode ? "bg-slate-900 text-white" : "bg-white text-gray-900"}`}>
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
        .light-mode .bg-slate-900 { background-color: #f3f4f6; }
        .light-mode .text-gray-300 { color: #4b5563; }
        .light-mode .bg-slate-800 { background-color: #e5e7eb; }
        // Add more overrides as needed for light mode
      \`}</style>

      <div className="fixed top-0 left-0 w-full bg-black/40 backdrop-blur-md z-50 border-b border-slate-700 p-1 flex justify-around text-[10px] font-mono">
        <span className="text-blue-400">{\`TON: \${prices.ton}\`}</span>
        <span className="text-orange-400">{\`BTC: \${prices.btc}\`}</span>
        <span className="text-purple-400">{\`ETH: \${prices.eth}\`}</span>
        <span className="text-green-400">{\`USDT: \${prices.usdt}\`}</span>
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
          <button onClick={() => setShowUserGuide(!showUserGuide)} className="bg-blue-900 p-2 rounded text-white text-xs font-bold">?</button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="bg-gray-700 p-2 rounded text-white text-xs">
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <TonConnectButton />
        </div>
      </div>

      <div className="mb-4 bg-indigo-950/30 py-2 border-y border-indigo-500/20 overflow-hidden">
        <div className="animate-marquee text-[11px] font-bold text-indigo-300 uppercase">
          Click the Join button on the Innovation HUB DAO to register as a verified talent of our exclusive Hub DAO and use 🎉 &nbsp;&nbsp;&nbsp;&nbsp; Click the Join button on the Innovation HUB DAO to register as a verified talent of our exclusive Hub DAO and use 🎉
        </div>
      </div>

      <div className="text-center mb-6 bg-blue-900/50 p-2 rounded-xl border border-blue-700 text-[10px] font-bold text-blue-300 uppercase">
        <a href="https://www.f6s.com/afro-node-dapp" target="_blank" rel="noopener noreferrer">
          F6S Global Platform for Startup - Validated
        </a>
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

      <div className="mb-6">
        <button 
          onClick={() => setShowCommunity(!showCommunity)}
          className="w-full bg-green-900/40 hover:bg-green-800/60 p-4 rounded-xl font-bold transition-all border border-green-800 text-sm"
        >
          {showCommunity ? 'CLOSE COMMUNITY ONBOARDING' : 'COMMUNITY ONBOARDING PAGE'}
        </button>
        {showCommunity && (
          <div className="mt-2 bg-slate-800 p-6 rounded-xl border border-green-500/30 animate-in fade-in zoom-in duration-300">
            <h2 className="text-green-400 font-black text-lg mb-4">JOIN THE AFRO-NODE COMMUNITY</h2>
            <p className="text-sm leading-relaxed text-gray-300 mb-4">
              Welcome to the first Pan-African Web3 Dual-Ecosystems, DeFi Protocol & Decentralized Gig-Economy platform on TON. Connect with vetted African tech talents, share ideas, ask questions, and stay updated with news and opportunities.
            </p>
            <div className="space-y-4">
              <a href="https://t.me/afronodeWeb3" target="_blank" rel="noopener noreferrer" className="block bg-green-700 p-3 rounded-xl text-center font-bold text-xs">Join Telegram Pilot Community</a>
              <a href="https://t.me/afronodeofficialchannel" target="_blank" rel="noopener noreferrer" className="block bg-green-600 p-3 rounded-xl text-center font-bold text-xs">Subscribe to Official Update Channel</a>
              <a href="https://x.com/AfroDapp8382" target="_blank" rel="noopener noreferrer" className="block bg-green-500 p-3 rounded-xl text-center font-bold text-xs">Follow on X @AfroDapp8382</a>
              <p className="text-xs text-gray-400">Share ideas, meet talents, and get the latest updates here!</p>
            </div>
          </div>
        )}
      </div>

      {showUserGuide && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-6 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-blue-500">
            <div className="flex justify-between mb-4">
              <h2 className="text-blue-400 font-bold text-lg">User Guide</h2>
              <button onClick={() => setShowUserGuide(false)} className="text-red-500">Close</button>
            </div>
            <div className="space-y-4">
              {userGuides.map((guide, i) => (
                <div key={i}>
                  <h3 className="text-blue-300 font-bold">{guide.title}</h3>
                  <p className="text-gray-300 text-sm">{guide.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
              <div key={i} className={\`p-3 rounded-xl border \${sc.highlight ? 'border-orange-500 bg-orange-500/5' : 'border-slate-700 bg-slate-900/50'}\`}>
                <p className={\`text-[10px] font-black \${sc.highlight ? 'text-orange-400' : 'text-blue-400'}\`}>{sc.name}</p>
                <p className="text-[8px] text-gray-500">{sc.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 bg-slate-800 p-6 rounded-2xl border-l-4 border-indigo-500 shadow-xl">
        <button onClick={() => setShowVesting(!showVesting)} className="w-full flex justify-between items-center text-indigo-400 font-bold mb-4">
          <span>⏳ TEAM & ADVISORS VESTING SCHEDULE & CLAIMS</span>
          <span>{showVesting ? 'HIDE' : 'OPEN'}</span>
        </button>
        {showVesting && (
          <div className="space-y-4">
            <p className="text-[11px] text-gray-400 italic">
              AFRO-NODE enforces a 6 months cliff period post Mainnet launch followed by a 5 years linear vesting period for team & advisors to ensure project sustainability.
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

      {/* SAFT VESTING SECTION */}
      <div className="mb-6 bg-slate-800 p-6 rounded-2xl border-l-4 border-amber-500 shadow-xl">
        <button onClick={() => setShowSaftVesting(!showSaftVesting)} className="w-full flex justify-between items-center text-amber-400 font-bold mb-4">
          <span>⏳ SAFT INVESTORS VESTING (Zero Cliff – Post-Mainnet)</span>
          <span>{showSaftVesting ? 'HIDE' : 'OPEN'}</span>
        </button>
        {showSaftVesting && (
          <div className="space-y-4">
            <p className="text-[11px] text-gray-400 italic">
              SAFT investors receive linear vesting over 24 months post-Mainnet launch with zero cliff period. Vesting.tact handles both team and SAFT allocations.
            </p>
            <div className="overflow-x-auto bg-slate-900 p-2 rounded-xl">
              <table className="w-full text-[10px] font-mono">
                <thead>
                  <tr className="text-amber-400 border-b border-slate-800">
                    <th className="p-2">SOURCE</th>
                    <th className="p-2">MONTHLY ($ANODE)</th>
                    <th className="p-2 text-right">SHARE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {saftVestingTable.map((row, i) => (
                    <tr key={i}><td className="p-2 text-gray-100">{row.role}</td><td className="p-2 text-yellow-500">{row.monthly}</td><td className="p-2 text-right text-gray-500">{row.share}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30">
              <p className="text-[10px] text-amber-300 font-bold mb-2 uppercase">SAFT Investors Search</p>
              <input type="text" placeholder="Wallet Address" className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs mb-2" value={saftSearchAddress} onChange={(e) => setSaftSearchAddress(e.target.value)} />
              <button onClick={handleSaftSearch} className="w-full bg-amber-600 py-2 rounded-xl font-black text-xs mb-2">Search</button>
              {saftInvestorInfo ? (
                <div className="text-[10px] text-green-400 space-y-1">
                  <p>Full Name: {saftInvestorInfo.fullName}</p>
                  <p>Email: {saftInvestorInfo.primaryEmail}</p>
                  <p>Nationality: {saftInvestorInfo.nationality}</p>
                  <p>ID Type: {saftInvestorInfo.idType}</p>
                  <p>ID Number: {saftInvestorInfo.uniqueIdNumber}</p>
                  <p>Source of Funds: {saftInvestorInfo.sourceOfFunds}</p>
                  <p>Address: {saftInvestorInfo.address}</p>
                  <p>USDT Invested: ${saftInvestorInfo.usdt}</p>
                  <p>Amount: {saftInvestorInfo.amount} $ANODE</p>
                </div>
              ) : saftSearchAddress && <p className="text-[10px] text-red-400">No investor found.</p>}
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30">
              <p className="text-[10px] text-amber-300 font-bold mb-2 uppercase">SAFT Merkle Security Verification</p>
              <p className="text-[9px] text-gray-500 mb-2">Enter your SAFT-specific Merkle proof for claims.</p>
              <input type="text" placeholder="SAFT Merkle Proof (Hex)" className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs mb-2" value={saftMerkleProof} onChange={(e) => setSaftMerkleProof(e.target.value)} />
              <button onClick={() => handleProtectedAction(executeVestingClaim, "SAFT Vesting Claim")} className="w-full bg-amber-600 py-3 rounded-xl font-black text-xs">VERIFY & SECURE SAFT CLAIM</button>
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
                <p className="text-[10px] text-cyan-400 font-mono mb-3">MAXIMUM TOTAL SUPPLY: 1,000,000,000 $ANODE</p>
                <div className="executive-pie"></div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2 w-full text-[10px]">
                {[
                  {c:'bg-blue-500',l:'Community',p:'35% (350M)'},
                  {c:'bg-emerald-500',l:'Ecosystem & Treasury',p:'25% (250M)'},
                  {c:'bg-amber-500',l:'Private & Strategic SAFT',p:'10% (100M)'},
                  {c:'bg-indigo-500',l:'Team & Advisor',p:'18% (180M)'},
                  {c:'bg-pink-500',l:'KOLs, Promoters & Marketers',p:'5% (50M)'},
                  {c:'bg-cyan-500',l:'DEX Liquidity',p:'5% (50M)'},
                  {c:'bg-red-500',l:'Public IDO',p:'2% (20M)'}
                ].map((x,i)=>(
                  <div key={i} className="bg-slate-900 p-2 rounded flex justify-between"><span className="flex items-center gap-2"><div className={\`w-2 h-2 rounded-full \${x.c}\`}></div>{x.l}</span><span className="font-bold text-cyan-400">{x.p}</span></div>
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
                        Total Lock: {(Number(jobBudget) * 1.1).toFixed(2)} (incl. 10% escrow fee to Treasury)
                    </span>
                )}
             </div>
             <button 
                onClick={handlePostTask} 
                className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-xs uppercase transition-colors"
             >
                Post Task & Lock Escrow
             </button>
             <p className="text-[8px] text-center text-gray-500 uppercase">Clients pay 110% (10% escrow fee to AFRO-NODE Treasury)</p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700">
            <h4 className="uppercase text-blue-400 text-xs font-bold mb-3">Published Gigs (Live for HUB Talents & Guests)</h4>
            <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-2">
              {postedGigs.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No gigs posted yet – be the first to publish!</p>
              ) : (
                postedGigs.map((gig) => (
                  <div key={gig.id} className="bg-slate-900 p-3 rounded-xl text-xs border border-blue-800/50">
                    <p className="font-bold text-blue-300 leading-tight">{gig.description}</p>
                    <p className="text-emerald-400 mt-1">Budget: {gig.budget} $ANODE (incl. 10% escrow fee)</p>
                    <p className="text-[10px] text-gray-500 mt-1">Status: {gig.status.toUpperCase()}</p>
                    {gig.status === 'submitted' && (
                      <div className="mt-2">
                        <p className="text-[10px] text-yellow-400">Proof: {gig.proof}</p>
                        <p className="text-[10px] text-gray-400">Completed by: {gig.isDaoTalent ? 'DAO Talent' : 'Enthusiast'}</p>
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleAccept(gig.id)} className="bg-green-600 px-3 py-1 rounded text-[10px] font-bold">Accept & Release Funds</button>
                          <button onClick={() => handleReject(gig.id)} className="bg-red-600 px-3 py-1 rounded text-[10px] font-bold">Reject Work</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-amber-600/40 shadow-lg">
          <h3 className="text-lg font-bold text-amber-500 mb-4">SAFT Investor Portal</h3>
          <div className="space-y-2">
             <p className="text-[10px] text-gray-400">Fixed SAFT Price: $0.02 / $ANODE — Pay in USDT only (TON Jetton)</p>
             
             {!kycAccepted ? (
               <div className="space-y-3">
                 <h4 className="text-amber-400 font-bold text-sm mb-2">KYC & AML Verification</h4>
                 <input 
                   placeholder="Full Legal Name" 
                   className="w-full bg-slate-900 p-2 rounded text-xs border border-amber-900/40" 
                   value={fullName} 
                   onChange={(e) => setFullName(e.target.value)} 
                 />
                 <input 
                   type="email" 
                   placeholder="Primary Email" 
                   className="w-full bg-slate-900 p-2 rounded text-xs border border-amber-900/40" 
                   value={primaryEmail} 
                   onChange={(e) => setPrimaryEmail(e.target.value)} 
                 />
                 <select 
                   className="w-full bg-slate-900 p-2 rounded text-xs border border-amber-900/40" 
                   value={nationality} 
                   onChange={(e) => setNationality(e.target.value)}
                 >
                   <option value="">Select Nationality</option>
                   {/* Add options as needed, e.g. */}
                   <option value="Nigeria">Nigeria</option>
                   <option value="USA">USA</option>
                   {/* More countries */}
                 </select>
                 <select 
                   className="w-full bg-slate-900 p-2 rounded text-xs border border-amber-900/40" 
                   value={idType} 
                   onChange={(e) => setIdType(e.target.value)}
                 >
                   <option value="">Select ID Type</option>
                   <option value="International Passport">International Passport</option>
                   <option value="National ID">National ID</option>
                   <option value="Driver's License">Driver's License</option>
                 </select>
                 <input 
                   placeholder="Unique ID Number" 
                   className="w-full bg-slate-900 p-2 rounded text-xs border border-amber-900/40" 
                   value={uniqueIdNumber} 
                   onChange={(e) => setUniqueIdNumber(e.target.value)} 
                 />
                 <div>
                   <label className="text-[10px] text-gray-300 block mb-1">Primary Identity Document (High-res scan)</label>
                   <input type="file" onChange={(e) => setPrimaryIdFile(e.target.files[0])} className="w-full bg-slate-900 p-2 rounded text-xs border border-amber-900/40" />
                 </div>
                 <div>
                   <label className="text-[10px] text-gray-300 block mb-1">Proof of Residency (dated within 90 days)</label>
                   <input type="file" onChange={(e) => setResidencyProofFile(e.target.files[0])} className="w-full bg-slate-900 p-2 rounded text-xs border border-amber-900/40" />
                 </div>
                 <div>
                   <label className="text-[10px] text-gray-300 block mb-1">Liveness Verification Selfie</label>
                   <input type="file" onChange={(e) => setLivenessSelfieFile(e.target.files[0])} className="w-full bg-slate-900 p-2 rounded text-xs border border-amber-900/40" />
                 </div>
                 <select 
                   className="w-full bg-slate-900 p-2 rounded text-xs border border-amber-900/40" 
                   value={sourceOfFunds} 
                   onChange={(e) => setSourceOfFunds(e.target.value)}
                 >
                   <option value="">Select Source of Funds</option>
                   <option value="Salary/Savings">Salary/Savings</option>
                   <option value="Investment Profits">Investment Profits</option>
                   <option value="Business Revenue">Business Revenue</option>
                   <option value="Inheritance/Gift">Inheritance/Gift</option>
                 </select>
                 <div className="flex items-start gap-2">
                   <input type="checkbox" checked={declarationAccepted} onChange={(e) => setDeclarationAccepted(e.target.checked)} className="mt-1" />
                   <label className="text-[10px] text-gray-300">"I certify that these funds (USDT) are not derived from illicit or criminal activity and that I am not a Politically Exposed Person (PEP)."</label>
                 </div>
                 <button onClick={handleKycSubmit} className="w-full bg-amber-500 py-3 rounded-xl font-bold text-xs uppercase">Submit KYC</button>
               </div>
             ) : (
               <div className="space-y-2">
                 <input 
                   type="number" 
                   placeholder="Enter USDT Contribution" 
                   className="w-full bg-slate-900 p-3 rounded-xl text-xs outline-none border border-amber-900/40" 
                   value={saftUsdtAmount} 
                   onChange={(e) => setSaftUsdtAmount(e.target.value)} 
                 />

                 {saftUsdtAmount && (
                   <p className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 p-2 rounded-xl border border-emerald-900/50">
                     You will receive: <span className="font-bold">{anodeToGet} $ANODE</span> (at fixed $0.02 per $ANODE)
                   </p>
                 )}

                 {saftAgreementLink && (
                   <a href={saftAgreementLink} target="_blank" rel="noopener noreferrer" className="block text-[10px] text-emerald-400 underline mb-2">
                     📜 Sign/View SAFT Legal Agreement
                   </a>
                 )}
                 <button onClick={handleSaftPurchase} className="w-full bg-amber-600 py-3 rounded-xl font-bold text-xs uppercase">Buy $ANODE via USDT SAFT</button>
                 <p className="text-[8px] text-center text-amber-700 uppercase">Strategic Private Sale — Funds bootstrap Mainnet launch</p>
               </div>
             )}

             {isAdmin && (
               <div className="pt-4 border-t border-amber-900/40 space-y-3">
                 <button onClick={() => setIsEditLocked(!isEditLocked)} className="w-full bg-gray-700 py-2 rounded-xl font-bold text-xs uppercase">
                   {isEditLocked ? 'Unlock Edit' : 'Lock Edit'}
                 </button>
                 <div>
                   <p className="text-[10px] text-amber-400 mb-1">ADMIN: Multi-Sig Tonkeeper USDT Recipient Wallet</p>
                   <input type="text" disabled={isEditLocked} value={saftRecipient} onChange={(e) => setSaftRecipient(e.target.value)} className="w-full bg-slate-900 p-2 rounded text-xs border border-amber-900/40 font-mono" placeholder="Multi-sig Mainnet address" />
                 </div>
                 <div>
                   <p className="text-[10px] text-amber-400 mb-1">ADMIN: Insert Signed SAFT Agreement Link</p>
                   <input type="text" disabled={isEditLocked} value={saftAgreementLink} onChange={(e) => setSaftAgreementLink(e.target.value)} className="w-full bg-slate-900 p-2 rounded text-xs border border-amber-900/40 font-mono" placeholder="https://drive.google.com/... or IPFS link to signed PDF" />
                 </div>
               </div>
             )}
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
            <button onClick={() => window.open(\`https://testnet.tonviewer.com/\${dao_address}\`)} className="flex-1 bg-slate-900 p-2 rounded-xl text-white text-[10px] font-bold">EXPLORER</button>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-blue-400 flex justify-between items-center">
            Services Marketplace
            {isAdmin && (
              <button onClick={() => setIsEditLocked(!isEditLocked)} className="bg-gray-700 px-3 py-1 rounded text-xs">
                {isEditLocked ? 'Unlock Edit' : 'Lock Edit'}
              </button>
            )}
          </h3>
          <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
            {marketplaceItems.map(item => (
              <div key={item.id} className="bg-slate-900 p-2 rounded-xl flex justify-between items-center border border-slate-800">
                <p className="text-[10px] font-bold">{item.title}</p>
                {isAdmin && !isEditLocked ? (
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      defaultValue={parseInt(item.price)} 
                      onBlur={(e) => handleUpdateMarketPrice(item.id, e.target.value)} 
                      className="w-20 bg-transparent border-b text-xs"
                    />
                    <button onClick={() => handleRemoveMarketItem(item.id)} className="text-red-500 text-xs">Remove</button>
                  </div>
                ) : (
                  <button onClick={() => handleProtectedAction(() => executeAnodePayment('m', item.id, item.price), "Market Order")} className="bg-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">{item.price}</button>
                )}
              </div>
            ))}
          </div>
          {isAdmin && !isEditLocked && (
            <div className="mt-4 space-y-2">
              <input 
                placeholder="New Item Title" 
                value={newItemTitle} 
                onChange={(e) => setNewItemTitle(e.target.value)} 
                className="w-full bg-slate-900 p-2 rounded text-xs border border-slate-700"
              />
              <input 
                type="number" 
                placeholder="New Item Price ($ANODE)" 
                value={newItemPrice} 
                onChange={(e) => setNewItemPrice(e.target.value)} 
                className="w-full bg-slate-900 p-2 rounded text-xs border border-slate-700"
              />
              <button onClick={handleAddMarketItem} className="w-full bg-green-600 py-2 rounded-xl font-bold text-xs uppercase">Add Item</button>
            </div>
          )}

          <div className="mt-6 bg-slate-900 p-4 rounded-xl border border-blue-800/40">
            <h4 className="text-blue-300 font-bold mb-3 text-sm">Submit Completed Task</h4>
            <input 
              placeholder="Task ID" 
              className="w-full bg-slate-800 p-3 rounded text-xs border border-slate-700 mb-2"
              value={submitTaskId}
              onChange={(e) => setSubmitTaskId(e.target.value)}
            />
            <textarea 
              placeholder="Proof of completion (link, screenshot description, etc.)" 
              className="w-full bg-slate-800 p-3 rounded text-xs border border-slate-700 h-24 mb-2"
              value={proof}
              onChange={(e) => setProof(e.target.value)}
            />
            <button onClick={handleSubmitWork} className="w-full bg-blue-700 py-3 rounded font-bold text-xs uppercase">
              Submit Work for Review
            </button>
            <p className="text-[9px] text-gray-500 mt-2">
              Fee structure on release:<br/>
              • Vetted HUB DAO talents → 15% to AFRO-NODE Treasury (85% to talent)<br/>
              • General users/enthusiasts → 10% to AFRO-NODE Treasury (90% to user)
            </p>
          </div>

          <div className="mt-3 bg-red-950/30 p-3 rounded-xl border border-red-800/40 text-[10px]">
            <p className="text-red-300 font-bold mb-1">Dispute Resolution</p>
            <p>If client rejects work or talent disputes release:</p>
            <ol className="list-decimal ml-4 space-y-1 text-gray-300">
              <li>Contact support: afronodedapp@gmail.com</li>
              <li>Provide tx hash + proof</li>
              <li>Hub DAO vote can be triggered for large disputes</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <button 
          onClick={() => setShowContact(!showContact)}
          className="w-full bg-slate-800 p-4 rounded-xl flex justify-between items-center text-teal-400 font-bold border border-teal-500/30"
        >
          <span>🎧 Contact & Support</span>
          <span className="text-3xl animate-bounce">🎧</span>
        </button>
        {showContact && (
          <div className="mt-2 bg-slate-800 p-6 rounded-xl border border-teal-500/30 animate-in fade-in zoom-in duration-300">
            <div className="text-sm space-y-4">
              <p>Founder & CEO: <a href="mailto:afronodedapp@gmail.com" className="text-teal-400 hover:underline">afronodedapp@gmail.com</a></p>
              <p>Tech Support (Web3 Developers): <a href="mailto:gigeconomytechnicalsupport@gmail.com" className="text-teal-400 hover:underline">gigeconomytechnicalsupport@gmail.com</a></p>
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="bg-red-950/20 p-6 rounded-2xl border-2 border-dashed border-red-600/30 mb-10">
          <h3 className="text-red-500 font-black mb-4 text-center text-sm uppercase">Admin Control Plane</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={sendMint} className="bg-red-600 p-3 rounded-xl font-bold text-[10px]">MINT SYSTEM</button>
            <button onClick={sendAirdrop} className="bg-orange-600 p-3 rounded-xl font-bold text-[10px]">GLOBAL AIRDROP</button>
          </div>
          <div className="flex gap-2">
             <button onClick={() => handleProtectedAction(executeReleaseTeam, "Team Release")} className="flex-1 border border-green-500 text-green-500 py-2 rounded-xl text-[10px] font-bold uppercase">Release Team</button>
             <button onClick={() => handleProtectedAction(executeReleaseSaft, "SAFT Release")} className="flex-1 border border-green-500 text-green-500 py-2 rounded-xl text-[10px] font-bold uppercase">Release SAFT</button>
          </div>
          <div className="flex gap-2 mt-2">
             <button onClick={() => handleProtectedAction(executeKillVesting, "Kill Vesting")} className="flex-1 border border-red-500 text-red-500 py-2 rounded-xl text-[10px] font-bold uppercase">Kill Release</button>
          </div>
        </div>
      )}

      {txStatus && (
        <div 
          onClick={() => setTxStatus("")} 
          className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 px-8 py-3 rounded-full shadow-2xl z-50 cursor-pointer hover:bg-blue-500 transition-colors whitespace-pre-line text-left"
        >
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

