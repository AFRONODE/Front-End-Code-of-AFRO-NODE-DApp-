// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; 
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// === FINAL DEFINITIVE FIX ===
// The manifest URL MUST be relative (start with /) if the file 
// (tonconnect-manifest.json) is in the project's public folder.
// This prevents high-level initialization crashes in the TonConnectUIProvider.
const manifestUrl = "/tonconnect-manifest.json";
// ============================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the App with the provider and pass the corrected manifest URL */}
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
