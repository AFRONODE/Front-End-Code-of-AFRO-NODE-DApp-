import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// Added a timestamp to force the wallet to fetch the freshest manifest
const manifestUrl = "https://afro-nodeweb3gigeconomydapp.netlify.app/tonconnect-manifest.json?v=" + Date.now();

ReactDOM.createRoot(document.getElementById('root')).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
)
