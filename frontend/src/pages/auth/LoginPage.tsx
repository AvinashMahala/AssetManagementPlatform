import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Key,
  UserPlus,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Users,
  DollarSign,
  TrendingUp,
  Moon,
  Sun,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { FloatingParticles } from '../../components/ui/floating-particles';
import { AuthLoading } from '../../components/ui/auth-loading';
import { useAuthContext } from '../../contexts/AuthContext';

type AuthView = 'login' | 'register' | 'reset-password';
type AuthMode = 'signin' | 'signup';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuthContext();
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'demo@assetplatform.com',
    password: 'demo123',
    firstName: '',
    lastName: '',
    company: '',
    resetEmail: ''
  });

  // Demo credentials for quick testing
  const demoCredentials = {
    email: 'demo@assetplatform.com',
    password: 'demo123'
  };

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Handle successful authentication - redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleDemoLogin = async () => {
    const success = await login(demoCredentials);
    if (success) {
      // Navigation will be handled by the useEffect above
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentView === 'login') {
      await login({ email: formData.email, password: formData.password });
      // Navigation will be handled by the useEffect above
    } else if (currentView === 'register') {
      // For now, just switch back to login - registration would need backend implementation
      setCurrentView('login');
      setAuthMode('signin');
    } else if (currentView === 'reset-password') {
      // For now, just switch back to login - password reset would need backend implementation
      setCurrentView('login');
      setAuthMode('signin');
    }
  };

  const features = [
    {
      icon: Building2,
      title: 'Property Management',
      description: 'Manage multiple properties with ease'
    },
    {
      icon: Users,
      title: 'Tenant Portal',
      description: 'Streamlined tenant communication'
    },
    {
      icon: DollarSign,
      title: 'Rent Collection',
      description: 'Automated payment tracking'
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Comprehensive reporting & insights'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Property Manager',
      content: 'This platform has revolutionized how I manage my properties. So intuitive and powerful!',
      avatar: 'SJ'
    },
    {
      name: 'Mike Chen',
      role: 'Real Estate Investor',
      content: 'The analytics and reporting features are incredible. Highly recommend!',
      avatar: 'MC'
    }
  ];

  // Show loading state
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${isDarkMode ? 'dark' : ''}`}>
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-all duration-500" />
          <FloatingParticles count={15} />
        </div>
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-0 shadow-2xl p-8">
          <AuthLoading
            message="Signing you in..."
            variant="pulse"
          />
        </Card>
      </div>
    );
  }

  // Don't show success state since navigation happens immediately

  return (
    <div className={`min-h-screen flex transition-all duration-500 ${isDarkMode ? 'dark' : ''}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-all duration-500" />
        <FloatingParticles count={25} />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
      </div>

      {/* Left Panel - Hero Content */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-indigo-600/90 backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          {/* Logo & Brand */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-bold">AssetFlow</h1>
            </div>
            <p className="text-xl text-blue-100 leading-relaxed">
              Streamline your property management with our comprehensive platform designed for modern landlords and property managers.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300">
                <feature.icon className="w-8 h-8 mb-3 text-blue-200" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-blue-100">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">What our users say</h3>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-sm font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-blue-200">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-sm text-blue-100 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>

        <div className="w-full max-w-md space-y-8">
          {/* Mode Toggle */}
          <div className="flex justify-center">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full p-1 flex">
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setCurrentView('login');
                }}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setCurrentView('register');
                }}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Auth Forms Container */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl">
            <div className="p-8">
              {currentView === 'login' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Key className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Welcome Back
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Sign in to your account to continue
                    </p>
                  </div>

                  <Button
                    onClick={handleDemoLogin}
                    variant="outline"
                    className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30"
                    disabled={authLoading}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Try Demo Account
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                    </div>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setCurrentView('reset-password')}
                        className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={authLoading}
                    >
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Don't have an account?{' '}
                      <button
                        onClick={() => {
                          setAuthMode('signup');
                          setCurrentView('register');
                        }}
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {currentView === 'register' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Join AssetFlow
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Create your account and start managing properties today
                    </p>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="mt-1 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="mt-1 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="regEmail" className="text-gray-700 dark:text-gray-300">Email</Label>
                      <Input
                        id="regEmail"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <Label htmlFor="regPassword" className="text-gray-700 dark:text-gray-300">Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="regPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="company" className="text-gray-700 dark:text-gray-300">Company (Optional)</Label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Your Property Management Company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="mt-1 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="terms" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                        I agree to the{' '}
                        <button className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                          Privacy Policy
                        </button>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={authLoading}
                    >
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Already have an account?{' '}
                      <button
                        onClick={() => {
                          setAuthMode('signin');
                          setCurrentView('login');
                        }}
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {currentView === 'reset-password' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Reset Password
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Enter your email and we'll send you a reset link
                    </p>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="resetEmail" className="text-gray-700 dark:text-gray-300">Email</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.resetEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, resetEmail: e.target.value }))}
                        className="mt-1 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={authLoading}
                    >
                      Send Reset Link
                      <Zap className="w-4 h-4 ml-2" />
                    </Button>
                  </form>

                  <div className="text-center">
                    <button
                      onClick={() => setCurrentView('login')}
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      ← Back to sign in
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Secured with enterprise-grade encryption •{' '}
              <button className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
