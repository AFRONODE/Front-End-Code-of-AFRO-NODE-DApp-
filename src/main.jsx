import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { TonConnectUIProvider } from '@tonconnect/ui-react';

ReactDOM.createRoot(document.getElementById('root')).render(
  <TonConnectUIProvider manifestUrl="https://afro-nodeweb3gigeconomydapp.netlify.app/tonconnect-manifest.json">
    <App />
  </TonConnectUIProvider>
)
