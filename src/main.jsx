// --- CRITICAL GLOBAL POLYFILL INJECTION (Final Combined Strategy) ---
// 1. Fetch API (Resolves 'Request' TypeError)
import 'whatwg-fetch'; 

// 2. Node Globals (Resolves 'Buffer is not defined' and 'process is not defined')
// These are necessary because the Vite config alone fails to globalize them in time.
import { Buffer } from 'buffer';
window.Buffer = Buffer; 
import 'process/browser';
// -------------------------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// === TON CONNECT MANIFEST URL SETUP ===
const manifestUrl = "/tonconnect-manifest.json";
// ======================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the App with the provider and pass the manifest URL */}
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
