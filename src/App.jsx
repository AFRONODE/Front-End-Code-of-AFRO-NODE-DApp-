import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/useMainContract';
import { useTonConnect } from './hooks/useTonConnect';
import { Address } from '@ton/core';
import { useState } from 'react';

const ADMIN_WALLET_ADDRESS = "0QDfCEYFiy0F5ntz4MIpM_8ciKAmTZ-36fJ54Ay4IlbAyo4u";

function App() {
  const { connected } = useTonConnect();
  const [tonConnectUI] = useTonConnectUI();
  const [isPending, setIsPending] = useState(false);

  const {
    contract_address,
    marketplace_address,
    escrow_address,
    dao_address,
    counter_value,
    jetton_balance,
    sendIncrement,
    sendDeposit,
    sendWithdraw,
    sendMint,
    sendAirdrop,
    sendAnodePayment
  } = useMainContract() || {};

  const handleAction = async (task) => {
    setIsPending(true);
    try {
      await task;
    } catch (e) {
      console.error(e);
    } finally {
      setIsPending(false);
    }
  };

  let isAdmin = false;
  const connectedAddress = tonConnectUI?.account?.address;
  if (connected && connectedAddress) {
    try {
      const connectedFriendly = Address.parse(connectedAddress).toString();
      const adminFriendly = Address.parse(ADMIN_WALLET_ADDRESS).toString();
      if (connectedFriendly === adminFriendly) isAdmin = true;
    } catch (e) {}
  }

  if (!contract_address) {
    return (
      <div className="app-container p-4 bg-anode-dark min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-bold text-anode-primary">Initializing DApp...</h2>
        <p className="text-anode-text mt-2">Connecting to TON network...</p>
      </div>
    );
  }

  const marketplaceItems = [
    { id: 1, title: "Web3 DApp Development Masterclass", price: "50" },
    { id: 2, title: "AI-Powered Smart Contract Audit", price: "150" },
    { id: 3, title: "Blockchain Security Consultation", price: "100" },
    { id: 4, title: "Custom Web2 Frontend Development", price: "80" },
  ];

  return (
    <div className="app-container p-4 bg-anode-dark min-h-screen relative">
      
      {isPending && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
           <div className="p-6 bg-anode-bg rounded-2xl border border-anode-primary text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-anode-primary mx-auto mb-4"></div>
              <p className="text-white font-bold text-xl">Transaction Pending...</p>
              <p className="text-anode-text text-sm mt-2">Check your wallet and wait for block confirmation.</p>
           </div>
        </div>
      )}

      <div className="header flex justify-between items-center mb-6" style={{display: 'flex', alignItems: 'center', padding: '10px'}}>
        <img src="/afro-node-logo.png" alt="Logo" style={{height: '50px', marginRight: '20px'}} />
        <h1 className="text-2xl font-bold text-white hidden md:block">AFRO-NODE DApp</h1>
        <img src="/anode-token.png" alt="$ANODE" style={{height: '50px', marginLeft: '20px'}} />
        <div style={{marginLeft: 'auto'}}><TonConnectButton /></div>
      </div>

      <div className="card bg-anode-bg p-6 rounded-xl shadow-lg mb-6 border border-white/5">
        <h2 className="text-2xl font-bold mb-4 text-anode-primary">Smart Contract Status</h2>
        <p className="text-anode-text mb-2 text-sm">Contract: <code className="text-anode-secondary">{contract_address.slice(0,6)}...{contract_address.slice(-4)}</code></p>
        <p className="text-anode-text mb-2">Counter: <span className="text-white">{counter_value}</span></p>
        <p className="text-anode-text mb-4">Balance: <span className="text-white">{jetton_balance} $ANODE</span></p>
        <div className="actions flex flex-col gap-3">
          <button onClick={() => handleAction(sendIncrement())} className="btn bg-anode-primary">Increment Counter</button>
          <button onClick={() => handleAction(sendDeposit())} className="btn bg-anode-secondary">Deposit 2 TON</button>
        </div>
      </div>

      <div className="features-card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">AFRO-NODE Ecosystem Features</h3>
        <div className="feature-grid grid grid-cols-2 md:grid-cols-3 gap-4">
          <button onClick={() => handleAction(sendAnodePayment(marketplace_address, "50"))} className="btn bg-blue-600 py-3">🌐 Central Marketplace</button>
          <button onClick={() => handleAction(sendAnodePayment(escrow_address, "100"))} className="btn bg-green-600 py-3">🔒 Escrow Services</button>
          <button onClick={() => window.open(`https://testnet.tonviewer.com/${dao_address}`, '_blank')} className="btn bg-purple-600 py-3">💡 Innovation Hub DAO</button>
          <button onClick={() => handleAction(sendAnodePayment(ADMIN_WALLET_ADDRESS, "10"))} className="btn bg-yellow-600 py-3">↔️ P2P $ANODE Transfer</button>
          <button onClick={() => handleAction(sendIncrement())} className="btn bg-pink-600 py-3">🌱 $ANODE Staking</button>
          <button onClick={() => window.open(`https://testnet.tonviewer.com/${dao_address}`, '_blank')} className="btn bg-orange-600 py-3">🗳️ DAO Proposal</button>
        </div>
      </div>

      <div className="marketplace-listings-card bg-anode-bg p-6 rounded-xl shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-anode-primary">Marketplace Listings ($ANODE Only)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketplaceItems.map(item => (
            <div key={item.id} className="bg-anode-dark p-4 rounded-lg border border-anode-secondary/50">
              <h4 className="font-semibold text-anode-primary mb-1">{item.title}</h4>
              <p className="text-sm text-white mb-2">{item.price} $ANODE</p>
              <button onClick={() => handleAction(sendAnodePayment(marketplace_address, item.price))} className="btn bg-anode-primary text-xs py-2 w-full">Pay with $ANODE</button>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="admin-card bg-anode-bg p-6 rounded-xl shadow-lg border-2 border-anode-secondary">
          <h3 className="text-xl font-bold mb-4 text-red-500">ADMIN TOOLS</h3>
          <div className="admin-actions flex flex-col gap-3">
            <button onClick={() => handleAction(sendMint())} className="btn bg-anode-mint">Mint 1000 $ANODE</button>
            <button onClick={() => handleAction(sendAirdrop())} className="btn bg-anode-airdrop">Airdrop 500 $ANODE</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
