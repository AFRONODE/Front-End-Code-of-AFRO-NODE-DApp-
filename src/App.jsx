import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { useState, useEffect } from 'react';
import { Address } from '@ton/core';
// Removed getHttpEndpoint as it's not strictly needed for UI presentation

// --- Ecosystem Definitions ---
const MARKETPLACE_COLOR_DARK = 'blue-400';
const DAO_COLOR_DARK = 'purple-400';
const MARKETPLACE_COLOR_LIGHT = 'blue-700';
const DAO_COLOR_LIGHT = 'purple-700';

const getColors = (isDark) => ({
    // Backgrounds
    BG: isDark ? 'gray-900' : 'white',
    CARD_BG: isDark ? 'gray-800' : 'gray-100',
    TEXT_COLOR: isDark ? 'text-white' : 'text-gray-900',
    TEXT_MUTED: isDark ? 'text-gray-400' : 'text-gray-600',
    
    // Accents
    MARKETPLACE_ACCENT: isDark ? MARKETPLACE_COLOR_DARK : MARKETPLACE_COLOR_LIGHT,
    DAO_ACCENT: isDark ? DAO_COLOR_DARK : DAO_COLOR_LIGHT,
    
    // Buttons
    BUTTON_BLUE: isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-700 hover:bg-blue-800',
    BUTTON_PURPLE: isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-700 hover:bg-purple-800',
    BUTTON_RED: isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-700 hover:bg-red-800',
});


// --- Reusable Components (Styles now use isDarkMode) ---

const ThemeToggleButton = ({ isDarkMode, toggleTheme }) => (
    <button
        onClick={toggleTheme}
        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'} shadow-md`}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
        {isDarkMode ? '🌞 Light' : '🌙 Dark'}
    </button>
);

const SectionCard = ({ title, children, color, isDarkMode }) => {
    const colors = getColors(isDarkMode);
    return (
        <div className={`${colors.CARD_BG} p-6 rounded-xl shadow-xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-bold mb-4 text-${color}`}>{title}</h3>
            <p className={colors.TEXT_MUTED}>{children}</p>
        </div>
    );
};

// --- Feature Placeholders (Updated with conditional styles) ---

const Dashboard = ({ isDarkMode }) => {
    const colors = getColors(isDarkMode);
    return (
        <div className={`p-8 ${colors.TEXT_COLOR} bg-${colors.BG}`}>
            <h2 className={`text-3xl font-bold mb-6 text-${colors.MARKETPLACE_ACCENT}`}>Welcome to AFRO-NODE</h2>
            <p className={`${colors.TEXT_MUTED} mb-8`}>Access core financial utilities and ecosystem features below.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title="P2P $ANODE Transfers" color={colors.MARKETPLACE_ACCENT} isDarkMode={isDarkMode}>
                    Initiate peer-to-peer transfers of $ANODE tokens.
                    <button className={`mt-3 block ${colors.BUTTON_BLUE} text-white font-semibold py-2 px-4 rounded transition-colors`}>Go to Transfer</button>
                </SectionCard>
                
                <SectionCard title="Staking & Yield" color="green-500" isDarkMode={isDarkMode}>
                    Lock your $ANODE to earn staking rewards and secure the network.
                    <button className="mt-3 block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors">Start Staking</button>
                </SectionCard>
            </div>
        </div>
    );
};

const Marketplace = ({ isDarkMode }) => {
    const colors = getColors(isDarkMode);
    return (
        <div className={`p-8 ${colors.TEXT_COLOR} bg-${colors.BG}`}>
            <h2 className={`text-3xl font-bold mb-6 text-${colors.MARKETPLACE_ACCENT}`}>Central Marketplace</h2>
            <p className={`${colors.TEXT_MUTED} mb-8`}>Connect with talents for Blockchain AI, Web3, and Web2 services.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title="Service Listings" color={colors.MARKETPLACE_ACCENT} isDarkMode={isDarkMode}>
                    Browse or list services (Blockchain AI, Web3, Web2). Payments trigger a **10% remittance fee** upon completion.
                    <button className={`mt-3 block ${colors.BUTTON_BLUE} text-white font-semibold py-2 px-4 rounded transition-colors`}>View Listings</button>
                </SectionCard>
                
                <SectionCard title="Educational Subscriptions" color={colors.MARKETPLACE_ACCENT} isDarkMode={isDarkMode}>
                    Access MasterClass & educational subscriptions for high-demand Web3 skills.
                    <button className={`mt-3 block ${colors.BUTTON_BLUE} text-white font-semibold py-2 px-4 rounded transition-colors`}>Subscribe Now</button>
                </SectionCard>
            </div>
        </div>
    );
};

const HubDAO = ({ isDarkMode }) => {
    const colors = getColors(isDarkMode);
    return (
        <div className={`p-8 ${colors.TEXT_COLOR} bg-${colors.BG}`}>
            <h2 className={`text-3xl font-bold mb-6 text-${colors.DAO_ACCENT}`}>Innovation HUB DAO</h2>
            <p className={`${colors.TEXT_MUTED} mb-8`}>Governance and job fulfillment for community talents.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title="DAO Proposal System" color={colors.DAO_ACCENT} isDarkMode={isDarkMode}>
                    Create and vote on governance proposals. Requires staked $ANODE.
                    <button className={`mt-3 block ${colors.BUTTON_PURPLE} text-white font-semibold py-2 px-4 rounded transition-colors`}>Create Proposal</button>
                </SectionCard>
                
                <SectionCard title="Talent Score Lookups" color={colors.DAO_ACCENT} isDarkMode={isDarkMode}>
                    View verified scores and reputations of community talents. **15% remittance fee** applies to talents upon DAO Job completion.
                    <button className={`mt-3 block ${colors.BUTTON_PURPLE} text-white font-semibold py-2 px-4 rounded transition-colors`}>Lookup Scores</button>
                </SectionCard>
            </div>
        </div>
    );
};

const AdminTools = ({ isDarkMode }) => {
    const colors = getColors(isDarkMode);
    return (
        <div className={`p-8 ${colors.TEXT_COLOR} bg-${colors.BG}`}>
            <h2 className={`text-3xl font-bold mb-6 text-red-500`}>Admin Tools (Owner Access)</h2>
            <p className={`${colors.TEXT_MUTED} mb-8`}>Exclusive functions for $ANODE token management.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title="Minting Logic ($ANODE)" color="red-500" isDarkMode={isDarkMode}>
                    Execute the logic for minting new $ANODE tokens (Owner function).
                    <button className={`mt-3 block ${colors.BUTTON_RED} text-white font-semibold py-2 px-4 rounded transition-colors`}>Mint Tokens</button>
                </SectionCard>
                
                <SectionCard title="Airdrop $ANODE" color="red-500" isDarkMode={isDarkMode}>
                    Distribute $ANODE tokens to a list of connected TON wallet addresses.
                    <button className={`mt-3 block ${colors.BUTTON_RED} text-white font-semibold py-2 px-4 rounded transition-colors`}>Initiate Airdrop</button>
                </SectionCard>
            </div>
        </div>
    );
};

const MyEscrows = ({ isDarkMode }) => {
    const colors = getColors(isDarkMode);
    // Mock data and fee logic remains the same...
    const mockEscrow = { assetLockedAmount: 1000, originalServiceCost: 900, serviceType: 1, state: 'FUNDS_LOCKED' };
    const ESCROW_FEE_RATE = 0.10; 
    const CONDITIONAL_DAO_RATE = 0.15; 
    const CONDITIONAL_MARKETPLACE_RATE = 0.10; 

    const escrowServiceFee = mockEscrow.originalServiceCost * ESCROW_FEE_RATE;
    const conditionalRate = mockEscrow.serviceType === 1 ? CONDITIONAL_DAO_RATE : CONDITIONAL_MARKETPLACE_RATE;
    const conditionalFee = mockEscrow.originalServiceCost * conditionalRate;
    const totalFee = escrowServiceFee + conditionalFee;
    const finalPayout = mockEscrow.assetLockedAmount - totalFee;

    const isDaoEscrow = mockEscrow.serviceType === 1;
    const accentColor = isDaoEscrow ? colors.DAO_ACCENT : colors.MARKETPLACE_ACCENT;

    return (
        <div className={`p-8 ${colors.TEXT_COLOR}`}>
            <h2 className={`text-2xl font-semibold mb-4 text-${accentColor}`}>My Escrows & Dispute Resolution</h2>
            <div className={`bg-${colors.CARD_BG} p-6 rounded-xl shadow-2xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                
                <h3 className="text-xl font-bold mb-4 text-gray-400">Current Fee Policies</h3>
                <div className={`space-y-1 p-3 border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md mb-6`}>
                    <p className="text-yellow-400 font-semibold">1. Standard Escrow Fee: <span className="float-right font-mono text-lg">10%</span></p>
                    <p>2. DAO Talent Remittance Fee: <span className={`float-right font-mono text-lg text-${colors.DAO_ACCENT}`}>15%</span></p>
                    <p>3. Marketplace Remittance Fee: <span className={`float-right font-mono text-lg text-${colors.MARKETPLACE_ACCENT}`}>10%</span></p>
                </div>
                
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
                        <button className={`${colors.BUTTON_BLUE} text-white font-semibold rounded-lg px-4 py-2 transition-colors`}>OP_RELEASE</button>
                        <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors">OP_REFUND</button>
                        <button className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors">OP_DISPUTE</button>
                    </div>
                )}
            </div>
        </div>
    );
};
// --- End Feature Placeholders ---

const useWalletData = () => {
    const userFriendlyAddress = useTonAddress();
    const isConnected = !!userFriendlyAddress;
    const [balances, setBalances] = useState({ ton: '0.00', anode: '0.00' });
    const [isAdmin, setIsAdmin] = useState(false);
    
    useEffect(() => {
        const mockOwnerAddress = 'UQDXC1erzS2fub_CNmkdH1A3hRs6xMDrWBmOD2yQOZjRuruv'; 
        // Admin status relies on connection and matching the mock owner address
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
const Header = ({ tonBalance, anodeBalance, userFriendlyAddress, isConnected, isDarkMode, toggleTheme }) => {
    const colors = getColors(isDarkMode);
    return (
        <header className={`flex justify-between items-center p-4 ${colors.CARD_BG} shadow-xl sticky top-0 z-10 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3">
                <img 
                    src="/afro-node-logo.png" 
                    alt="AFRO-NODE Logo" 
                    className="h-8 w-8"
                    onError={(e) => { e.target.onerror = null; e.target.src="/vite.svg" }}
                />
                <h1 className={`text-2xl font-extrabold text-${colors.MARKETPLACE_ACCENT}`}>AFRO-NODE DApp</h1>
            </div>
            <div className="flex items-center space-x-4">
                <ThemeToggleButton isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                {isConnected && (
                    <div className={`text-sm ${colors.TEXT_MUTED} ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} p-2 rounded-lg font-mono`}>
                        <p>Address: <span className={`text-xs text-${colors.MARKETPLACE_ACCENT}`}>{shortenAddress(userFriendlyAddress)}</span></p>
                        <p>TON: <span className="font-semibold">{tonBalance}</span> | ANODE: <span className="font-semibold">{anodeBalance}</span></p>
                    </div>
                )}
                <TonConnectButton />
            </div>
        </header>
    );
};

// --- Navigation Links ---
const Navigation = ({ isAdmin, isDarkMode }) => {
    const colors = getColors(isDarkMode);
    const baseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
    const defaultColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';

    const getLinkClass = (to) => {
        let hoverClass = '';
        if (to === "/marketplace") hoverClass = isDarkMode ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-100 hover:text-blue-700';
        else if (to === "/dao") hoverClass = isDarkMode ? 'hover:bg-purple-600 hover:text-white' : 'hover:bg-purple-100 hover:text-purple-700';
        else hoverClass = isDarkMode ? 'hover:bg-gray-700 hover:text-blue-400' : 'hover:bg-gray-200 hover:text-blue-700';

        return `${defaultColor} ${hoverClass} ${baseClass}`;
    };

    return (
        <nav className={`bg-${colors.CARD_BG} shadow-inner border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className={getLinkClass("/")}>Dashboard/Wallet</Link>
                        <Link to="/marketplace" className={getLinkClass("/marketplace")}>Marketplace</Link>
                        <Link to="/dao" className={getLinkClass("/dao")}>Innovation HUB DAO</Link>
                        <Link to="/escrows" className={getLinkClass("/escrows")}>My Escrows</Link>
                        {/* ADMIN LINK ONLY APPEARS IF ADMIN STATUS IS TRUE */}
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
    const [isDarkMode, setIsDarkMode] = useState(true); // Start in Dark Mode
    const colors = getColors(isDarkMode);

    const toggleTheme = () => setIsDarkMode(prev => !prev);

    return (
        <Router>
            {/* The main container controls the global theme class */}
            <div className={`min-h-screen bg-${colors.BG}`}> 
                <Header 
                    tonBalance={tonBalance} 
                    anodeBalance={anodeBalance} 
                    userFriendlyAddress={userFriendlyAddress} 
                    isConnected={isConnected} 
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                />
                <Navigation isAdmin={isAdmin} isDarkMode={isDarkMode} />
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/" element={<Dashboard isDarkMode={isDarkMode} />} />
                        <Route path="/marketplace" element={<Marketplace isDarkMode={isDarkMode} />} />
                        <Route path="/dao" element={<HubDAO isDarkMode={isDarkMode} />} />
                        <Route path="/escrows" element={<MyEscrows isDarkMode={isDarkMode} />} />
                        <Route 
                            path="/admin" 
                            element={isAdmin ? <AdminTools isDarkMode={isDarkMode} /> : <Navigate to="/" replace />} 
                        /> 
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
