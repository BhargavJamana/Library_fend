import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1e2a',
            color: '#e8ecf4',
            border: '1px solid #252a38',
            borderRadius: '12px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#0d0f14' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#0d0f14' } },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);
