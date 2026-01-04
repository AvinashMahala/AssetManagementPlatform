import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Home,
  FileText,
  CreditCard,
  Receipt,
  Zap,
  FileImage,
  Wrench,
  Settings,
  ClipboardList,
  Percent,
} from 'lucide-react';
import type { NavItem, NavigationConfig } from '../types';

// Default navigation items
const defaultNavItems: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', enabled: true, requiredPermission: 'dashboard:dashboard:view' },
  { id: 'properties', name: 'Properties', icon: Building2, path: '/properties', enabled: true },
  { id: 'units', name: 'Units', icon: Home, path: '/units', enabled: true },
  { 
    id: 'utilities', 
    name: 'Utilities', 
    icon: Zap, 
    path: '/utilities', 
    enabled: true,
    children: [
      { id: 'utility-types', name: 'Utility Types', icon: Settings, path: '/admin/utility-types', enabled: true },
      { id: 'utility-subscriptions', name: 'Utility Subscriptions', icon: ClipboardList, path: '/utility-subscriptions', enabled: true },
      { id: 'meters', name: 'Meters', icon: Zap, path: '/meters', enabled: true },
      { id: 'tariffs', name: 'Tariffs', icon: Percent, path: '/tariffs', enabled: true },
      { id: 'meter-allocations', name: 'Meter Allocations', icon: Zap, path: '/meter-allocations', enabled: true },
    ]
  },
  { id: 'tenants', name: 'Tenants', icon: Users, path: '/tenants', enabled: true },
  { id: 'leases', name: 'Leases', icon: FileText, path: '/leases', enabled: true },
  { id: 'expenses', name: 'Expenses', icon: Receipt, path: '/expenses', enabled: true },
  { id: 'payments', name: 'Payments', icon: CreditCard, path: '/payments', enabled: true },
  { id: 'bulk-operations', name: 'Bulk Operations', icon: Wrench, path: '/bulk-operations', enabled: true },
  { id: 'files', name: 'Files', icon: FileText, path: '/files', enabled: true, requiredPermission: 'files:file:view' },
  { id: 'templates', name: 'Templates', icon: FileImage, path: '/templates', enabled: true, requiredPermission: 'templates:receipttemplate:view' },
];

const STORAGE_KEY = 'asset-management-nav-config';
const CONFIG_VERSION = 4;

export function useNavigationConfig() {
  const [config, setConfig] = useState<NavigationConfig>({
    items: defaultNavItems,
    version: CONFIG_VERSION,
  });
  const [loading, setLoading] = useState(true);
  // RBAC-sensitive visibility
  const { useCan } = {} as any; // placeholder to keep typecheck safe if RBAC context is not available
  let canCheck: (perm?: string) => boolean = () => true;
  try {
    // Import useCan from RBAC context dynamically to avoid circular imports during initialization
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rbac = require('@/contexts/RBACContext');
    canCheck = rbac.useCan;
  } catch (e) {
    // Fallback: if RBAC context is not available, allow items by default
  }

  // Load configuration from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedConfig: NavigationConfig = JSON.parse(stored);

        // Check if we need to migrate from old format or add new items
        if (parsedConfig.version !== CONFIG_VERSION) {
          // Migrate: merge with default items, preserving order and enabled state
          const migratedItems = defaultNavItems.map(defaultItem => {
            const existingItem = parsedConfig.items.find(item => item.id === defaultItem.id);
            return existingItem ? { ...defaultItem, enabled: existingItem.enabled } : defaultItem;
          });

          // Add any new items that weren't in the stored config
          parsedConfig.items.forEach(storedItem => {
            if (!migratedItems.find(item => item.id === storedItem.id)) {
              migratedItems.push(storedItem);
            }
          });

          const newConfig = {
            items: migratedItems,
            version: CONFIG_VERSION,
          };

          setConfig(newConfig);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
        } else {
          // Restore icon components from defaults since they get lost during JSON serialization
          const restoredItems = parsedConfig.items.map(storedItem => {
            const defaultItem = defaultNavItems.find(item => item.id === storedItem.id);
            return defaultItem ? { ...defaultItem, enabled: storedItem.enabled } : storedItem;
          });

          setConfig({
            ...parsedConfig,
            items: restoredItems,
          });
        }
      }
    } catch (error) {
      console.error('Error loading navigation config:', error);
      // Fall back to defaults
      setConfig({
        items: defaultNavItems,
        version: CONFIG_VERSION,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Save configuration to localStorage
  const saveConfig = (newConfig: NavigationConfig) => {
    try {
      // Create a serializable version without React components
      const serializableConfig = {
        ...newConfig,
        items: newConfig.items.map(item => ({
          id: item.id,
          name: item.name,
          path: item.path,
          badge: item.badge,
          enabled: item.enabled,
        })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error('Error saving navigation config:', error);
    }
  };

  // Update navigation order
  const updateOrder = (items: NavItem[]) => {
    const newConfig = {
      ...config,
      items,
    };
    saveConfig(newConfig);
  };

  // Toggle item visibility
  const toggleItem = (itemId: string) => {
    const newItems = config.items.map(item =>
      item.id === itemId ? { ...item, enabled: !item.enabled } : item
    );
    const newConfig = {
      ...config,
      items: newItems,
    };
    saveConfig(newConfig);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    const defaultConfig = {
      items: defaultNavItems,
      version: CONFIG_VERSION,
    };
    saveConfig(defaultConfig);
  };

  // Get enabled items in order
  const getEnabledItems = () => {
    return config.items.filter(item => item.enabled && (!item.requiredPermission || canCheck(item.requiredPermission)));
  };

  return {
    config,
    loading,
    updateOrder,
    toggleItem,
    resetToDefaults,
    getEnabledItems,
  };
}