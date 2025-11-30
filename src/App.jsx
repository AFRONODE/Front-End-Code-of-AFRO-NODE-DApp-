import { useTonConnectUI } from '@tonconnect/ui-react';
import './App.css'; // assuming you have some app-specific css, otherwise remove
import { TonConnectButton } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/useMainContract';
import { useTonConnect } from './hooks/useTonConnect';
// import { withTonConnect } from './hooks/withTonConnect'; // Only uncomment if you have this specific HOC

// === YOUR ACTUAL TONKEEPER ADMIN WALLET ADDRESS ===
const ADMIN_WALLET_ADDRESS = "0qdfceyfiy0f5ntz4mipm_8cikamtz-36fj54ay4ilbayo4u";
// =================================================

function App() {
  const { connected } = useTonConnect();
  const {
    contract_address,
    counter_value,
    jetton_balance,
    sendIncrement,
    sendDeposit,
    sendWithdraw,
    sendMint,
    sendAirdrop
  } = useMainContract();
  const [tonConnectUI] = useTonConnectUI();

  // Check if the currently connected wallet is the admin wallet
  const connectedAddress = tonConnectUI?.account?.address;
  const isAdmin = connected && connectedAddress === ADMIN_WALLET_ADDRESS;

  const displayAddress = contract_address
    ? contract_address.slice(0, 4) + "..." + contract_address.slice(-4)
    : "Loading...";

  // Placeholder functions for new features (no actual logic here yet)
  const navigateToMarketplace = () => alert("Navigating to Central Marketplace...");
  const navigateToEscrow = () => alert("Navigating to Escrow...");
  const navigateToDAO = () => alert("Navigating to Innovation Hub DAO...");
  const navigateToStaking = () => alert("Navigating to ANODE Staking...");
  const navigateToP2PTransfer = () => alert("Navigating to P2P ANODE Transfer...");
  const createDaoProposal = () => alert("Creating DAO proposal for talents...");

  // Example marketplace items for demonstration
  const marketplaceItems = [
    { id: 1, title: "Web3 DApp Development Masterclass", category: "Web3", price: "200 $ANODE" },
    { id: 2, title: "AI-Powered Smart Contract Audits", category: "AI", price: "Flexible" },
    { id: 3, title: "Blockchain Security Consultation", category: "Blockchain", price: "150 $ANODE/hr" },
    { id: 4, title: "Custom Web2 Frontend Development", category: "Web2", price: "Starts at 500 $ANODE" },
  ];

  return (
    <div className="app-container p-4 bg-anode-dark min-h-screen text-white font-sans">
      <div className="header flex justify-between items-center mb-8">
        <img src="/afro-node-logo.png" alt="AFRO-NODE Logo" className="h-12" /> {/* Absolute path for logo */}
        <TonConnectButton />
      </div>

      {/* Main DApp Card - Existing Functionality */}
      <div className="card bg-anode-bg p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-4 text-anode-primary">AFRO-NODE DApp Core</h2>
        <p className="text-anode-text mb-2">
          Contract Address: <code className="text-anode-primary-light">{displayAddress}</code>
        </p>
        <p className="text-anode-text mb-2">
          Counter Value: <span className="font-semibold text-anode-accent">{counter_value ?? "Loading..."}</span>
        </p>
        <p className="text-anode-text mb-4">
          Your Jetton Balance: <span className="font-semibold text-anode-accent">{jetton_balance ?? "Loading..."}</span>
        </p>

        <div className="actions space-y-4">
          <button
            onClick={sendIncrement}
            className={`btn bg-anode-primary hover:bg-anode-primary/80 text-white font-bold py-2 px-4 rounded w-full transition-colors duration-200 ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!connected}
          >
            Increment Counter
          </button>
          <button
            onClick={sendDeposit}
            className={`btn bg-anode-secondary hover:bg-anode-secondary/80 text-white font-bold py-2 px-4 rounded w-full transition-colors duration-200 ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!connected}
          >
            Deposit 2 TON
          </button>
          <button
            onClick={sendWithdraw}
            className={`btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full transition-colors duration-200 ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!connected}
          >
            Withdraw 1 TON
          </button>
        </div>
      </div>

      {/* New: Core AFRO-NODE DApp Features Navigation */}
      <div className="features-card bg-anode-bg p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">Core AFRO-NODE Features</h3>
        <div className="feature-grid grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={navigateToMarketplace}
            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded text-lg transition-colors duration-200"
          >
            🌐 Central Marketplace
          </button>
          <button
            onClick={navigateToEscrow}
            className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded text-lg transition-colors duration-200"
          >
            🔒 Escrow Services + Calculator
          </button>
          <button
            onClick={navigateToDAO}
            className="btn bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded text-lg transition-colors duration-200"
          >
            💡 Innovation Hub DAO
          </button>
          <button
            onClick={navigateToP2PTransfer}
            className="btn bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded text-lg transition-colors duration-200"
          >
            ↔️ P2P $ANODE Transfer
          </button>
          <button
            onClick={navigateToStaking}
            className="btn bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded text-lg transition-colors duration-200"
          >
            🌱 $ANODE Staking
          </button>
          <button
            onClick={createDaoProposal}
            className="btn bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded text-lg transition-colors duration-200"
          >
            🗳️ DAO Proposal: African Tech Talents
          </button>
        </div>
      </div>

      {/* New: Dedicated Marketplace Listings Section */}
      <div className="marketplace-listings-card bg-anode-bg p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">Marketplace Listings</h3>
        <p className="text-anode-text mb-4">
          Browse various Blockchain, AI, Web3, and Web2 services, alongside Masterclass Educational Subscriptions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketplaceItems.map(item => (
            <div key={item.id} className="bg-anode-dark p-4 rounded shadow">
              <h4 className="font-semibold text-anode-accent">{item.title}</h4>
              <p className="text-sm text-anode-text">Category: {item.category}</p>
              <p className="text-sm text-anode-text">Price: {item.price}</p>
              <button className="mt-2 bg-anode-primary text-white text-xs px-3 py-1 rounded hover:bg-anode-primary/80">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>


      {/* Remittance and Fee Structure Display */}
      <div className="fees-card bg-anode-bg p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">Fee & Remittance Structure</h3>
        <ul className="list-disc list-inside text-anode-text space-y-2">
          <li>
            <span className="font-semibold text-anode-accent">10% Escrow Fee:</span> Applied to all escrowed transactions.
          </li>
          <li>
            <span className="font-semibold text-anode-accent">10% Remittance:</span> From payments for general tasks completed by users in the Central Marketplace.
          </li>
          <li>
            <span className="font-semibold text-anode-accent">15% Remittance:</span> From payments to talents approved by the DAO.
          </li>
        </ul>
      </div>

      {/* Admin Tools - Conditionally Rendered */}
      {isAdmin && (
        <div className="admin-card bg-anode-bg p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-anode-primary">Admin Tools (Owner)</h3>
          <div className="admin-actions space-y-4">
            <button
              onClick={sendMint}
              className={`btn bg-anode-mint hover:bg-anode-mint/80 text-white font-bold py-2 px-4 rounded w-full transition-colors duration-200 ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!connected}
            >
              Mint 1000 $ANODE Tokens
            </button>
            <button
              onClick={sendAirdrop}
              className={`btn bg-anode-airdrop hover:bg-anode-airdrop/80 text-white font-bold py-2 px-4 rounded w-full transition-colors duration-200 ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!connected}
            >
              Airdrop 500 $ANODE Tokens
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
