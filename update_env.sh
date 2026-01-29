#!/bin/bash
echo "--- AFRO-NODE Contract Address Updater ---"
read -p "Enter AnodeMaster Address (Current: EQBGt7...): " MASTER
read -p "Enter Marketplace Address: " MARKET
read -p "Enter Escrow Address: " ESCROW
read -p "Enter HubDAO Address: " HUB

cat << ENV_EOF > .env
VITE_MASTER_ADDR=${MASTER:-EQBGt7POdkpvf1_U5hb65KgvlVT-3FAtban1raJvpFKV89GI}
VITE_MARKETPLACE_ADDR=${MARKET}
VITE_ESCROW_ADDR=${ESCROW}
VITE_HUB_DAO_ADDR=${HUB}
ENV_EOF

echo "✅ .env file updated successfully!"
