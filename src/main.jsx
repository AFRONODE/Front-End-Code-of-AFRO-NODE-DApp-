import 'whatwg-fetch';
import { Buffer } from 'buffer';
window.Buffer = Buffer;
import 'process/browser';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { TonConnectUIProvider } from '@tonconnect/ui-react';

const manifestUrl = "https://afro-nodeweb3tondapp.netlify.app/tonconnect-manifest.json";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl} restoreConnection={true}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
