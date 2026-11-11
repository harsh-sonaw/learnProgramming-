import {createRoot} from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import App from './App.tsx';
import { ConvexDataProvider } from './convex/ConvexDataProvider';
import './index.css';

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const app = convexUrl ? (
  <ConvexProvider client={new ConvexReactClient(convexUrl)}>
    <ConvexDataProvider>
      <App />
    </ConvexDataProvider>
  </ConvexProvider>
) : (
  <App />
);

createRoot(document.getElementById('root')!).render(app);
