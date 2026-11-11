import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import App from '../App';
import { ConvexDataProvider } from './ConvexDataProvider';

/** Mounts the app on top of Convex. Loaded only when VITE_CONVEX_URL is set. */
export const mountCloud = (container: HTMLElement, convexUrl: string): void => {
  createRoot(container).render(
    <ConvexProvider client={new ConvexReactClient(convexUrl)}>
      <ConvexDataProvider>
        <App />
      </ConvexDataProvider>
    </ConvexProvider>
  );
};
