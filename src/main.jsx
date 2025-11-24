// src/main.jsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App.jsx';

// Get the root DOM element
const container = document.getElementById('root');
const root = createRoot(container);

// The manifest URL is required for TonConnect to identify your DApp.
// If hosted on Netlify, replace 'http://localhost:5173' with your deployed URL.
const manifestUrl = 'http://localhost:5173/tonconnect-manifest.json'; 

// Render the application
root.render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);
