import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// Using a hardcoded Date string to bust any previous browser/wallet cache
const manifestUrl = "https://afro-nodeweb3gigeconomydapp.netlify.app/tonconnect-manifest.json?v=2026_FINAL";

ReactDOM.createRoot(document.getElementById('root')).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
)
