import { useTonConnectUI, TonConnectButton } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/useMainContract';
import { useTonConnect } from './hooks/useTonConnect';

// @dev Access Control Constants
const ROOT_ID = "0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u";
const ROOT_RAW = "0:df084661623d05e67be6ecf8c22933ffdc88a0264d9fb7e9f278e00cb82256c0";

function App() {
  const { connected, walletAddress } = useTonConnect();
  const [tonConnectUI] = useTonConnectUI(); 
  
  const {
    contract_address,
    counter_value,
    jetton_balance,
    sendIncrement,
    sendDeposit,
    sendWithdraw,
    sendMint,
    sendAirdrop
  } = useMainContract() || {}; 

  // Auth: Admin verification for emission controls
  const isAdmin = connected && (
    walletAddress === ROOT_ID || 
    walletAddress === ROOT_RAW
  );

  if (!contract_address) {
    return (
      <div className="app-container p-4 bg-anode-dark min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-anode-primary">Initializing DApp...</h2>
        <p className="text-anode-text mt-2">Connecting to TON network...</p>
      </div>
    );
  }

  const displayAddress = contract_address
    ? `${contract_address.slice(0, 4)}...${contract_address.slice(-4)}`
    : "Loading...";

  const navigateToMarketplace = () => alert("Redirecting to Marketplace.");
  const navigateToEscrow = () => alert("Redirecting to Escrow.");
  const navigateToDAO = () => alert("Redirecting to DAO Hub.");
  const navigateToStaking = () => alert("Redirecting to Staking.");
  const navigateToP2PTransfer = () => alert("Redirecting to P2P.");
  const createDaoProposal = () => alert("Opening Proposal Wizard.");

  const marketplaceItems = [
    { id: 1, title: "Web3 DApp Development Masterclass" },
    { id: 2, title: "AI-Powered Smart Contract Audit" },
    { id: 3, title: "Blockchain Security Consultation" },
    { id: 4, title: "Custom Web2 Frontend Development" },
  ];

  return (
    <div className="app-container p-4 bg-anode-dark min-h-screen">
      
      {/* UI: Global Header */}
      <div className="header flex justify-between items-center mb-6" style={{display: 'flex', alignItems: 'center', padding: '10px'}}>
        <img 
            src="/afro-node-logo.png/Screenshot_20250607-124053.jpg" 
            alt="Logo" 
            style={{height: '50px', marginRight: '20px'}}
        />
        <h1 className="text-2xl font-bold text-white hidden md:block">AFRO-NODE DApp</h1>
        <img 
            src="/anode-token.png/1764785319748~2_1.jpg" 
            alt="Token" 
            style={{height: '50px', marginLeft: '20px'}}
        />
        <div style={{marginLeft: 'auto'}}>
            <TonConnectButton />
        </div>
      </div>

      {/* Logic: Contract State */}
      <div className="card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-4 text-anode-primary">System Status</h2>
        <p className="text-anode-text mb-2">
          Contract: <code className="text-anode-secondary break-all">{displayAddress}</code>
        </p>
        <p className="text-anode-text mb-2">
          Counter: <span className="font-semibold text-white">{counter_value?.toString() || '0'}</span>
        </p>
        <p className="text-anode-text mb-4">
          $ANODE Balance: <span className="font-semibold text-white">{jetton_balance?.toString() || '0'}</span>
        </p>

        <div className="actions space-y-4">
          <button onClick={sendIncrement} className="btn bg-anode-primary" disabled={!connected}>Increment</button>
          <button onClick={sendDeposit} className="btn bg-anode-secondary" disabled={!connected}>Deposit 2 TON</button>
          <button onClick={sendWithdraw} className="btn bg-red-600" disabled={!connected}>Withdraw 1 TON</button>
        </div>
      </div>

      {/* Feature: Navigation Grid */}
      <div className="features-card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">Ecosystem Hub</h3>
        <div className="feature-grid grid grid-cols-2 md:grid-cols-3 gap-4">
          <button onClick={navigateToMarketplace} className="btn bg-blue-600">🌐 Marketplace</button>
          <button onClick={navigateToEscrow} className="btn bg-green-600">🔒 Escrow</button>
          <button onClick={navigateToDAO} className="btn bg-purple-600">💡 Innovation DAO</button>
          <button onClick={navigateToP2PTransfer} className="btn bg-yellow-600">↔️ P2P Transfer</button>
          <button onClick={navigateToStaking} className="btn bg-pink-600">🌱 Staking</button>
          <button onClick={createDaoProposal} className="btn bg-orange-600">🗳️ DAO Proposal</button>
        </div>
      </div>

      {/* Feature: Marketplace Feed */}
      <div className="marketplace-listings-card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">Service Listings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketplaceItems.map(item => (
            <div key={item.id} className="bg-anode-dark p-4 rounded-lg border border-anode-secondary/50">
              <h4 className="font-semibold text-anode-primary mb-1">{item.title}</h4>
              <button className="mt-2 bg-anode-primary text-white font-bold py-1 px-3 rounded text-sm">View Listing</button>
            </div>
          ))}
        </div>
      </div>

      {/* UI: Fee Disclosure */}
      <div className="fees-card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">Network Fees</h3>
        <ul className="list-disc list-inside text-anode-text space-y-2">
          <li>Escrow: 10%</li>
          <li>Marketplace: 10%</li>
          <li>DAO Hub: 15%</li>
        </ul>
      </div>

      {/* Feature: Administrative Controls */}
      {isAdmin && (
        <div className="admin-card bg-anode-bg p-6 rounded-xl shadow-lg border-2 border-anode-secondary">
          <h3 className="text-xl font-bold mb-4 text-red-500">ROOT PRIVILEGES</h3>
          <p className="text-anode-text mb-4">Auth: {walletAddress?.slice(0, 10)} active.</p>
          <div className="admin-actions space-y-4">
            <button onClick={sendMint} className="btn bg-anode-mint" disabled={!connected}>Emission: 1000 $ANODE</button>
            <button onClick={sendAirdrop} className="btn bg-anode-airdrop" disabled={!connected}>Airdrop: 500 $ANODE</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
