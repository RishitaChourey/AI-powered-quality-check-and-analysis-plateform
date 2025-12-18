import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import RootApp from "./RootApp";
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
reportWebVitals();
