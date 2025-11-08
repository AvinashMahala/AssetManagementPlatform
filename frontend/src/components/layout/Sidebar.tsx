import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Home,
  FileText,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  FileImage,
  Zap,
} from 'lucide-react';
import { useAuthContext } from '../../contexts';

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Properties', icon: Building2, path: '/properties' },
  { name: 'Units', icon: Home, path: '/units' },
  { name: 'Tenants', icon: Users, path: '/tenants' },
  { name: 'Leases', icon: FileText, path: '/leases' },
  { name: 'Payments', icon: CreditCard, path: '/payments' },
  { name: 'Meters', icon: Zap, path: '/meters' },
  { name: 'Templates', icon: FileImage, path: '/templates' },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              AssetPro
            </span>
          </div>
        )}
        {collapsed && (
          <Building2 className="h-8 w-8 text-blue-600 mx-auto" />
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.name : ''}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Profile"
            >
              <User className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 h-6 w-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      )}
    </div>
  );
};
