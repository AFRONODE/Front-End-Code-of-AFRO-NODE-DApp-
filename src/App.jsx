import { useTonConnectUI } from '@tonconnect/ui-react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/useMainContract';
import { useTonConnect } from './hooks/useTonConnect';
// import { withTonConnect } from './hooks/withTonConnect';

// === YOUR ACTUAL TONKEEPER ADMIN WALLET ADDRESS GOES HERE ===
const ADMIN_WALLET_ADDRESS = "0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u";
// ==========================================================

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

  // Check if the currently connected wallet is the Admin wallet
  const connectedAddress = tonConnectUI?.account?.address;
  const isAdmin = connected && connectedAddress === ADMIN_WALLET_ADDRESS;

  const displayAddress = contract_address
    ? contract_address.slice(0, 4) + "..." + contract_address.slice(-4)
    : "Loading...";

  // Placeholder functions for new features (no actual logic yet)
  const navigateToMarketplace = () => alert("Navigating to Central Marketplace");
  const navigateToEscrow = () => alert("Navigating to Escrow Services + Calculator");
  const navigateToDAO = () => alert("Navigating to Innovation Hub DAO");
  const navigateToStaking = () => alert("Navigating to $ANODE Staking");
  const navigateToP2PTransfer = () => alert("Navigating to P2P $ANODE Transfer");
  const createDaoProposal = () => alert("Creating DAO Proposal: African Tech Talents");

  // Example marketplace items for demonstration
  const marketplaceItems = [
    { id: 1, title: "Web3 DApp Development Masterclass", price: "250 $ANODE" },
    { id: 2, title: "AI-Powered Smart Contract Audit", price: "500 $ANODE" },
    { id: 3, title: "Blockchain Security Consultation", price: "100 $ANODE" },
    { id: 4, title: "Custom Web2 Frontend Development", price: "150 $ANODE" },
  ];

  return (
    <div className="app-container p-4 bg-anode-dark min-h-screen">
      <div className="header flex justify-between items-center mb-6">
        <img src="/afro-node-logo.png" alt="AFRO-NODE Logo" className="w-16 h-16"/>
        <TonConnectButton />
      </div>

      {/* Main DApp Card - Existing Functionality (Counter/TON Integration) */}
      <div className="card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-4 text-anode-primary">DApp Core Functionality</h2>
        <p className="text-anode-text mb-2">
          Contract Address: <code className="text-anode-text">{displayAddress}</code>
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
            className={`btn bg-anode-primary hover:bg-anode-primary-light text-white font-bold py-2 px-4 rounded transition-colors w-full`}
            disabled={!connected}
          >
            Increment Counter
          </button>
          <button
            onClick={sendDeposit}
            className={`btn bg-anode-secondary hover:bg-anode-secondary/80 text-white font-bold py-2 px-4 rounded transition-colors w-full`}
            disabled={!connected}
          >
            Deposit 2 TON
          </button>
          <button
            onClick={sendWithdraw}
            className={`btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors w-full`}
            disabled={!connected}
          >
            Withdraw 1 TON
          </button>
        </div>
      </div>

      {/* New: Core AFRO-NODE DApp Features Navigation */}
      <div className="features-card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">Feature Navigation Hub</h3>
        <div className="feature-grid grid grid-cols-2 gap-4">
          <button
            onClick={navigateToMarketplace}
            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-2 rounded transition-colors"
          >
            🌐 Central Marketplace
          </button>
          <button
            onClick={navigateToEscrow}
            className="btn bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-2 rounded transition-colors"
          >
            🔒 Escrow Services + Calculator
          </button>
          <button
            onClick={navigateToDAO}
            className="btn bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-2 rounded transition-colors"
          >
            💡 Innovation Hub DAO
          </button>
          <button
            onClick={navigateToP2PTransfer}
            className="btn bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-2 rounded transition-colors"
          >
            ↔️ P2P $ANODE Transfer
          </button>
          <button
            onClick={navigateToStaking}
            className="btn bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-2 rounded transition-colors"
          >
            🌱 $ANODE Staking
          </button>
          <button
            onClick={createDaoProposal}
            className="btn bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-2 rounded transition-colors"
          >
            🗳️ DAO Proposal: African Tech Talents
          </button>
        </div>
      </div>

      {/* New: Dedicated Marketplace Listings Section */}
      <div className="marketplace-listings-card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">Marketplace Listings</h3>
        <p className="text-anode-text mb-4">
          Browse various Blockchain, AI, Web3, and Tech services available from the community.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketplaceItems.map(item => (
            <div key={item.id} className="bg-anode-dark p-4 rounded-lg border border-anode-primary/50">
              <h4 className="font-semibold text-anode-text">{item.title}</h4>
              <p className="text-sm text-anode-text mt-1">Price: <span className="text-anode-accent font-medium">{item.price}</span></p>
              <button className="mt-2 bg-anode-primary hover:bg-anode-primary/80 text-white text-sm py-1 px-3 rounded">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Remittance and Fee Structure Display */}
      <div className="fees-card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">Fee Structure & Remittance</h3>
        <ul className="list-disc list-inside text-anode-text space-y-2">
          <li>
            <span className="font-semibold text-anode-accent">Marketplace Fee:</span> 5% of service cost (paid in $ANODE).
          </li>
          <li>
            <span className="font-semibold text-anode-accent">Escrow Fee:</span> 2% of transaction value.
          </li>
          <li>
            <span className="font-semibold text-anode-accent">DAO Treasury:</span> 100% of all platform fees are directed to the Innovation Hub DAO Treasury.
          </li>
        </ul>
      </div>

      {/* Admin Tools - Conditionally Rendered */}
      {isAdmin && (
        <div className="admin-card bg-anode-bg p-6 rounded-xl shadow-lg border border-anode-mint">
          <h3 className="text-xl font-bold mb-4 text-anode-mint">Admin Tools</h3>
          <div className="admin-actions space-y-4">
            <button
              onClick={sendMint}
              className={`btn bg-anode-mint hover:bg-anode-mint/80 text-white font-bold py-2 px-4 rounded transition-colors w-full`}
              disabled={!connected}
            >
              Mint 1000 $ANODE Tokens
            </button>
            <button
              onClick={sendAirdrop}
              className={`btn bg-anode-airdrop hover:bg-anode-airdrop/80 text-white font-bold py-2 px-4 rounded transition-colors w-full`}
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
