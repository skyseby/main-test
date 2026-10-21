import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

/*
 * Remove service workers from earlier previews. Older workers could intercept
 * JavaScript requests and return the HTML fallback, causing:
 * "Uncaught SyntaxError: Unexpected token '<'".
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .getRegistrations()
      .then(registrations => Promise.all(registrations.map(registration => registration.unregister())))
      .catch(() => {
        // The app does not depend on service-worker support.
      });
  });
}