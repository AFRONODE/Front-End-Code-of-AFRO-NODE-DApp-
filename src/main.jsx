// src/main.jsx (FINAL & COMPLETE)

// --- CRITICAL GLOBAL POLYFILL INJECTION ---
// These ensure Node.js compatibility in a browser environment (Vite/React)
import 'whatwg-fetch';
import { Buffer } from 'buffer';
window.Buffer = Buffer;
import 'process/browser';
// -------------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// FIX: Import Network from the correct, successfully installed package: @ton/core
import { TonConnectUIProvider } from '@tonconnect/ui-react'; 
import { Network } from '@ton/core'; // <--- FINAL FIX: Using @ton/core

// === TON CONNECT MANIFEST URL SETUP ===
const manifestUrl = "/tonconnect-manifest.json";
// ======================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* FINAL CONFIG: Force Testnet AND add key to bust wallet manifest cache */}
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      network={Network.TESTNET} // <--- Forces Testnet targeting
      key="version-1.2" // <--- CRITICAL TEMPORARY CACHE BUSTER
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
