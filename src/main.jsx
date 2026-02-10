import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const manifestUrl = "https://afro-nodeweb3gigeconomydapp.netlify.app/tonconnect-manifest.json";

ReactDOM.createRoot(document.getElementById('root')).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
)
