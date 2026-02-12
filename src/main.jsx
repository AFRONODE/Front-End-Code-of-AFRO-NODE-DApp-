import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// Added a unique ID to the manifest URL to force wallets to re-verify
const manifestUrl = "https://afro-nodedappweb3gigeconomyprotocol.netlify.app/tonconnect-manifest.json?v=2026_FINAL_STABLE";

ReactDOM.createRoot(document.getElementById('root')).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
)
