import { AsyncLocalStorage } from 'async_hooks';
import { Pool } from 'pg';

export interface RequestContext {
  orgId: string;
  db: Pool;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export const getRequestContext = () => requestContext.getStore();
