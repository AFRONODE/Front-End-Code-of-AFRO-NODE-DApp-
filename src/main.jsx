// --- CRITICAL FETCH POLYFILL FOR TON LIBRARIES ---
// This polyfill MUST be the first thing imported 
// to ensure global objects like 'Request' and 'Response' are available
// This resolves the "Cannot destructure property 'Request' of 'undefined'" error.
import 'whatwg-fetch'; 
// Note: Manual Buffer/process imports removed. These are now handled by 
// vite-plugin-node-polyfills in vite.config.js.
// ---------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// === TON CONNECT MANIFEST URL SETUP ===
// The manifest URL MUST be relative (start with /) and point to the file 
// in your 'public' folder.
const manifestUrl = "/tonconnect-manifest.json";
// ======================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the App with the provider and pass the required manifestUrl */}
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
