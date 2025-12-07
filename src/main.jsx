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

// 1. IMPORT FIX: TonConnectUIProvider is here, but Network moved to the SDK package.
import { TonConnectUIProvider } from '@tonconnect/ui-react'; 
import { Network } from '@tonconnect/sdk'; // <--- FIX: Network imported from the correct SDK package

// === TON CONNECT MANIFEST URL SETUP ===
const manifestUrl = "/tonconnect-manifest.json";
// ======================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. FINAL CONFIG: Force the Testnet network definition. */}
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      network={Network.TESTNET} // <--- CORRECTLY USING Network from the SDK
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
