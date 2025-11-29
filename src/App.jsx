import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { useState, useEffect, useCallback } from 'react';
import { Address } from '@ton/core';
import { getHttpEndpoint } from '@ton/ton';

// --- Ecosystem Definitions ---
const MARKETPLACE_COLOR = 'blue-400';
const DAO_COLOR = 'purple-400';
const DEFAULT_BG = 'gray-900';
const CARD_BG = 'gray-800';

// Helper component for styled sections
const SectionCard = ({ title, children, color }) => (
    <div className={`bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700`}>
        <h3 className={`text-xl font-bold mb-4 text-${color}`}>{title}</h3>
        <p className="text-gray-400">{children}</p>
    </div>
);

// --- Feature Placeholders ---

const Dashboard = () => (
    <div className={`p-8 text-white bg-${DEFAULT_BG}`}>
        <h2 className="text-3xl font-bold mb-6 text-blue-400">Welcome to AFRO-NODE</h2>
        <p className="text-gray-400 mb-8">Access core financial utilities and ecosystem features below.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="P2P $ANODE Transfers" color="blue-400">
                Initiate peer-to-peer transfers of $ANODE tokens.
                <button className="mt-3 block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">Go to Transfer</button>
            </SectionCard>
            
            <SectionCard title="Staking & Yield" color="green-400">
                Lock your $ANODE to earn staking rewards and secure the network.
                <button className="mt-3 block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors">Start Staking</button>
            </SectionCard>
        </div>
    </div>
);

const Marketplace = () => (
    <div className={`p-8 text-white bg-${DEFAULT_BG}`}>
        <h2 className={`text-3xl font-bold mb-6 text-${MARKETPLACE_COLOR}`}>Central Marketplace</h2>
        <p className="text-gray-400 mb-8">Connect with talents for Blockchain AI, Web3, and Web2 services.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="Service Listings" color="blue-400">
                Browse or list services (Blockchain AI, Web3, Web2). Payments trigger a **10% remittance fee** upon completion.
                <button className="mt-3 block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">View Listings</button>
            </SectionCard>
            
            <SectionCard title="Educational Subscriptions" color="blue-400">
                Access MasterClass & educational subscriptions for high-demand Web3 skills.
                <button className="mt-3 block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">Subscribe Now</button>
            </SectionCard>
        </div>
    </div>
);

const HubDAO = () => (
    <div className={`p-8 text-white bg-${DEFAULT_BG}`}>
        <h2 className={`text-3xl font-bold mb-6 text-${DAO_COLOR}`}>Innovation HUB DAO</h2>
        <p className="text-gray-400 mb-8">Governance and job fulfillment for community talents.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="DAO Proposal System" color="purple-400">
                Create and vote on governance proposals. Requires staked $ANODE.
                <button className="mt-3 block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors">Create Proposal</button>
            </SectionCard>
            
            <SectionCard title="Talent Score Lookups" color="purple-400">
                View verified scores and reputations of community talents. **15% remittance fee** applies to talents upon DAO Job completion.
                <button className="mt-3 block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors">Lookup Scores</button>
            </SectionCard>
        </div>
    </div>
);

const AdminTools = () => (
    <div className={`p-8 text-white bg-${DEFAULT_BG}`}>
        <h2 className={`text-3xl font-bold mb-6 text-red-500`}>Admin Tools (Owner Access)</h2>
        <p className="text-gray-400 mb-8">Exclusive functions for $ANODE token management.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="Minting Logic ($ANODE)" color="red-500">
                Execute the logic for minting new $ANODE tokens (Owner function).
                <button className="mt-3 block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors">Mint Tokens</button>
            </SectionCard>
            
            <SectionCard title="Airdrop $ANODE" color="red-500">
                Distribute $ANODE tokens to a list of connected TON wallet addresses.
                <button className="mt-3 block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors">Initiate Airdrop</button>
            </SectionCard>
        </div>
    </div>
);

const MyEscrows = () => {
    // Mock data and fee logic remains the same...
    const mockEscrow = { assetLockedAmount: 1000, originalServiceCost: 900, serviceType: 1, state: 'FUNDS_LOCKED' };
    const ESCROW_FEE_RATE = 0.10; // 10%
    const CONDITIONAL_DAO_RATE = 0.15; // 15%
    const CONDITIONAL_MARKETPLACE_RATE = 0.10; // 10%

    const escrowServiceFee = mockEscrow.originalServiceCost * ESCROW_FEE_RATE;
    const conditionalRate = mockEscrow.serviceType === 1 ? CONDITIONAL_DAO_RATE : CONDITIONAL_MARKETPLACE_RATE;
    const conditionalFee = mockEscrow.originalServiceCost * conditionalRate;
    const totalFee = escrowServiceFee + conditionalFee;
    const finalPayout = mockEscrow.assetLockedAmount - totalFee;

    const isDaoEscrow = mockEscrow.serviceType === 1;
    const accentColor = isDaoEscrow ? DAO_COLOR : MARKETPLACE_COLOR;

    return (
        <div className="p-8 text-white">
            <h2 className={`text-2xl font-semibold mb-4 text-${accentColor}`}>My Escrows & Dispute Resolution</h2>
            <div className={`bg-${CARD_BG} p-6 rounded-xl shadow-2xl border border-gray-700`}>
                
                {/* 1. FEE POLICIES DISPLAY ADDED HERE */}
                <h3 className="text-xl font-bold mb-4 text-gray-300">Current Fee Policies</h3>
                <div className="space-y-1 p-3 border border-gray-600 rounded-md mb-6">
                    <p className="text-yellow-400 font-semibold">1. Standard Escrow Fee: <span className="float-right font-mono text-lg">10%</span></p>
                    <p>2. DAO Talent Remittance Fee: <span className="float-right font-mono text-lg text-purple-400">15%</span></p>
                    <p>3. Marketplace Remittance Fee: <span className="float-right font-mono text-lg text-blue-400">10%</span></p>
                </div>
                
                {/* 2. FEE BREAKDOWN (TRIPLE DEDUCTION LOGIC) */}
                <h3 className="text-xl font-medium mb-4">Escrow Details (Mock)</h3>
                <p><strong>Service Type:</strong> <span className={`text-${accentColor}`}>{isDaoEscrow ? 'DAO Job' : 'Marketplace Task'}</span></p>
                <p><strong>Locked Amount:</strong> {mockEscrow.assetLockedAmount} ANODE</p>
                <p className="mb-4"><strong>Service Cost:</strong> {mockEscrow.originalServiceCost} ANODE</p>

                <h4 className="text-lg font-bold mt-4 text-red-400">⚠️ Fee Calculation</h4>
                <div className="space-y-2 mt-2 p-3 border border-red-500 rounded-md">
                    <p>Escrow Service Fee (10%): <span className="float-right font-mono">{escrowServiceFee.toFixed(2)} ANODE</span></p>
                    <p>Conditional Remittance Fee ({conditionalRate * 100}%): <span className="float-right font-mono">{conditionalFee.toFixed(2)} ANODE</span></p>
                    <hr className="border-gray-600"/>
                    <p className="font-bold">Total Fee Deduction: <span className="float-right font-mono text-red-400">{totalFee.toFixed(2)} ANODE</span></p>
                    <hr className="border-gray-600"/>
                    <p className="font-extrabold text-green-400 text-lg">Final Payout (Net): <span className="float-right font-mono">{finalPayout.toFixed(2)} ANODE</span></p>
                </div>

                {mockEscrow.state === 'FUNDS_LOCKED' && (
                    <div className="mt-6 flex space-x-3">
                        <button className={`bg-${MARKETPLACE_COLOR} hover:bg-blue-500 text-white font-semibold rounded-lg px-4 py-2 transition-colors`}>OP_RELEASE</button>
                        <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors">OP_REFUND</button>
                        <button className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors">OP_DISPUTE</button>
                    </div>
                )}
            </div>
        </div>
    );
};
// --- End Placeholder Components ---

const useWalletData = () => {
    // ... data fetching logic remains the same ...
    const userFriendlyAddress = useTonAddress();
    const isConnected = !!userFriendlyAddress;
    const [balances, setBalances] = useState({ ton: '0.00', anode: '0.00' });
    const [isAdmin, setIsAdmin] = useState(false);
    
    // ... useEffect and return ...
    useEffect(() => {
        const mockOwnerAddress = 'UQDXC1erzS2fub_CNmkdH1A3hRs6xMDrWBmOD2yQOZjRuruv'; 
        if (isConnected && userFriendlyAddress === mockOwnerAddress) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
        if (isConnected) {
             setBalances({ ton: '15.42', anode: '875.00' });
        } else {
             setBalances({ ton: '0.00', anode: '0.00' });
        }
    }, [userFriendlyAddress, isConnected]);
    return { ...balances, isConnected, userFriendlyAddress, isAdmin };
};

const shortenAddress = (address) => {
    if (!address) return 'N/A';
    return Address.isFriendly(address) ? address.slice(0, 4) + '...' + address.slice(-4) : 'Invalid Address';
};

// --- Header Component ---
const Header = ({ tonBalance, anodeBalance, userFriendlyAddress, isConnected }) => {
    return (
        <header className={`flex justify-between items-center p-4 bg-gray-800 shadow-xl sticky top-0 z-10 border-b border-gray-700`}>
            <div className="flex items-center space-x-3">
                <img 
                    src="/afro-node-logo.png" 
                    alt="AFRO-NODE Logo" 
                    className="h-8 w-8"
                    onError={(e) => { e.target.onerror = null; e.target.src="/vite.svg" }}
                />
                <h1 className={`text-2xl font-extrabold text-${MARKETPLACE_COLOR}`}>AFRO-NODE DApp</h1>
            </div>
            <div className="flex items-center space-x-4">
                {isConnected && (
                    <div className="text-sm text-gray-300 bg-gray-700 p-2 rounded-lg font-mono">
                        <p>Address: <span className={`text-xs text-${MARKETPLACE_COLOR}`}>{shortenAddress(userFriendlyAddress)}</span></p>
                        <p>TON: <span className="font-semibold">{tonBalance}</span> | ANODE: <span className="font-semibold">{anodeBalance}</span></p>
                    </div>
                )}
                <TonConnectButton />
            </div>
        </header>
    );
};

// --- Navigation Links ---
const Navigation = ({ isAdmin }) => {
    const baseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";

    const getLinkClass = (to) => {
        // Use hover effects that reflect the module color
        if (to === "/marketplace") return `text-gray-300 hover:text-white hover:bg-blue-600 bg-opacity-20 hover:shadow-lg ${baseClass}`;
        if (to === "/dao") return `text-gray-300 hover:text-white hover:bg-purple-600 bg-opacity-20 hover:shadow-lg ${baseClass}`;
        return `text-gray-300 hover:text-blue-400 ${baseClass}`;
    };

    return (
        <nav className="bg-gray-800 shadow-inner border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className={getLinkClass("/")}>Dashboard/Wallet</Link>
                        <Link to="/marketplace" className={getLinkClass("/marketplace")}>Marketplace</Link>
                        <Link to="/dao" className={getLinkClass("/dao")}>Innovation HUB DAO</Link>
                        <Link to="/escrows" className={getLinkClass("/escrows")}>My Escrows</Link>
                        {isAdmin && <Link to="/admin" className={getLinkClass("/admin")}>Admin Tools</Link>}
                    </div>
                </div>
            </div>
        </nav>
    );
};

// --- Main App Component ---
function App() {
    const { ton: tonBalance, anode: anodeBalance, userFriendlyAddress, isConnected, isAdmin } = useWalletData();

    return (
        <Router>
            <div className={`min-h-screen bg-${DEFAULT_BG}`}> 
                <Header 
                    tonBalance={tonBalance} 
                    anodeBalance={anodeBalance} 
                    userFriendlyAddress={userFriendlyAddress} 
                    isConnected={isConnected} 
                />
                <Navigation isAdmin={isAdmin} />
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/dao" element={<HubDAO />} />
                        <Route path="/escrows" element={<MyEscrows />} />
                        <Route 
                            path="/admin" 
                            element={isAdmin ? <AdminTools /> : <Navigate to="/" replace />} 
                        /> 
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
