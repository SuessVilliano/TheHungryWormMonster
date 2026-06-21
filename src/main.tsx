import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/global.css';

// Entry point: mounts the React app into #root.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
