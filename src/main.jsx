import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// Force a unique version to clear wallet cache
const manifestUrl = "https://afro-nodeweb3gigeconomydapp.netlify.app/tonconnect-manifest.json?v=2026_AFRO_NODE";

ReactDOM.createRoot(document.getElementById('root')).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
)
