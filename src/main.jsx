import react from 'react';
import { createRoot } from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App.jsx';

const container = document.getElementById('root');
const root = createRoot(container);

const manifestUrl = 'https://afro-nodedapp.netlify.app/tonconnect-manifest.json';

root.render(
  <react.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </react.StrictMode>
);
