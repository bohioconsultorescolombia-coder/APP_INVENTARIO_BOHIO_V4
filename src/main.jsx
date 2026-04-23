import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Buscador de errores para móviles - Si la app falla al abrir, mostrará el error en pantalla
window.onerror = function (msg, url, lineNo, columnNo, error) {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:white;color:red;padding:20px;z-index:9999;overflow:auto;font-family:monospace;';
  container.innerHTML = '<h2>🚨 ERROR CRÍTICO DETECTADO:</h2><p>' + msg + '</p><p>Línea: ' + lineNo + '</p><pre>' + (error ? error.stack : '') + '</pre>';
  document.body.appendChild(container);
  return false;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
