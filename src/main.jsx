// GNU nano 8.7       src/main.jsx
// --- CRITICAL GLOBAL POLYFILL INJECTION (Final Code) ---
// 1. Fetch API (Resolves 'Request' TypeError)
import 'whatwg-fetch';

// 2. Node Globals (Resolves 'Buffer is not defined')
// These are necessary because the Vite config allows Node built-ins.
import { Buffer } from 'buffer';
window.Buffer = Buffer;
import 'process/browser';
// -------------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. ADD NEW IMPORT: Network is needed for configuration
import { TonConnectUIProvider, Network } from '@tonconnect/ui-react'; 

// === TON CONNECT MANIFEST URL SETUP ===
const manifestUrl = "/tonconnect-manifest.json";
// ======================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. ADD FINAL FIX: Force the entire provider to use the Testnet network definition. */}
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      network={Network.TESTNET} // <--- FINAL DEFINITIVE FIX!
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
