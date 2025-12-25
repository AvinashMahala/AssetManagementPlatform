import { Pool } from 'pg';
import { getRequestContext } from './cls.js';
import { OrganizationConnectionManager } from './OrganizationConnectionManager.js';

export const createMultiTenantPool = (): Pool => {
    const connectionManager = OrganizationConnectionManager.getInstance();
    
    // We use a Proxy to intercept all calls to the pool
    return new Proxy({} as Pool, {
        get: (target, prop) => {
            const context = getRequestContext();
            const pool = context ? context.db : connectionManager.getDefaultPool();
            
            // If accessing a property that is a function, bind it to the target pool
            const value = (pool as any)[prop];
            if (typeof value === 'function') {
                return value.bind(pool);
            }
            return value;
        }
    });
};
