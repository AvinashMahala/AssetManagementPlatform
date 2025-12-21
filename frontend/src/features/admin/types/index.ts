import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }> | LucideIcon;
  path: string;
  badge?: number;
  enabled: boolean;
}

export interface NavigationConfig {
  items: NavItem[];
  version: number;
}
