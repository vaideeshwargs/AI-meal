import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA offline caching & auto-updates
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  try {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[PWA] New content available, ready to reload.');
      },
      onOfflineReady() {
        console.log('[PWA] App is ready to work offline.');
      },
    });
  } catch (e) {
    console.warn('[PWA] Service worker registration bypassed:', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
