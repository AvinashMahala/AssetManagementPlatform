import { Request, Response, NextFunction } from 'express';
import { OrganizationConnectionManager } from '../infrastructure/database/OrganizationConnectionManager.js';
import { Pool } from 'pg';
import { requestContext } from '../infrastructure/database/cls.js';

// Extend Express Request to include db
declare global {
  namespace Express {
    interface Request {
      db: Pool;
      organizationId?: string;
    }
  }
}

export const organizationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const orgId = req.headers['x-organization-id'] as string;
  const connectionManager = OrganizationConnectionManager.getInstance();

  try {
    let pool: Pool;
    let activeOrgId: string;

    if (orgId) {
      // If header is present, try to connect to that organization
      pool = await connectionManager.getConnection(orgId);
      activeOrgId = orgId;
    } else {
      // No header present
      // Check if we should fallback to default (Dev/Test or explicit config)
      const allowDefault = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.ALLOW_DEFAULT_ORG === 'true';

      if (allowDefault) {
        // In Dev/Test, fallback to default pool
        // Only log if not in test to avoid noise
        if (process.env.NODE_ENV !== 'test') {
            console.log('[OrganizationMiddleware] No X-Organization-ID header. Using default pool (Dev Mode).');
        }
        pool = connectionManager.getDefaultPool();
        activeOrgId = 'default';
      } else {
        // In Production, require the header
        res.status(400).json({ 
          error: 'Organization ID required', 
          message: 'Missing X-Organization-ID header' 
        });
        return;
      }
    }

    // Attach to request (legacy support)
    req.db = pool;
    req.organizationId = activeOrgId;

    // Run next() within ALS context
    requestContext.run({ orgId: activeOrgId, db: pool }, () => {
      next();
    });

  } catch (error) {
    console.error('[OrganizationMiddleware] Error connecting to organization DB:', error);
    res.status(500).json({ 
      error: 'Database Connection Error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
