import { createRoot } from 'react-dom/client';
import App from './app/App';
import { createLogger } from './lib/logger';
import { initializeStore } from './store';
import './index.css';

const log = createLogger('app');

window.addEventListener('unhandledrejection', (event) => {
  log.error('Unhandled promise rejection', event.reason);
});
window.addEventListener('error', (event) => {
  log.error('Uncaught error', event.error ?? event.message);
});

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root was not found in index.html');

void initializeStore();
createRoot(container).render(<App />);
