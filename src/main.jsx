// src/main.jsx (ABSOLUTELY FINAL VERSION)

// --- CRITICAL GLOBAL POLYFILL INJECTION ---
import 'whatwg-fetch';
import { Buffer } from 'buffer';
window.Buffer = Buffer;
import 'process/browser';
// -------------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// FIX: We now only need TonConnectUIProvider. Network enum is replaced by string literal.
import { TonConnectUIProvider } from '@tonconnect/ui-react'; 

// === TON CONNECT MANIFEST URL SETUP ===
const manifestUrl = "/tonconnect-manifest.json";
// ======================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* FINAL FIX: Use the 'testnet' string literal to avoid any further enum errors. */}
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      network={'testnet'} // <--- THE FINAL, DEFINITIVE FIX
      key="version-1.2" 
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
