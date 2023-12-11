// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './components/Popup.jsx'; // Make sure the path is correct
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

