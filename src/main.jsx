// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // This line is crucial for Tailwind CSS processing
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// The manifest URL must point to your deployed JSON file.
// Since your manifest is in the public folder, the URL is correct relative to the site root.
const manifestUrl = "https://afro-nodedapp.netlify.app/tonconnect-manifest.json";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the App with the provider and pass the manifestUrl */}
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
