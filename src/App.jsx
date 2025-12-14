import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/useMainContract';
import { useTonConnect } from './hooks/useTonConnect';
import { Address } from '@ton/core';

const ADMIN_WALLET_ADDRESS = "0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u";

function App() {
  const { connected } = useTonConnect();
  const [tonConnectUI] = useTonConnectUI(); 
  
  const {
    contract_address, // Restored original variable name
    counter_value,
    jetton_balance,
    sendIncrement,
    sendDeposit,
    sendWithdraw,
    sendMint,
    sendAirdrop
  } = useMainContract() || {}; 

  let isAdmin = false;
  const connectedAddress = tonConnectUI?.account?.address;

  // Optimized Admin Check
  if (connected && connectedAddress) {
    try {
      const connectedFriendly = Address.parse(connectedAddress).toString();
      const adminFriendly = Address.parse(ADMIN_WALLET_ADDRESS).toString();
      if (connectedFriendly === adminFriendly) {
        isAdmin = true;
      }
    } catch (e) {
      // Silent catch to prevent UI crash
    }
  }

  // Restore your original Initializing screen
  if (!contract_address) {
    return (
      <div className="app-container p-4 bg-anode-dark min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-anode-primary">Initializing DApp...</h2>
        <p className="text-anode-text mt-2">Connecting to TON network and loading contract data.</p>
        <p className="text-anode-text mt-1">If this persists, check network status or refresh the page.</p>
      </div>
    );
  }

  const displayAddress = contract_address
    ? contract_address.slice(0, 4) + "..." + contract_address.slice(-4)
    : "Loading...";

  const navigateToMarketplace = () => alert("Navigating to Central Marketplace.");
  const navigateToEscrow = () => alert("Navigating to Escrow Services.");
  const navigateToDAO = () => alert("Navigating to Innovation Hub DAO.");
  const navigateToStaking = () => alert("Navigating to $ANODE Staking.");
  const navigateToP2PTransfer = () => alert("Navigating to P2P $ANODE Transfer.");
  const createDaoProposal = () => alert("Creating DAO Proposal.");

  const marketplaceItems = [
    { id: 1, title: "Web3 DApp Development Masterclass" },
    { id: 2, title: "AI-Powered Smart Contract Audit" },
    { id: 3, title: "Blockchain Security Consultation" },
    { id: 4, title: "Custom Web2 Frontend Development" },
  ];

  return (
    <div className="app-container p-4 bg-anode-dark min-h-screen">
      
      <div className="header flex justify-between items-center mb-6" style={{display: 'flex', alignItems: 'center', padding: '10px'}}>
        <img 
            src="/afro-node-logo.png/Screenshot_20250607-124053.jpg" 
            alt="AFRO-NODE DApp Logo" 
            className="h-10" 
            style={{height: '50px', marginRight: '20px'}}
        />
        <h1 className="text-2xl font-bold text-white hidden md:block">AFRO-NODE DApp</h1>
        <img 
            src="/anode-token.png/1764785319748~2_1.jpg" 
            alt="$ANODE Token Logo" 
            className="h-10"
            style={{height: '50px', marginLeft: '20px'}}
        />
        <div style={{marginLeft: 'auto'}}>
            <TonConnectButton />
        </div>
      </div>

      <div className="card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-4 text-anode-primary">Smart Contract Status</h2>
        <p className="text-anode-text mb-2">
          Contract Address: <code className="text-anode-secondary break-all">{displayAddress}</code>
        </p>
        <p className="text-anode-text mb-2">
          Counter Value: <span className="font-semibold text-white">{(counter_value ?? 'N/A').toString()}</span>
        </p>
        <p className="text-anode-text mb-4">
          Your Jetton Balance: <span className="font-semibold text-white">{(jetton_balance ?? 'N/A').toString()} $ANODE</span>
        </p>

        <div className="actions space-y-4">
          <button
            onClick={sendIncrement}
            className={`btn bg-anode-primary hover:bg-anode-primary-dark ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!connected}
          >
            Increment Counter
          </button>
          <button
            onClick={sendDeposit}
            className={`btn bg-anode-secondary hover:bg-anode-secondary-dark ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!connected}
          >
            Deposit 2 TON
          </button>
          <button
            onClick={sendWithdraw}
            className={`btn bg-red-600 hover:bg-red-700 ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!connected}
          >
            Withdraw 1 TON
          </button>
        </div>
      </div>

      <div className="features-card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">AFRO-NODE Ecosystem Features</h3>
        <div className="feature-grid grid grid-cols-2 md:grid-cols-3 gap-4">
          <button onClick={navigateToMarketplace} className="btn bg-blue-600 hover:bg-blue-700 transition-colors py-3">
            🌐 Central Marketplace
          </button>
          <button onClick={navigateToEscrow} className="btn bg-green-600 hover:bg-green-700 transition-colors py-3">
            🔒 Escrow Services + Calculator
          </button>
          <button onClick={navigateToDAO} className="btn bg-purple-600 hover:bg-purple-700 transition-colors py-3">
            💡 Innovation Hub DAO
          </button>
          <button onClick={navigateToP2PTransfer} className="btn bg-yellow-600 hover:bg-yellow-700 transition-colors py-3">
            ↔️ P2P $ANODE Transfer
          </button>
          <button onClick={navigateToStaking} className="btn bg-pink-600 hover:bg-pink-700 transition-colors py-3">
            🌱 $ANODE Staking
          </button>
          <button onClick={createDaoProposal} className="btn bg-orange-600 hover:bg-orange-700 transition-colors py-3">
            🗳️ DAO Proposal: African Tech Talents
          </button>
        </div>
      </div>

      <div className="marketplace-listings-card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">Marketplace Listings</h3>
        <p className="text-anode-text mb-4">Browse various Blockchain, AI, Web3, and Tech services available on the network.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketplaceItems.map(item => (
            <div key={item.id} className="bg-anode-dark p-4 rounded-lg border border-anode-secondary/50">
              <h4 className="font-semibold text-anode-primary mb-1">{item.title}</h4>
              <p className="text-sm text-anode-text-light mb-2">Service offered by a verified talent.</p>
              <button className="mt-2 bg-anode-primary hover:bg-anode-primary-dark text-white font-bold py-1 px-3 rounded text-sm transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="fees-card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">Remittance & Fee Structure</h3>
        <ul className="list-disc list-inside text-anode-text space-y-2">
          <li><span className="font-semibold text-white">Escrow Service Fee:</span> 10% of the cost of the service/job.</li>
          <li><span className="font-semibold text-white">Marketplace Remittance:</span> 10% remittance from payments to users who completed published tasks.</li>
          <li><span className="font-semibold text-white">DAO Talent Remittance:</span> 15% remittance percentage from payments to Talents in the Innovation Hub DAO.</li>
        </ul>
      </div>

      {isAdmin && (
        <div className="admin-card bg-anode-bg p-6 rounded-xl shadow-lg border-2 border-anode-secondary">
          <h3 className="text-xl font-bold mb-4 text-red-500">ADMIN TOOLS</h3>
          <p className="text-anode-text mb-4">Admin wallet **{connectedAddress?.slice(0, 8)}...** detected. Mint and Airdrop functions available.</p>
          <div className="admin-actions space-y-4">
            <button onClick={sendMint} className="btn bg-anode-mint hover:bg-anode-mint-dark" disabled={!connected}>
              Mint 1000 $ANODE Tokens
            </button>
            <button onClick={sendAirdrop} className="btn bg-anode-airdrop hover:bg-anode-airdrop-dark" disabled={!connected}>
              Airdrop 500 $ANODE Tokens
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
