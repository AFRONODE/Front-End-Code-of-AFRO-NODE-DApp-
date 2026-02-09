import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// The URL must be the exact direct link to the manifest file on Netlify
const manifestUrl = 'https://afro-nodeweb3gigeconomydapp.netlify.app/tonconnect-manifest.json';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
)
