import 'whatwg-fetch';
import { Buffer } from 'buffer';
import 'process/browser';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

import App from './App.jsx';
import './index.css';

window.Buffer = Buffer;

const MANIFEST_URL = "https://afro-node-dual-ecosystems-web3-dapp.netlify.app/tonconnect-manifest.json";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TonConnectUIProvider 
      manifestUrl={MANIFEST_URL} 
      restoreConnection={true}
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
// Build Trigger: Tue Jan 27 16:12:16 WAT 2026
