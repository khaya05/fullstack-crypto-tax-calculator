import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import GlobalStyle from './components/GlobalStyle.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <GlobalStyle />
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.body.innerHTML = `
    <div style="padding: 2rem; color: red; font-family: monospace;">
      <h1>Application Error</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `;
}
