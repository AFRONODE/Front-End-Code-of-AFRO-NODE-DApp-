import React from 'react';
import ReactDOM from 'react-dom/client';
// Temporarily removed TonConnectUIProvider
import { App } from './App.jsx'; // Make sure this is '{ App }'
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
