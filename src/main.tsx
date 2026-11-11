import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;
const convexUrl = import.meta.env.VITE_CONVEX_URL;

// Cloud sync is opt-in and off by default. Requiring an explicit flag as well as
// a URL keeps a stray VITE_CONVEX_URL in .env.local from switching production on:
// without the flag the Convex client is never even downloaded.
const cloudSyncEnabled = import.meta.env.VITE_ENABLE_CLOUD_SYNC === 'true' && Boolean(convexUrl);

if (cloudSyncEnabled) {
  void import('./convex/mountCloud').then(module => module.mountCloud(container, convexUrl as string));
} else {
  createRoot(container).render(<App />);
}
