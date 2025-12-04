// --- CRITICAL POLYFILLS FOR TON LIBRARIES ---
import { Buffer } from 'buffer'; 
window.Buffer = Buffer; // Exposes Buffer globally for dependencies
import 'process/browser'; // Ensures 'process' is polyfilled
// ---------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// === FINAL DEFINITIVE FIX ===
// The manifest URL MUST be relative (start with /)
// (tonconnect-manifest.json) is in the project's public/ folder
// This prevents high-level initialization crashes
const manifestUrl = "/tonconnect-manifest.json";
// ============================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the App with the provider and pass the manifest URL */}
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
