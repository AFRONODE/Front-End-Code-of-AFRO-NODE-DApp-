// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// 1. Import the provider
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// 2. Define the manifest URL using your actual deployed site
// ADOPTED TO NEW URL: https://afro-nodedapp.netlify.app/
const manifestUrl = "https://afro-nodedapp.netlify.app/tonconnect-manifest.json";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. Wrap the App with the provider and pass the new URL */}
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
)
