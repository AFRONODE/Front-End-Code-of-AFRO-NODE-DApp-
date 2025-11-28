import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { useState, useEffect, useCallback } from 'react';
import { Address } from '@ton/core';
import { getHttpEndpoint } from '@ton/ton';

// --- Placeholder Components for Structure ---
const Dashboard = () => <div className="p-8 text-white"><h2>Dashboard/Wallet</h2><p>P2P Transfer & Burning Forms go here. (ANODE Transfer & Staking)</p></div>;
const Marketplace = () => <div className="p-8 text-white"><h2>Marketplace</h2><p>Service Listings & Payment Gateway go here. (Blockchain AI/Web3 Services)</p></div>;
const HubDAO = () => <div className="p-8 text-white"><h2>Innovation HUB DAO</h2><p>Registration, Score Lookups, and Proposal Forms go here. (DAO Proposal Logic)</p></div>;
const AdminTools = () => <div className="p-8 text-white"><h2>Admin Tools</h2><p>Minting and Airdrop Forms go here. (Minting & Airdrop Logic)</p></div>;
// The Escrows component will contain the TRIPLE DEDUCTION FEE LOGIC
const MyEscrows = () => {
    // Mock data for demonstration of fee logic
    const mockEscrow = {
        assetLockedAmount: 1000, // ANODE or TON
        originalServiceCost: 900,
        serviceType: 1, // 1 for DAO_JOB, 2 for MARKETPLACE_TASK
        state: 'FUNDS_LOCKED',
    };

    const ESCROW_FEE_RATE = 0.10; // 10%
    const CONDITIONAL_DAO_RATE = 0.15; // 15% for DAO_JOB (Type 1)
    const CONDITIONAL_MARKETPLACE_RATE = 0.10; // 10% for MARKETPLACE_TASK (Type 2)

    const escrowServiceFee = mockEscrow.originalServiceCost * ESCROW_FEE_RATE;
    const conditionalRate = mockEscrow.serviceType === 1 ? CONDITIONAL_DAO_RATE : CONDITIONAL_MARKETPLACE_RATE;
    const conditionalFee = mockEscrow.originalServiceCost * conditionalRate;
    const totalFee = escrowServiceFee + conditionalFee;
    const finalPayout = mockEscrow.assetLockedAmount - totalFee;

    return (
        <div className="p-8 text-white">
            <h2 className="text-2xl font-semibold mb-4 text-anode-primary">My Escrows & Dispute Resolution</h2>
            <div className="bg-anode-bg p-6 rounded-lg shadow-xl">
                <h3 className="text-xl font-medium mb-4">Escrow Details (Mock)</h3>
                <p><strong>Locked Amount:</strong> {mockEscrow.assetLockedAmount} ANODE</p>
                <p><strong>Service Cost:</strong> {mockEscrow.originalServiceCost} ANODE</p>
                <p className="mb-4"><strong>Service Type:</strong> {mockEscrow.serviceType === 1 ? 'DAO Job (1)' : 'Marketplace Task (2)'}</p>

                <h4 className="text-lg font-bold mt-4 text-red-400">⚠️ Fee Breakdown (Triple Deduction Logic)</h4>
                <div className="space-y-2 mt-2 p-3 border border-red-500 rounded-md">
                    <p>1. Escrow Service Fee (10%): <span className="float-right font-mono">{escrowServiceFee.toFixed(2)} ANODE</span></p>
                    <p>2. Conditional Remittance Fee ({conditionalRate * 100}%): <span className="float-right font-mono">{conditionalFee.toFixed(2)} ANODE</span></p>
                    <hr className="border-gray-600"/>
                    <p className="font-bold">3. Total Fee Deduction: <span className="float-right font-mono text-red-400">{totalFee.toFixed(2)} ANODE</span></p>
                    <hr className="border-gray-600"/>
                    <p className="font-extrabold text-green-400 text-lg">Final Payout (Net): <span className="float-right font-mono">{finalPayout.toFixed(2)} ANODE</span></p>
                </div>
                
                {/* Client Actions */}
                {mockEscrow.state === 'FUNDS_LOCKED' && (
                    <div className="mt-6 flex space-x-3">
                        <button className="bg-green-600 hover:bg-green-700 text-white">OP_RELEASE</button>
                        <button className="bg-yellow-600 hover:bg-yellow-700 text-white">OP_REFUND</button>
                        <button className="bg-red-600 hover:bg-red-700 text-white">OP_DISPUTE</button>
                    </div>
                )}
            </div>
        </div>
    );
};
// --- End Placeholder Components ---

// NOTE: Fetching actual balances requires complex contract interaction wrappers (Jetton Wallet)
const useWalletData = () => {
    const userFriendlyAddress = useTonAddress();
    const isConnected = !!userFriendlyAddress;
    const [balances, setBalances] = useState({ ton: '0.00', anode: '0.00' });
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Replace these with your actual contract addresses from Netlify ENV
    const ANODE_MASTER_ADDRESS = 'EQD...anode_master...'; 
    const HUB_DAO_ADDRESS = 'EQC...hub_dao...';
    
    // Mocking the balance fetch and admin check for now
    useEffect(() => {
        if (isConnected) {
            // Check if user is ANODE Master Owner or HubDAO Owner (for Admin access)
            const mockOwnerAddress = 'UQDXC1erzS2fub_CNmkdH1A3hRs6xMDrWBmOD2yQOZjRuruv'; 
            if (userFriendlyAddress === mockOwnerAddress) {
                setIsAdmin(true);
            }
            
            // Mock balance fetching
            setBalances({ ton: '15.42', anode: '875.00' });
        } else {
            setBalances({ ton: '0.00', anode: '0.00' });
            setIsAdmin(false);
        }
    }, [userFriendlyAddress, isConnected]);

    return { ...balances, isConnected, userFriendlyAddress, isAdmin };
};

// Helper to shorten the address
const shortenAddress = (address) => {
    if (!address) return 'N/A';
    return Address.isFriendly(address) ? address.slice(0, 4) + '...' + address.slice(-4) : 'Invalid Address';
};

// --- Main Header Component (Requirement 1. Header) ---
const Header = ({ tonBalance, anodeBalance, userFriendlyAddress, isConnected }) => {
    return (
        <header className="flex justify-between items-center p-4 bg-gray-800 shadow-xl sticky top-0 z-10">
            <h1 className="text-2xl font-extrabold text-anode-primary">AFRO-NODE DApp</h1>
            <div className="flex items-center space-x-4">
                {isConnected && (
                    <div className="text-sm text-gray-300 bg-gray-700 p-2 rounded-lg font-mono">
                        <p>Address: <span className="text-xs text-cyan-400">{shortenAddress(userFriendlyAddress)}</span></p>
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
    const baseClass = "text-gray-300 hover:text-anode-primary px-3 py-2 rounded-md text-sm font-medium transition-colors";

    return (
        <nav className="bg-gray-700 shadow-inner">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className={baseClass}>Dashboard/Wallet</Link>
                        <Link to="/marketplace" className={baseClass}>Marketplace</Link>
                        <Link to="/dao" className={baseClass}>Innovation HUB DAO</Link>
                        <Link to="/escrows" className={baseClass}>My Escrows</Link>
                        {/* Admin Tools (Only visible if connected address matches owner) */}
                        {isAdmin && <Link to="/admin" className={baseClass}>Admin Tools</Link>}
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
            <div className="min-h-screen bg-anode-dark">
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
                        {/* Admin route protected by component visibility in Navigation and a potential check within the component */}
                        <Route 
                            path="/admin" 
                            element={isAdmin ? <AdminTools /> : <Navigate to="/" replace />} 
                        /> 
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                <footer className="text-center py-4 text-xs text-gray-500">
                    AFRO-NODE DApp Testnet UI (V2 - Fee Logic Corrected)
                </footer>
            </div>
        </Router>
    );
}

export default App;
