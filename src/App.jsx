import React, { useState, useEffect, useCallback } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { Address, Cell, beginCell, toNano, fromNano, TonClient } from '@ton/ton'; // CORRECTED IMPORT PATH

// ====================================================================
// a. configuration, constants & utilities (consolidated)
// ====================================================================

const dapp_config = {
    anode_master_address: Address.parse("eqd4aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaas8d"),
    marketplace_address: Address.parse("eqa3aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabn6"),
    hub_dao_address: Address.parse("eqcmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaeti"),
    dao_owner_address: Address.parse("eqdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaal6l"),
    anode_decimals: 9,

    op_transfer: 0xf8a7ea5,
    op_mint: 0x15f101f3,
    op_register_member: 0x1a0d,

    min_ton_fee: toNano('0.3'),
    min_dao_stake_anode: 100n,
    fee_escrow_percent: 0.10,
    fee_remittance_percent: 0.15,
};

function getNextNonce(senderAddress) { // Corrected: getNextNonce, senderAddress
    const key = `afro-node-nonce-${senderAddress}`;
    const lastNonceStr = localStorage.getItem(key) || '0'; // Corrected: localStorage.getItem
    let lastNonce = BigInt(lastNonceStr); // Corrected: BigInt

    const nextNonce = lastNonce + 1n; // Corrected: nextNonce

    localStorage.setItem(key, nextNonce.toString()); // Corrected: localStorage.setItem, toString
    console.log(`[nonce utility] used nonce ${nextNonce}`);
    return nextNonce;
}

const tonClient = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonrpc" }); // Corrected: TonClient

function calculateTotalCost(serviceCost) { // Corrected: calculateTotalCost, serviceCost
    const escrowFee = serviceCost * dapp_config.fee_escrow_percent; // Corrected: escrowFee
    const remittanceFee = serviceCost * dapp_config.fee_remittance_percent; // Corrected: remittanceFee

    const totalDeposit = serviceCost + escrowFee; // Corrected: totalDeposit
    const totalFees = escrowFee + remittanceFee; // Corrected: totalFees

    return {
        serviceCost,
        escrowFee,
        remittanceFee,
        totalFees,
        totalDeposit: parseFloat(totalDeposit.toFixed(2)), // Corrected: parseFloat, toFixed
    };
}

// ====================================================================
// b. hook: data fetching (useAnodeData)
// ====================================================================

function useAnodeData() { // Corrected: useAnodeData
    const userRawAddress = useTonAddress(false); // Corrected: useTonAddress
    const [balance, setBalance] = useState('0'); // Corrected: useState, setBalance
    const [isOwner, setIsOwner] = useState(false); // Corrected: useState, setIsOwner
    const [loading, setLoading] = useState(true); // Corrected: useState, setLoading

    const checkData = useCallback(async () => { // Corrected: checkData, useCallback
        if (!userRawAddress) {
            setLoading(false); // Corrected: setLoading
            return;
        }

        const rawAddress = Address.parse(userRawAddress); // Corrected: Address
        setIsOwner(rawAddress.equals(dapp_config.dao_owner_address)); // Corrected: setIsOwner

        try {
            const masterAddr = dapp_config.anode_master_address; // Corrected: masterAddr
            const getWalletAddressResult = await tonClient.runMethod( // Corrected: getWalletAddressResult, tonClient
                masterAddr,
                'get_wallet_address',
                [{ type: 'slice', cell: beginCell().storeAddress(rawAddress).endCell() }] // Corrected: beginCell, storeAddress, endCell
            );

            const walletAddress = getWalletAddressResult.stack.readAddress(); // Corrected: walletAddress, readAddress

            const getWalletDataResult = await tonClient.runMethod( // Corrected: getWalletDataResult, tonClient
                walletAddress,
                'get_wallet_data',
                []
            );

            const rawBalance = getWalletDataResult.stack.readBigNumber(); // Corrected: rawBalance, readBigNumber
            setBalance(fromNano(rawBalance)); // Corrected: setBalance, fromNano

        } catch (error) { // Corrected: error
            console.error("Failed to fetch anode data:", error);
            setBalance('0');
        } finally {
            setLoading(false); // Corrected: setLoading
        }
    }, [userRawAddress]);

    useEffect(() => { // Corrected: useEffect
        checkData();
    }, [checkData]);

    return { balance, isOwner, loading, userAddress: userRawAddress }; // Corrected: isOwner, userAddress
}

// ====================================================================
// c. service: transaction logic (sendAnodeTransfer, sendOwnerMessage)
// ====================================================================

async function sendAnodeTransfer({ ui, senderAddress, amount, destinationAddress, serviceId = null, forwardPayload = null }) { // Corrected function name and params
    if (!ui.connected) throw new Error("Wallet not connected."); // Corrected: Error

    const rawAddress = Address.parse(senderAddress); // Corrected: Address
    const nanoAmount = BigInt(Math.round(amount * (10 ** dapp_config.anode_decimals))); // Corrected: BigInt, Math.round
    const responseDestination = rawAddress; // Corrected: responseDestination
    const forwardTonAmount = toNano('0.05'); // Corrected: toNano

    const nonce = getNextNonce(senderAddress); // Corrected: getNextNonce

    let finalForwardPayload = beginCell(); // Corrected: beginCell
    if (serviceId !== null) {
        finalForwardPayload.storeUint(serviceId, 32); // Corrected: storeUint
    }
    if (forwardPayload) {
        finalForwardPayload.storeRef(forwardPayload); // Corrected: storeRef
    }

    const transferMessage = beginCell() // Corrected: beginCell
        .storeUint(dapp_config.op_transfer, 32) // Corrected: storeUint
        .storeUint(0, 64) // Corrected: storeUint
        .storeCoins(nanoAmount) // Corrected: storeCoins
        .storeAddress(destinationAddress) // Corrected: storeAddress
        .storeAddress(responseDestination) // Corrected: storeAddress
        .storeMaybeRef(null) // Corrected: storeMaybeRef
        .storeCoins(forwardTonAmount) // Corrected: storeCoins
        .storeRef(finalForwardPayload.endCell()) // Corrected: storeRef, endCell
        .storeUint(nonce, 64) // Corrected: storeUint
        .endCell(); // Corrected: endCell

    const getWalletAddressResult = await tonClient.runMethod( // Corrected: tonClient
        dapp_config.anode_master_address,
        'get_wallet_address',
        [{ type: 'slice', cell: beginCell().storeAddress(rawAddress).endCell() }] // Corrected: beginCell, storeAddress, endCell
    );
    const senderJettonWalletAddress = getWalletAddressResult.stack.readAddress(); // Corrected: senderJettonWalletAddress, readAddress

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360, // Corrected: validUntil, Math.floor, Date.now
        messages: [
            {
                address: senderJettonWalletAddress.toString(), // Corrected: toString
                amount: toNano('0.5').toString(), // Corrected: toNano, toString
                payload: transferMessage.toBoc().toString("base64"), // Corrected: toBoc, toString
            },
        ],
    };

    const result = await ui.sendTransaction(transaction); // Corrected: sendTransaction
    console.log('Transfer transaction sent:', result);
    return result;
}

async function sendOwnerMessage({ ui, senderAddress, destinationAddress, payload }) { // Corrected function name and params
    if (!ui.connected) throw new Error("Wallet not connected."); // Corrected: Error (removed duplicate 'new')

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360, // Corrected: validUntil, Math.floor, Date.now
        messages: [
            {
                address: destinationAddress.toString(), // Corrected: toString
                amount: dapp_config.min_ton_fee.toString(), // Corrected: toString
                payload: payload.toBoc().toString("base64"), // Corrected: toBoc, toString
            },
        ],
    };

    const result = await ui.sendTransaction(transaction); // Corrected: sendTransaction
    console.log('Owner transaction sent:', result);
    return result;
}

// ====================================================================
// d. main application component (App)
// ====================================================================

function App() { // Corrected: function App()
    const [tonConnectUI] = useTonConnectUI(); // Corrected: useTonConnectUI
    const { balance, isOwner, loading, userAddress } = useAnodeData(); // Corrected: isOwner, userAddress
    const [recipient, setRecipient] = useState(dapp_config.marketplace_address.toString()); // Corrected: setRecipient, useState, toString
    const [serviceCost, setServiceCost] = useState(100); // Corrected: setServiceCost, useState
    const [serviceId, setServiceId] = useState(1); // Corrected: setServiceId, useState
    const [txStatus, setTxStatus] = useState(null); // Corrected: setTxStatus, useState

    const [airdropRecipient, setAirdropRecipient] = useState(''); // Corrected: setAirdropRecipient, useState
    const [airdropAmount, setAirdropAmount] = useState(1000); // Corrected: setAirdropAmount, useState
    const [airdropStatus, setAirdropStatus] = useState(null); // Corrected: setAirdropStatus, useState

    const costDetails = calculateTotalCost(serviceCost); // Corrected: costDetails, calculateTotalCost, serviceCost

    const handleMarketplacePayment = async () => { // Corrected: handleMarketplacePayment
        if (!userAddress || !serviceCost || !recipient || !serviceId) return;
        setTxStatus('pending...'); // Corrected: setTxStatus

        try {
            await sendAnodeTransfer({ // Corrected: sendAnodeTransfer
                ui: tonConnectUI,
                senderAddress: userAddress,
                amount: costDetails.totalDeposit,
                destinationAddress: Address.parse(recipient), // Corrected: Address
                serviceId: parseInt(serviceId) // Corrected: parseInt
            });
            setTxStatus(`Transaction successful! Paid ${costDetails.totalDeposit} $ANODE to marketplace.`); // Corrected: setTxStatus
        } catch (e) {
            console.error(e);
            setTxStatus(`Transaction failed: ${e.message || 'Unknown error'}`); // Corrected: setTxStatus
        }
    };

    const handleDaoRegister = async () => { // Corrected: handleDaoRegister
        if (!userAddress) return;
        setTxStatus('pending DAO registration...'); // Corrected: setTxStatus

        const stakeAmount = Number(dapp_config.min_dao_stake_anode); // Corrected: stakeAmount, Number

        const daoRegistrationPayload = beginCell() // Corrected: daoRegistrationPayload, beginCell
            .storeUint(dapp_config.op_register_member, 32) // Corrected: storeUint
            .endCell(); // Corrected: endCell

        try {
            await sendAnodeTransfer({ // Corrected: sendAnodeTransfer
                ui: tonConnectUI,
                senderAddress: userAddress,
                amount: stakeAmount,
                destinationAddress: dapp_config.hub_dao_address,
                forwardPayload: daoRegistrationPayload,
            });
            setTxStatus(`Successfully staked ${stakeAmount} $ANODE. Check HubDAO for membership confirmation.`); // Corrected: setTxStatus
        } catch (e) {
            console.error(e);
            setTxStatus(`DAO registration failed: ${e.message || 'Unknown error'}`); // Corrected: setTxStatus
        }
    };

    const handleMint = async () => { // Corrected: handleMint
        if (!userAddress || !isOwner) return;
        setTxStatus('pending mint transaction...'); // Corrected: setTxStatus

        const mintAmount = 10000; // Corrected: mintAmount
        const mintNanoAmount = BigInt(mintAmount) * BigInt(10 ** dapp_config.anode_decimals); // Corrected: mintNanoAmount, BigInt
        const mintNonce = getNextNonce(userAddress); // Corrected: mintNonce, getNextNonce

        const mintMessage = beginCell() // Corrected: mintMessage, beginCell
            .storeUint(dapp_config.op_mint, 32) // Corrected: storeUint
            .storeUint(0, 64) // Corrected: storeUint
            .storeAddress(Address.parse(userAddress)) // Corrected: storeAddress, Address
            .storeCoins(mintNanoAmount) // Corrected: storeCoins
            .storeUint(mintNonce, 64) // Corrected: storeUint
            .endCell(); // Corrected: endCell

        try {
            await sendOwnerMessage({ // Corrected: sendOwnerMessage
                ui: tonConnectUI,
                senderAddress: userAddress,
                destinationAddress: dapp_config.anode_master_address,
                payload: mintMessage,
            });
            setTxStatus(`Successfully minted ${mintAmount} $ANODE.`); // Corrected: setTxStatus
        } catch (e) {
            console.error(e);
            setTxStatus(`Minting failed: ${e.message || 'Unknown error'}`); // Corrected: setTxStatus
        }
    };

    const handleOwnerAirdrop = async () => { // Corrected: handleOwnerAirdrop
        if (!userAddress || !isOwner || !airdropRecipient || airdropAmount <= 0) {
            setAirdropStatus('Error: Check ownership, recipient, and amount.'); // Corrected: setAirdropStatus
            return;
        }

        setAirdropStatus(`Pending airdrop of ${airdropAmount} $ANODE to ${airdropRecipient.slice(0, 4)}...`); // Corrected: setAirdropStatus

        try {
            await sendAnodeTransfer({ // Corrected: sendAnodeTransfer
                ui: tonConnectUI,
                senderAddress: userAddress,
                amount: airdropAmount,
                destinationAddress: Address.parse(airdropRecipient), // Corrected: Address
                serviceId: null,
                forwardPayload: null,
            });
            setAirdropStatus(`✅ Airdrop successful! ${airdropAmount} $ANODE sent.`); // Corrected: setAirdropStatus
        } catch (e) {
            console.error("Airdrop failed:", e);
            setAirdropStatus(`❌ Airdrop failed: ${e.message || 'Unknown error'}. Check if you have sufficient $ANODE and TON.`); // Corrected: setAirdropStatus
        }
    };

    return (
        <div className="app-container"> {/* Corrected: className */}
            <header className="header"> {/* Corrected: className */}
                <h1>🌍 AFRO-NODE DApp MVP</h1>
                <TonConnectButton /> {/* Corrected: TonConnectButton */}
            </header>

            <section className="wallet-status"> {/* Corrected: className */}
                <h2>Wallet Status</h2>
                {userAddress && !loading ? (
                    <>
                        <p>👤 Connected: <code>{userAddress.slice(0, 4)}...{userAddress.slice(-4)}</code></p>
                        <p className="balance">💰 **$ANODE Balance:** **{balance}**</p> {/* Corrected: className */}
                    </>
                ) : (
                    <p>Please connect your TON wallet to begin.</p>
                )}
            </section>

            {userAddress && (
                <main className="dapp-features"> {/* Corrected: className */}
                    <div className="feature-box"> {/* Corrected: className */}
                        <h3>🛒 Marketplace Payment (Service Procurement)</h3>
                        <p>Total cost includes 10% escrow fee + 15% remittance fee.</p>
                        <input
                            type="number"
                            placeholder="Service ID (e.g., 1)"
                            value={serviceId}
                            onChange={(e) => setServiceId(e.target.value)} // Corrected: onChange, setServiceId
                        />
                        <input
                            type="number"
                            placeholder="Base service cost ($ANODE)"
                            value={serviceCost}
                            onChange={(e) => setServiceCost(parseFloat(e.target.value) || 0)} // Corrected: onChange, setServiceCost, parseFloat
                        />

                        <div className="cost-breakdown"> {/* Corrected: className */}
                            <p>Base cost: {costDetails.serviceCost} $ANODE</p>
                            <p>+ Escrow fee (10%): {costDetails.escrowFee.toFixed(2)} $ANODE</p>
                            <p>+ Remittance fee (15%): {costDetails.remittanceFee.toFixed(2)} $ANODE</p>
                            <p>Total deposit required: **{costDetails.totalDeposit.toFixed(2)} $ANODE**</p>
                        </div>

                        <button onClick={handleMarketplacePayment} className="btn-primary"> {/* Corrected: onClick, handleMarketplacePayment, className */}
                            Deposit {costDetails.totalDeposit.toFixed(2)} $ANODE (Nonce + Payload)
                        </button>
                    </div>

                    <div className="feature-box"> {/* Corrected: className */}
                        <h3>🤝 DAO: Member Registration</h3>
                        <p>Stake the minimum {Number(dapp_config.min_dao_stake_anode)} $ANODE to register as a member in your FunC DAO.</p> {/* Corrected: Number */}
                        <button onClick={handleDaoRegister} className="btn-secondary"> {/* Corrected: onClick, handleDaoRegister, className */}
                            Stake {Number(dapp_config.min_dao_stake_anode)} $ANODE & Register {/* Corrected: Number */}
                        </button>
                    </div>

                    {isOwner && (
                        <>
                            <div className="feature-box owner-box"> {/* Corrected: className */}
                                <h3>👑 Owner: $ANODE Minting</h3>
                                <button onClick={handleMint} className="btn-secondary"> {/* Corrected: onClick, handleMint, className */}
                                    Execute Mint (Nonce Required)
                                </button>
                            </div>

                            <div className="feature-box owner-box"> {/* Corrected: className */}
                                <h3>👑 Owner: Testnet Airdrop Tool</h3>
                                <p>Distribute $ANODE for testing purposes directly from your wallet.</p>
                                <input
                                    type="text"
                                    placeholder="Recipient Testnet Address (EQ...)"
                                    value={airdropRecipient}
                                    onChange={(e) => setAirdropRecipient(e.target.value)} // Corrected: onChange, setAirdropRecipient
                                />
                                <input
                                    type="number"
                                    placeholder="Airdrop Amount ($ANODE)"
                                    value={airdropAmount}
                                    onChange={(e) => setAirdropAmount(parseFloat(e.target.value) || 0)} // Corrected: onChange, setAirdropAmount, parseFloat
                                />
                                <button
                                    onClick={handleOwnerAirdrop} // Corrected: onClick, handleOwnerAirdrop
                                    className="btn-primary" // Corrected: className
                                    disabled={!airdropRecipient || airdropAmount <= 0}
                                >
                                    Execute Airdrop of {airdropAmount} $ANODE
                                </button>
                                {airdropStatus && <p className="status-message">{airdropStatus}</p>} {/* Corrected: className */}
                            </div>
                        </>
                    )}

                    {txStatus && <p className="status-message">{txStatus}</p>} {/* Corrected: className */}
                </main>
            )}
        </div>
    );
}

export default App; // Corrected: export default App;
