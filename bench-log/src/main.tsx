import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { ensurePersisted } from './lib/storage';

// Hash routing so the built site drops onto any static host with no rewrite
// rules to maintain (non-negotiable 6). Persistence is requested once per
// launch and never awaited; /data shows what the browser decided.
void ensurePersisted(navigator.storage);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
