import React, { useState, useEffect, useCallback } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { Address, Cell, beginCell, toNano, fromNano, TonClient } from 'ton/core';

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

function getNextNonce(senderAddress) {
    const key = `afro-node-nonce-${senderAddress}`;
    const lastNonceStr = localStorage.getItem(key) || '0';
    let lastNonce = BigInt(lastNonceStr);

    const nextNonce = lastNonce + 1n;

    localStorage.setItem(key, nextNonce.toString());
    console.log(`[nonce utility] used nonce ${nextNonce}`);
    return nextNonce;
}

const tonClient = new TonClient({ endpoint: "https://testnet.toncenter.com/api/v2/jsonrpc" });

function calculateTotalCost(serviceCost) {
    const escrowFee = serviceCost * dapp_config.fee_escrow_percent;
    const remittanceFee = serviceCost * dapp_config.fee_remittance_percent;

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
// b. hook: data fetching (useAnodeData)
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
        setIsOwner(rawAddress.equals(dapp_config.dao_owner_address));

        try {
            const masterAddr = dapp_config.anode_master_address;
            const getWalletAddressResult = await tonClient.runMethod(
                masterAddr,
                'get_wallet_address',
                [{ type: 'slice', cell: beginCell().storeAddress(rawAddress).endCell() }]
            );

            const walletAddress = getWalletAddressResult.stack.readAddress();

            const getWalletDataResult = await tonClient.runMethod(
                walletAddress,
                'get_wallet_data',
                []
            );

            const rawBalance = getWalletDataResult.stack.readBigNumber();
            setBalance(fromNano(rawBalance));

        } catch (error) {
            console.error("Failed to fetch anode data:", error);
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
// c. service: transaction logic (sendAnodeTransfer, sendOwnerMessage)
// ====================================================================

async function sendAnodeTransfer({ ui, senderAddress, amount, destinationAddress, serviceId = null, forwardPayload = null }) {
    if (!ui.connected) throw new Error("Wallet not connected.");

    const rawAddress = Address.parse(senderAddress);
    const nanoAmount = BigInt(Math.round(amount * (10 ** dapp_config.anode_decimals)));
    const responseDestination = rawAddress;
    const forwardTonAmount = toNano('0.05');

    const nonce = getNextNonce(senderAddress);

    let finalForwardPayload = beginCell();
    if (serviceId !== null) {
        finalForwardPayload.storeUint(serviceId, 32);
    }
    if (forwardPayload) {
        finalForwardPayload.storeRef(forwardPayload);
    }

    const transferMessage = beginCell()
        .storeUint(dapp_config.op_transfer, 32)
        .storeUint(0, 64)
        .storeCoins(nanoAmount)
        .storeAddress(destinationAddress)
        .storeAddress(responseDestination)
        .storeMaybeRef(null)
        .storeCoins(forwardTonAmount)
        .storeRef(finalForwardPayload.endCell())
        .storeUint(nonce, 64)
        .endCell();

    const getWalletAddressResult = await tonClient.runMethod(
        dapp_config.anode_master_address,
        'get_wallet_address',
        [{ type: 'slice', cell: beginCell().storeAddress(rawAddress).endCell() }]
    );
    const senderJettonWalletAddress = getWalletAddressResult.stack.readAddress();

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
            {
                address: senderJettonWalletAddress.toString(),
                amount: toNano('0.5').toString(),
                payload: transferMessage.toBoc().toString("base64"),
            },
        ],
    };

    const result = await ui.sendTransaction(transaction);
    console.log('Transfer transaction sent:', result);
    return result;
}

async function sendOwnerMessage({ ui, senderAddress, destinationAddress, payload }) {
    if (!ui.connected) throw new new Error("Wallet not connected.");

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
            {
                address: destinationAddress.toString(),
                amount: dapp_config.min_ton_fee.toString(),
                payload: payload.toBoc().toString("base64"),
            },
        ],
    };

    const result = await ui.sendTransaction(transaction);
    console.log('Owner transaction sent:', result);
    return result;
}

// ====================================================================
// d. main application component (App)
// ====================================================================

function App() {
    const [tonConnectUI] = useTonConnectUI();
    const { balance, isOwner, loading, userAddress } = useAnodeData();
    const [recipient, setRecipient] = useState(dapp_config.marketplace_address.toString());
    const [serviceCost, setServiceCost] = useState(100);
    const [serviceId, setServiceId] = useState(1);
    const [txStatus, setTxStatus] = useState(null);

    const [airdropRecipient, setAirdropRecipient] = useState('');
    const [airdropAmount, setAirdropAmount] = useState(1000);
    const [airdropStatus, setAirdropStatus] = useState(null);

    const costDetails = calculateTotalCost(serviceCost);

    const handleMarketplacePayment = async () => {
        if (!userAddress || !serviceCost || !recipient || !serviceId) return;
        setTxStatus('pending...');

        try {
            await sendAnodeTransfer({
                ui: tonConnectUI,
                senderAddress: userAddress,
                amount: costDetails.totalDeposit,
                destinationAddress: Address.parse(recipient),
                serviceId: parseInt(serviceId)
            });
            setTxStatus(`Transaction successful! Paid ${costDetails.totalDeposit} $ANODE to marketplace.`);
        } catch (e) {
            console.error(e);
            setTxStatus(`Transaction failed: ${e.message || 'Unknown error'}`);
        }
    };

    const handleDaoRegister = async () => {
        if (!userAddress) return;
        setTxStatus('pending DAO registration...');

        const stakeAmount = Number(dapp_config.min_dao_stake_anode);

        const daoRegistrationPayload = beginCell()
            .storeUint(dapp_config.op_register_member, 32)
            .endCell();

        try {
            await sendAnodeTransfer({
                ui: tonConnectUI,
                senderAddress: userAddress,
                amount: stakeAmount,
                destinationAddress: dapp_config.hub_dao_address,
                forwardPayload: daoRegistrationPayload,
            });
            setTxStatus(`Successfully staked ${stakeAmount} $ANODE. Check HubDAO for membership confirmation.`);
        } catch (e) {
            console.error(e);
            setTxStatus(`DAO registration failed: ${e.message || 'Unknown error'}`);
        }
    };

    const handleMint = async () => {
        if (!userAddress || !isOwner) return;
        setTxStatus('pending mint transaction...');

        const mintAmount = 10000;
        const mintNanoAmount = BigInt(mintAmount) * BigInt(10 ** dapp_config.anode_decimals);
        const mintNonce = getNextNonce(userAddress);

        const mintMessage = beginCell()
            .storeUint(dapp_config.op_mint, 32)
            .storeUint(0, 64)
            .storeAddress(Address.parse(userAddress))
            .storeCoins(mintNanoAmount)
            .storeUint(mintNonce, 64)
            .endCell();

        try {
            await sendOwnerMessage({
                ui: tonConnectUI,
                senderAddress: userAddress,
                destinationAddress: dapp_config.anode_master_address,
                payload: mintMessage,
            });
            setTxStatus(`Successfully minted ${mintAmount} $ANODE.`);
        } catch (e) {
            console.error(e);
            setTxStatus(`Minting failed: ${e.message || 'Unknown error'}`);
        }
    };

    const handleOwnerAirdrop = async () => {
        if (!userAddress || !isOwner || !airdropRecipient || airdropAmount <= 0) {
            setAirdropStatus('Error: Check ownership, recipient, and amount.');
            return;
        }

        setAirdropStatus(`Pending airdrop of ${airdropAmount} $ANODE to ${airdropRecipient.slice(0, 4)}...`);

        try {
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
                    <div className="feature-box">
                        <h3>🛒 Marketplace Payment (Service Procurement)</h3>
                        <p>Total cost includes 10% escrow fee + 15% remittance fee.</p>
                        <input
                            type="number"
                            placeholder="Service ID (e.g., 1)"
                            value={serviceId}
                            onChange={(e) => setServiceId(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Base service cost ($ANODE)"
                            value={serviceCost}
                            onChange={(e) => setServiceCost(parseFloat(e.target.value) || 0)}
                        />

                        <div className="cost-breakdown">
                            <p>Base cost: {costDetails.serviceCost} $ANODE</p>
                            <p>+ Escrow fee (10%): {costDetails.escrowFee.toFixed(2)} $ANODE</p>
                            <p>+ Remittance fee (15%): {costDetails.remittanceFee.toFixed(2)} $ANODE</p>
                            <p>Total deposit required: **{costDetails.totalDeposit.toFixed(2)} $ANODE**</p>
                        </div>

                        <button onClick={handleMarketplacePayment} className="btn-primary">
                            Deposit {costDetails.totalDeposit.toFixed(2)} $ANODE (Nonce + Payload)
                        </button>
                    </div>

                    <div className="feature-box">
                        <h3>🤝 DAO: Member Registration</h3>
                        <p>Stake the minimum {Number(dapp_config.min_dao_stake_anode)} $ANODE to register as a member in your FunC DAO.</p>
                        <button onClick={handleDaoRegister} className="btn-secondary">
                            Stake {Number(dapp_config.min_dao_stake_anode)} $ANODE & Register
                        </button>
                    </div>

                    {isOwner && (
                        <>
                            <div className="feature-box owner-box">
                                <h3>👑 Owner: $ANODE Minting</h3>
                                <button onClick={handleMint} className="btn-secondary">
                                    Execute Mint (Nonce Required)
                                </button>
                            </div>

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
