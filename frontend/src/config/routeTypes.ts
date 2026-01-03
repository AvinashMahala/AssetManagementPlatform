import React from 'react';

// Route configuration types
export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  isPublic?: boolean;
  isProtected?: boolean;
  requiredRole?: 'admin' | 'user';
  // Optional granular permission guard (preferred): use a permission string like 'admin:roles:manage'
  requiredPermission?: string;
}