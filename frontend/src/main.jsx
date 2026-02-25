import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

// NOTE: React.StrictMode intentionally double-invokes functions in development
// which causes duplicate toasts & other side-effect duplications. Removed intentionally.
ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
