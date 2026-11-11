/* eslint-disable */
/**
 * Generated Convex API references.
 * Run `npm run convex:dev` to regenerate these references for the deployment.
 */
import { anyApi } from 'convex/server';
import type { ApiFromModules, FilterApi, FunctionReference } from 'convex/server';
import type * as app from '../app';

const fullApi = anyApi as unknown as ApiFromModules<{ app: typeof app }>;
export const api: FilterApi<typeof fullApi, FunctionReference<any, 'public'>> = fullApi;
export const internal: FilterApi<typeof fullApi, FunctionReference<any, 'internal'>> = fullApi;
