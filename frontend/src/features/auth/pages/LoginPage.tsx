import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Moon,
  Sun,
} from 'lucide-react';
import { Card } from '@/componentDesignLibrary';
import { FloatingParticles } from '@/componentDesignLibrary';
import { AuthLoading } from '@/componentDesignLibrary';
import { useAuthContext } from '@/contexts/AuthContext';
import { LoginForm, RegisterForm, ResetPasswordForm } from '../components';

type AuthView = 'login' | 'register' | 'reset-password';
type AuthMode = 'signin' | 'signup';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const loginEmailRef = React.useRef<HTMLInputElement | null>(null);

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
    if (isAuthenticated && !showSuccess) {
      setShowSuccess(true);
      // Show success animation for 1.5 seconds before navigating
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  }, [isAuthenticated, showSuccess, navigate]);

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

  const features = [
    {
      icon: Building2,
      title: 'Asset Management',
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

  // Show success state before navigation
  if (showSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${isDarkMode ? 'dark' : ''}`}>
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-900 dark:via-blue-900 dark:to-purple-900 transition-all duration-500" />
          <FloatingParticles count={15} />
        </div>
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-0 shadow-2xl p-8">
          <AuthLoading
            message="Welcome back! Redirecting to dashboard..."
            variant="success"
          />
        </Card>
      </div>
    );
  }

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
                <LoginForm
                  emailRef={loginEmailRef}
                  onSwitchToRegister={() => {
                    setAuthMode('signup');
                    setCurrentView('register');
                  }}
                  onForgotPassword={() => setCurrentView('reset-password')}
                />
              )}

              {currentView === 'register' && (
                <RegisterForm
                  onSwitchToLogin={() => {
                    setAuthMode('signin');
                    setCurrentView('login');
                    // Focus the login email input after switching
                    setTimeout(() => {
                      try { loginEmailRef.current?.focus(); } catch (_e) {}
                    }, 0);
                  }}
                />
              )}

              {currentView === 'reset-password' && (
                <ResetPasswordForm
                  onBack={() => {
                    setAuthMode('signin');
                    setCurrentView('login');
                  }}
                />
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
