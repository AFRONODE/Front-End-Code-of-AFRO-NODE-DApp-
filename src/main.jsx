import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App.jsx';
import './src/index.css'; 
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// IMPORTANT: Using your Netlify site URL from the log
const manifestUrl = 'https://afron-node.netlify.app/tonconnect-dapp-config.json'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl} actionsConfiguration={{ twaReturnUrl: 'https://t.me/AfronoNode' }}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
