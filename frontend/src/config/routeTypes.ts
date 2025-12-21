import React from 'react';

// Route configuration types
export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  isPublic?: boolean;
  isProtected?: boolean;
  requiredRole?: 'admin' | 'user';
}