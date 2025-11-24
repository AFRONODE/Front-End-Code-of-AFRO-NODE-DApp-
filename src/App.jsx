// src/App.jsx - 100% Synchronized MVP Logic with Owner Airdrop Tool

import React, { useState, useEffect, useCallback } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { Address, Cell, beginCell, toNano, fromNano, TonClient } from '@ton/core';

// ====================================================================
// A. CONFIGURATION, CONSTANTS & UTILITIES (Consolidated)
// ====================================================================

// --- 1. Contract Addresses & Constants ---
const DAPP_CONFIG = {
    // IMPORTANT: REPLACE THESE WITH YOUR DEPLOYED TESTNET ADDRESSES
    ANODE_MASTER_ADDRESS: Address.parse("EQD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAS8D"), 
    MARKETPLACE_ADDRESS: Address.parse("EQA3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABN6"),
    HUB_DAO_ADDRESS: Address.parse("EQCMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEtI"),
    DAO_OWNER_ADDRESS: Address.parse("EQDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAL6L"), 
    ANODE_DECIMALS: 9,

    // Smart Contract Opcodes (Based on Tact/FunC)
    OP_TRANSFER: 0xf8a7ea5,             // TEP-74 Transfer
    OP_MINT: 0x15f101f3,                // AnodeMaster.tact mint operation
    OP_REGISTER_MEMBER: 0x1A0D,         // HubDAO.fc register_member
    
    // Fees & Staking (Must match Tact/FunC constants)
    MIN_TON_FEE: toNano('0.3'),         // 0.3 TON for safe gas
    MIN_DAO_STAKE_ANODE: 100n,          // Example: 100 ANODE required for staking
    FEE_ESCROW_PERCENT: 0.10,           // 10% Escrow Fee (from Escrow.tact)
    FEE_REMITTANCE_PERCENT: 0.15,       // Max Remittance Fee (15% for DAO jobs)
};

// --- 2. Nonce Utility for Replay Protection ---
function getNextNonce(senderAddress) {
    const key = `afro-node-nonce-${senderAddress}`;
    const lastNonceStr = localStorage.getItem(key) || '0';
    let lastNonce = BigInt(lastNonceStr);
    
    const nextNonce = lastNonce + 1n;
    
    localStorage.setItem(key, nextNonce.toString());
    console.log(`[Nonce Utility] Used Nonce ${nextNonce}`);
    return nextNonce;
}

// --- 3. TON Client (Testnet) ---
const tonClient = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonrpc" });

// --- 4. Fee Calculator ---
function calculateTotalCost(serviceCost) {
    // Required Deposit includes the base cost plus the Escrow Fee (10%)
    const escrowFee = serviceCost * DAPP_CONFIG.FEE_ESCROW_PERCENT;
    
    // Remittance Fee (Example using max 15%)
    const remittanceFee = serviceCost * DAPP_CONFIG.FEE_REMITTANCE_PERCENT;
    
    const totalDeposit = serviceCost + escrowFee;
    const totalFees = escrowFee + remittanceFee;
    
    return {
        serviceCost,
        escrowFee,
        remittanceFee,
        totalFees,
        totalDeposit: parseFloat(totalDeposit.toFixed(2)),
    };
}


// ====================================================================
// B. HOOK: Data Fetching (useAnodeData)
// ====================================================================

function useAnodeData() {
    const userRawAddress = useTonAddress(false);
    const [balance, setBalance] = useState('0');
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkData = useCallback(async () => {
        if (!userRawAddress) {
            setLoading(false);
            return;
        }

        const rawAddress = Address.parse(userRawAddress);
        setIsOwner(rawAddress.equals(DAPP_CONFIG.DAO_OWNER_ADDRESS));

        try {
            // 1. Get the user's Jetton Wallet Address (Requires a read call to AnodeMaster)
            const masterAddr = DAPP_CONFIG.ANODE_MASTER_ADDRESS;
            const getWalletAddressResult = await tonClient.runMethod(
                masterAddr, 
                'get_wallet_address', 
                [{ type: 'slice', cell: beginCell().storeAddress(rawAddress).endCell() }]
            );
            
            const walletAddress = getWalletAddressResult.stack.readAddress();
            
            // 2. Get the Jetton Wallet Data (balance)
            const getWalletDataResult = await tonClient.runMethod(
                walletAddress, 
                'get_wallet_data', 
                []
            );
            
            const rawBalance = getWalletDataResult.stack.readBigNumber();
            setBalance(fromNano(rawBalance));
            
        } catch (error) {
            console.error("Failed to fetch ANODE data:", error);
            setBalance('0');
        } finally {
            setLoading(false);
        }
    }, [userRawAddress]);

    useEffect(() => {
        checkData();
    }, [checkData]);

    return { balance, isOwner, loading, userAddress: userRawAddress };
}

// ====================================================================
// C. SERVICE: Transaction Logic (sendAnodeTransfer, sendOwnerMessage)
// ====================================================================

/**
 * Sends a TEP-74 Transfer message with Nonce and custom forward_payload.
 */
async function sendAnodeTransfer({ ui, senderAddress, amount, destinationAddress, serviceId = null, forwardPayload = null }) {
    if (!ui.connected) throw new Error("Wallet not connected.");

    const rawAddress = Address.parse(senderAddress);
    const nanoAmount = BigInt(Math.round(amount * (10 ** DAPP_CONFIG.ANODE_DECIMALS)));
    const responseDestination = rawAddress; 
    const forwardTonAmount = toNano('0.05'); 

    // 1. CRITICAL: Generate Nonce for Replay Protection
    const nonce = getNextNonce(senderAddress);

    // 2. Construct the Final Forward Payload
    let finalForwardPayload = beginCell();
    if (serviceId !== null) {
        // Marketplace Opcode: Encodes service_id (32 bits) at the start
        finalForwardPayload.storeUint(serviceId, 32); 
    }
    // Append any custom payload cell reference (used for DAO)
    if (forwardPayload) {
        finalForwardPayload.storeRef(forwardPayload);
    }
    
    // 3. Construct the TEP-74 Transfer Message Body
    const transferMessage = beginCell()
        .storeUint(DAPP_CONFIG.OP_TRANSFER, 32)
        .storeUint(0, 64) // query_id 
        .storeCoins(nanoAmount)
        .storeAddress(destinationAddress) // The contract receiving the tokens (e.g., Marketplace/DAO)
        .storeAddress(responseDestination)
        .storeMaybeRef(null) // custom_payload
        .storeCoins(forwardTonAmount) 
        .storeRef(finalForwardPayload.endCell()) // Forward payload as a Cell Reference
        .storeUint(nonce, 64) // CRITICAL: Store the Nonce
        .endCell();
        
    // 4. DYNAMIC: Fetch Sender's ANODE Jetton Wallet Address (REQUIRED for TEP-74)
    const getWalletAddressResult = await tonClient.runMethod(
        DAPP_CONFIG.ANODE_MASTER_ADDRESS, 
        'get_wallet_address', 
        [{ type: 'slice', cell: beginCell().storeAddress(rawAddress).endCell() }]
    );
    const senderJettonWalletAddress = getWalletAddressResult.stack.readAddress(); 

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
            {
                address: senderJettonWalletAddress.toString(), // Send to user's own Jetton Wallet
                amount: toNano('0.5').toString(), // Total TON for gas fees (send to wallet)
                payload: transferMessage.toBoc().toString("base64"),
            },
        ],
    };

    const result = await ui.sendTransaction(transaction);
    console.log('Transfer Transaction Sent:', result);
    return result;
}

/**
 * Sends a custom message for owner functions (like Mint).
 */
async function sendOwnerMessage({ ui, senderAddress, destinationAddress, payload }) {
    if (!ui.connected) throw new Error("Wallet not connected.");

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
            {
                address: destinationAddress.toString(),
                amount: DAPP_CONFIG.MIN_TON_FEE.toString(), // Just TON for gas
                payload: payload.toBoc().toString("base64"),
            },
        ],
    };

    const result = await ui.sendTransaction(transaction);
    console.log('Owner Transaction Sent:', result);
    return result;
}

// ====================================================================
// D. MAIN APPLICATION COMPONENT (App)
// ====================================================================

function App() {
    const [tonConnectUI] = useTonConnectUI();
    const { balance, isOwner, loading, userAddress } = useAnodeData();
    const [recipient, setRecipient] = useState(DAPP_CONFIG.MARKETPLACE_ADDRESS.toString()); 
    const [serviceCost, setServiceCost] = useState(100);
    const [serviceId, setServiceId] = useState(1);
    const [txStatus, setTxStatus] = useState(null);
    
    // Airdrop state
    const [airdropRecipient, setAirdropRecipient] = useState('');
    const [airdropAmount, setAirdropAmount] = useState(1000); // Default Airdrop size
    const [airdropStatus, setAirdropStatus] = useState(null);


    // Calculated Costs State
    const costDetails = calculateTotalCost(serviceCost);

    // --- Marketplace Payment Handler ---
    const handleMarketplacePayment = async () => {
        if (!userAddress || !serviceCost || !recipient || !serviceId) return;
        setTxStatus('Pending...');
        
        try {
            // Amount to transfer is the TOTAL DEPOSIT (Cost + Escrow Fee)
            await sendAnodeTransfer({
                ui: tonConnectUI,
                senderAddress: userAddress,
                amount: costDetails.totalDeposit,
                destinationAddress: Address.parse(recipient),
                serviceId: parseInt(serviceId)
            });
            setTxStatus(`Transaction successful! Paid ${costDetails.totalDeposit} $ANODE to Marketplace.`);
        } catch (e) {
            console.error(e);
            setTxStatus(`Transaction failed: ${e.message || 'Unknown error'}`);
        }
    };
    
    // --- DAO Registration Handler (SYNCED) ---
    const handleDaoRegister = async () => {
        if (!userAddress) return;
        setTxStatus('Pending DAO Registration...');

        const stakeAmount = Number(DAPP_CONFIG.MIN_DAO_STAKE_ANODE); // Staking 100 ANODE
        
        // 1. Construct the specific DAO payload: op::register_member
        const daoRegistrationPayload = beginCell()
            .storeUint(DAPP_CONFIG.OP_REGISTER_MEMBER, 32)
            .endCell();
            
        try {
            // 2. Send TEP-74 Transfer to the DAO address with the DAO payload
            await sendAnodeTransfer({
                ui: tonConnectUI,
                senderAddress: userAddress,
                amount: stakeAmount,
                destinationAddress: DAPP_CONFIG.HUB_DAO_ADDRESS,
                forwardPayload: daoRegistrationPayload,
            });
            setTxStatus(`Successfully staked ${stakeAmount} $ANODE. Check HubDAO for membership confirmation.`);
        } catch (e) {
            console.error(e);
            setTxStatus(`DAO Registration failed: ${e.message || 'Unknown error'}`);
        }
    };
    
    // --- Owner Minting Handler (SYNCED) ---
    const handleMint = async () => {
        if (!userAddress || !isOwner) return;
        setTxStatus('Pending Mint Transaction...');
        
        const mintAmount = 10000; // Example mint amount
        const mintNanoAmount = BigInt(mintAmount) * BigInt(10 ** DAPP_CONFIG.ANODE_DECIMALS);
        const mintNonce = getNextNonce(userAddress);
        
        // 1. Construct the 'Mint' message body (unique to AnodeMaster.tact)
        const mintMessage = beginCell()
            .storeUint(DAPP_CONFIG.OP_MINT, 32)
            .storeUint(0, 64) // query_id
            .storeAddress(Address.parse(userAddress)) // recipient
            .storeCoins(mintNanoAmount) // amount (nanoTONs)
            .storeUint(mintNonce, 64) // CRITICAL: Nonce for Mint op
            .endCell();

        try {
            // 2. Send direct message to the ANODE_MASTER_ADDRESS
            await sendOwnerMessage({
                ui: tonConnectUI,
                senderAddress: userAddress,
                destinationAddress: DAPP_CONFIG.ANODE_MASTER_ADDRESS,
                payload: mintMessage,
            });
            setTxStatus(`Successfully minted ${mintAmount} $ANODE.`);
        } catch (e) {
            console.error(e);
            setTxStatus(`Minting failed: ${e.message || 'Unknown error'}`);
        }
    };
    
    // --- Owner Airdrop Handler (SYNCED) ---
    const handleOwnerAirdrop = async () => {
        if (!userAddress || !isOwner || !airdropRecipient || airdropAmount <= 0) {
            setAirdropStatus('Error: Check ownership, recipient, and amount.');
            return;
        }

        setAirdropStatus(`Pending Airdrop of ${airdropAmount} $ANODE to ${airdropRecipient.slice(0, 4)}...`);
        
        try {
            // Uses the secure sendAnodeTransfer logic, but sender is the owner
            await sendAnodeTransfer({
                ui: tonConnectUI,
                senderAddress: userAddress, 
                amount: airdropAmount,
                destinationAddress: Address.parse(airdropRecipient),
                serviceId: null, 
                forwardPayload: null,
            });
            setAirdropStatus(`✅ Airdrop successful! ${airdropAmount} $ANODE sent.`);
        } catch (e) {
            console.error("Airdrop failed:", e);
            setAirdropStatus(`❌ Airdrop failed: ${e.message || 'Unknown error'}. Check if you have sufficient $ANODE and TON.`);
        }
    };
    
    // ====================================================================
    // UI Rendering
    // ====================================================================
    
    return (
        <div className="app-container">
            <header className="header">
                <h1>🌍 AFRO-NODE DApp MVP</h1>
                <TonConnectButton />
            </header>
            
            <section className="wallet-status">
                <h2>Wallet Status</h2>
                {userAddress && !loading ? (
                    <>
                        <p>👤 Connected: <code>{userAddress.slice(0, 4)}...{userAddress.slice(-4)}</code></p>
                        <p className="balance">💰 **$ANODE Balance:** **{balance}**</p>
                    </>
                ) : (
                    <p>Please connect your TON wallet to begin.</p>
                )}
            </section>
            
            {userAddress && (
                <main className="dapp-features">
                    {/* --- 1. Marketplace Payment & Escrow Calculator (SYNCED) --- */}
                    <div className="feature-box">
                        <h3>🛒 Marketplace Payment (Service Procurement)</h3>
                        <p>Total cost includes 10% Escrow Fee + 15% Remittance Fee.</p>
                        <input
                            type="number"
                            placeholder="Service ID (e.g., 1)"
                            value={serviceId}
                            onChange={(e) => setServiceId(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Base Service Cost ($ANODE)"
                            value={serviceCost}
                            onChange={(e) => setServiceCost(parseFloat(e.target.value) || 0)}
                        />
                        
                        <div className="cost-breakdown">
                            <p>Base Cost: {costDetails.serviceCost} $ANODE</p>
                            <p>+ Escrow Fee (10%): {costDetails.escrowFee.toFixed(2)} $ANODE</p>
                            <p>+ Remittance Fee (15%): {costDetails.remittanceFee.toFixed(2)} $ANODE</p>
                            <p>Total Deposit Required: **{costDetails.totalDeposit.toFixed(2)} $ANODE**</p>
                        </div>

                        <button onClick={handleMarketplacePayment} className="btn-primary">
                            Deposit {costDetails.totalDeposit.toFixed(2)} $ANODE (Nonce + Payload)
                        </button>
                    </div>

                    {/* --- 2. DAO Registration (SYNCED) --- */}
                    <div className="feature-box">
                        <h3>🤝 DAO: Member Registration</h3>
                        <p>Stake the minimum {Number(DAPP_CONFIG.MIN_DAO_STAKE_ANODE)} $ANODE to register as a member in your FunC DAO.</p>
                        <button onClick={handleDaoRegister} className="btn-secondary">
                            Stake {Number(DAPP_CONFIG.MIN_DAO_STAKE_ANODE)} $ANODE & Register
                        </button>
                    </div>

                    {/* --- 3. Owner Tools --- */}
                    {isOwner && (
                        <>
                            {/* 3a. Minting (SYNCED) */}
                            <div className="feature-box owner-box">
                                <h3>👑 Owner: $ANODE Minting</h3>
                                <button onClick={handleMint} className="btn-secondary">
                                    Execute Mint (Nonce Required)
                                </button>
                            </div>
                            
                            {/* 3b. Airdrop Distribution (SYNCED) */}
                            <div className="feature-box owner-box">
                                <h3>👑 Owner: Testnet Airdrop Tool</h3>
                                <p>Distribute $ANODE for testing purposes directly from your wallet.</p>
                                <input
                                    type="text"
                                    placeholder="Recipient Testnet Address (EQ...)"
                                    value={airdropRecipient}
                                    onChange={(e) => setAirdropRecipient(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Airdrop Amount ($ANODE)"
                                    value={airdropAmount}
                                    onChange={(e) => setAirdropAmount(parseFloat(e.target.value) || 0)}
                                />
                                <button 
                                    onClick={handleOwnerAirdrop} 
                                    className="btn-primary"
                                    disabled={!airdropRecipient || airdropAmount <= 0}
                                >
                                    Execute Airdrop of {airdropAmount} $ANODE
                                </button>
                                {airdropStatus && <p className="status-message">{airdropStatus}</p>}
                            </div>
                        </>
                    )}
                    
                    {txStatus && <p className="status-message">{txStatus}</p>}
                </main>
            )}
        </div>
    );
}

export default App;
