import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { TonConnectUIProvider } from '@tonconnect/ui-react';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TonConnectUIProvider 
      manifestUrl="https://afro-nodeweb3gigeconomydapp.netlify.app/tonconnect-manifest.json"
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/your_bot_user_name'
      }}
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
)
