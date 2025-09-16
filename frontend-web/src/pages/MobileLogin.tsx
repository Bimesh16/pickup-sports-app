import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '@components/ui';
import { useBiometricAuth } from '@hooks/useBiometricAuth';
import { useSystemDarkMode } from '@hooks/useSystemDarkMode';
import { useKeyboardHandler } from '@hooks/useKeyboardHandler';
import { 
  Eye, 
  EyeOff, 
  Fingerprint, 
  User, 
  Lock, 
  Gamepad2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@lib/utils';

const MobileLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const {
    isSupported: isBiometricSupported,
    isAvailable: isBiometricAvailable,
    isEnrolled: isBiometricEnrolled,
    biometricType,
    isLoading: isBiometricLoading,
    authenticateBiometric,
    getBiometricTypeName,
    getBiometricIcon,
  } = useBiometricAuth();

  const { isDark, toggleTheme } = useSystemDarkMode();
  
  // Keyboard handling for mobile
  useKeyboardHandler();

  // Auto-focus email input on mount
  useEffect(() => {
    const emailInput = document.getElementById('email-input');
    if (emailInput) {
      emailInput.focus();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'user-123',
        email,
        firstName: 'John',
        lastName: 'Doe'
      }));

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      }

      navigate('/dashboard');
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      await authenticateBiometric();
      navigate('/dashboard');
    } catch (error) {
      setError('Biometric authentication failed');
    }
  };

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--brand-primary)] rounded-xl flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">Pickup Sports</h1>
            <p className="text-sm text-[var(--text-muted)]">Welcome back</p>
          </div>
        </div>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-[var(--bg-muted)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-sm mx-auto w-full">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
              Sign in to your account
            </h2>
            <p className="text-[var(--text-muted)]">
              Join games, discover venues, and connect with players
            </p>
          </div>

          {/* Login Form */}
          <Card className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div>
                <label htmlFor="email-input" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Email address
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <Input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 h-12 text-base"
                    required
                    autoComplete="email"
                    data-testid="email-input"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password-input" className="block text-sm font-medium text-[var(--text)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <Input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12 text-base"
                    required
                    autoComplete="current-password"
                    data-testid="password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[var(--brand-primary)] bg-[var(--bg-surface)] border-[var(--border)] rounded focus:ring-[var(--brand-primary)] focus:ring-2"
                  />
                  <span className="text-sm text-[var(--text)]">Remember me</span>
                </label>
                
                <button
                  type="button"
                  className="text-sm text-[var(--brand-primary)] hover:text-[var(--brand-primary)]/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
                data-testid="login-button"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Biometric Login */}
            {isBiometricSupported && isBiometricAvailable && isBiometricEnrolled && (
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <div className="text-center">
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    Or sign in with {getBiometricTypeName()}
                  </p>
                  
                  <button
                    onClick={handleBiometricLogin}
                    disabled={isBiometricLoading}
                    className={cn(
                      "w-full h-12 rounded-lg border-2 border-dashed border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 flex items-center justify-center gap-2 text-[var(--brand-primary)] font-medium transition-all duration-200",
                      "hover:bg-[var(--brand-primary)]/10 hover:border-[var(--brand-primary)]/80",
                      "active:scale-95 touch-manipulation",
                      isBiometricLoading && "opacity-50 cursor-not-allowed"
                    )}
                    data-testid="biometric-login-button"
                  >
                    <span className="text-2xl">{getBiometricIcon()}</span>
                    <span>
                      {isBiometricLoading ? 'Authenticating...' : `Sign in with ${getBiometricTypeName()}`}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Don't have an account?{' '}
                <button className="text-[var(--brand-primary)] hover:text-[var(--brand-primary)]/80 font-medium transition-colors">
                  Sign up
                </button>
              </p>
            </div>
          </Card>

          {/* Features */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-[var(--success)]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Gamepad2 className="w-6 h-6 text-[var(--success)]" />
              </div>
              <p className="text-xs text-[var(--text-muted)]">Join Games</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-[var(--info)]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-[var(--info)]" />
              </div>
              <p className="text-xs text-[var(--text-muted)]">Easy Booking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-xs text-[var(--text-muted)]">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default MobileLogin;
