import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  Key,
  LogOut,
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Palette,
  ChevronRight,
  Edit3,
  Camera,
  Activity,
  Sun,
  Moon,
  Coffee
} from 'lucide-react';
import { ProfileForm, ResetPasswordForm, SessionsPanel } from '../components';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import {
  ProfileAvatarSkeleton,
  ProfileStatsSkeleton
} from '@/componentDesignLibrary';
import { Tooltip, ExpandableSection } from '@/componentDesignLibrary';
import { useAuthContext } from '@/contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuthContext();
  const [greeting, setGreeting] = useState('');

  const handleUpdateSuccess = () => {
    // Profile updated successfully
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 17) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase();
    if (email) return email[0].toUpperCase();
    return 'U';
  };

  const getUserRole = () => {
    return user.role || 'User';
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return <Sun className="h-5 w-5 text-yellow-500" />;
    else if (hour < 17) return <Coffee className="h-5 w-5 text-orange-500" />;
    else return <Moon className="h-5 w-5 text-indigo-500" />;
  };

  // Mock stats - in a real app, these would come from an API
  const userStats = {
    properties: 12,
    tenants: 45,
    payments: 234,
    daysActive: 180
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your account and preferences
              </p>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            {getGreetingIcon()}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {greeting}, {user.name?.split(' ')[0] || 'User'}!
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back to your AssetPro dashboard. Here's your account overview.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Profile Overview Card */}
                    {/* Profile Overview Card */}
          <div className="xl:col-span-1">
            <Card className="sticky top-8 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="pt-8">
                {authLoading || !user ? (
                  <ProfileAvatarSkeleton />
                ) : (
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Avatar with enhanced styling */}
                    <div className="relative group">
                      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-2xl ring-4 ring-white/50 dark:ring-gray-800/50 transition-all duration-300 group-hover:scale-105">
                        {getInitials(user.name, user.email)}
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <button className="absolute bottom-2 right-2 h-8 w-8 bg-white/90 dark:bg-gray-700/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg">
                        <Camera className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>

                    {/* User Info */}
                    <div className="space-y-3">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user.name || user.username || 'User'}
                        </h2>
                        <Tooltip content={`Your account role: ${getUserRole()}. This determines your access level and permissions in the system.`}>
                          <Badge variant="secondary" className="mt-2 text-sm px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border-0 cursor-help">
                            {getUserRole()}
                          </Badge>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="w-full space-y-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                      <Tooltip content="Your primary email address used for account access and notifications">
                        <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-700/30 rounded-lg p-3 transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-600/30">
                          <Mail className="h-5 w-5 text-blue-500" />
                          <span className="truncate flex-1">{user.email}</span>
                        </div>
                      </Tooltip>
                      {user.createdAt && (
                        <Tooltip content={`Account created on ${new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}>
                          <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-700/30 rounded-lg p-3 transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-600/30">
                            <Calendar className="h-5 w-5 text-green-500" />
                            <span className="flex-1">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </Tooltip>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="w-full pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span>Quick Stats</span>
                      </h3>
                      {authLoading ? (
                        <ProfileStatsSkeleton />
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <Tooltip content="Total number of properties you manage in the system">
                            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg cursor-help hover:scale-105 transition-transform">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.properties}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Properties</div>
                            </div>
                          </Tooltip>
                          <Tooltip content="Total number of tenants across all your properties">
                            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg cursor-help hover:scale-105 transition-transform">
                              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.tenants}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Tenants</div>
                            </div>
                          </Tooltip>
                          <Tooltip content="Total number of rent payments collected this month">
                            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg cursor-help hover:scale-105 transition-transform">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.payments}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Payments</div>
                            </div>
                          </Tooltip>
                          <Tooltip content="Number of days since you first joined the platform">
                            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg cursor-help hover:scale-105 transition-transform">
                              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{userStats.daysActive}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Days Active</div>
                            </div>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Profile Information */}
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Profile Information</CardTitle>
                      <CardDescription className="text-sm">
                        Update your personal information and account details
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ProfileForm
                  onSuccess={handleUpdateSuccess}
                  onCancel={handleCancel}
                />
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Key className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Security Settings</CardTitle>
                    <CardDescription className="text-sm">
                      Manage your password and account security options
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ResetPasswordForm
                  onSuccess={() => {/* Handle success */}}
                  onBack={() => {/* No back action needed */}}
                />
              </CardContent>
            </Card>

            {/* Sessions */}
            <div>
              {/* use SessionsPanel component */}
              <SessionsPanel />
            </div>

            {/* Account Actions */}
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Account Actions</CardTitle>
                    <CardDescription className="text-sm">
                      Manage your account preferences and settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/navigation-config')}
                    className="w-full justify-between h-12 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-[1.02] border-2"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Palette className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Navigation Settings</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Customize your sidebar menu</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="w-full justify-between h-12 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 hover:scale-[1.02] border-2"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Back to Dashboard</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Return to main dashboard</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Button>

                  {/* Advanced Account Settings - Expandable */}
                  <ExpandableSection
                    title="Advanced Account Settings"
                    defaultExpanded={false}
                    className="mt-4"
                    headerClassName="bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-lg"
                    contentClassName="space-y-3"
                  >
                    <Tooltip content="Download all your account data including properties, tenants, and transaction history">
                      <Button
                        variant="outline"
                        className="w-full justify-between h-12 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 hover:scale-[1.02] border-2"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-sm">Export Account Data</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Download your data in JSON format</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Button>
                    </Tooltip>

                    <Tooltip content="Permanently delete your account and all associated data. This action cannot be undone.">
                      <Button
                        variant="outline"
                        className="w-full justify-between h-12 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-[1.02] border-2 border-red-200 dark:border-red-800"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-sm text-red-600 dark:text-red-400">Delete Account</div>
                            <div className="text-xs text-red-500 dark:text-red-400">Permanently remove your account</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Button>
                    </Tooltip>
                  </ExpandableSection>

                  <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                    <Button
                      variant="destructive"
                      onClick={handleLogout}
                      className="w-full justify-between h-12 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-[1.02] border-2 border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm">Sign Out</div>
                          <div className="text-xs text-red-500 dark:text-red-400">Securely log out of your account</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};