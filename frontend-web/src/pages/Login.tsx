// src/pages/Login.tsx - Enhanced Login Page with Social Auth

import React, { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { Button, Input, Card, Tabs } from '@components/ui';
import { theme } from '@styles/theme';
import { NEPALI_GREETINGS } from '@constants/nepal';
import { validateForm, validatePhoneNumber, validateSocialMedia } from '@lib/validation';

export function Login() {
  const { login, register, socialLogin, isLoading } = useAuth();
  const [greeting] = useState(() => 
    NEPALI_GREETINGS[Math.floor(Math.random() * NEPALI_GREETINGS.length)]
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.gradients.mountain,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme.patterns.prayer,
        opacity: 0.1,
        backgroundSize: '50px 50px'
      }} />
      
      {/* Floating Mountains */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '100px',
        height: '100px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        animation: theme.animations.bounce
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '15%',
        width: '80px',
        height: '80px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        animation: theme.animations.pulse
      }} />

      <div style={{
        width: '100%',
        maxWidth: '450px',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: theme.spacing.xl,
          color: 'white'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: theme.spacing.sm,
            animation: theme.animations.pulse
          }}>
            🏔️⚽
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            खेल मिलन
          </h1>
          <p style={{
            fontSize: '18px',
            margin: '0 0 8px 0',
            opacity: 0.9
          }}>
            Pickup Sports Nepal
          </p>
          <p style={{
            fontSize: '14px',
            opacity: 0.8,
            margin: 0
          }}>
            {greeting}
          </p>
        </div>

        <Card elevated padding="xl">
          <Tabs
            tabs={[
              {
                id: 'login',
                label: 'Sign In',
                content: <LoginForm />
              },
              {
                id: 'register',
                label: 'Sign Up',
                content: <RegisterForm />
              }
            ]}
          />
        </Card>

        {/* Social Login */}
        <div style={{
          marginTop: theme.spacing.lg,
          textAlign: 'center'
        }}>
          <p style={{
            color: 'white',
            fontSize: '14px',
            marginBottom: theme.spacing.md,
            opacity: 0.9
          }}>
            Or continue with
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: theme.spacing.sm,
            justifyContent: 'center'
          }}>
            <Button
              variant="outline"
              onClick={() => socialLogin('google')}
              disabled={isLoading}
              leftIcon="🔍"
              style={{
                background: 'white',
                color: '#374151',
                border: '1px solid #e5e7eb'
              }}
            >
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => socialLogin('facebook')}
              disabled={isLoading}
              leftIcon="📘"
              style={{
                background: 'white',
                color: '#374151',
                border: '1px solid #e5e7eb'
              }}
            >
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => socialLogin('instagram')}
              disabled={isLoading}
              leftIcon="📷"
              style={{
                background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                color: 'white',
                border: 'none'
              }}
            >
              Instagram
            </Button>
            <Button
              variant="outline"
              onClick={() => socialLogin('tiktok')}
              disabled={isLoading}
              leftIcon="🎵"
              style={{
                background: '#000000',
                color: 'white',
                border: '1px solid #333333'
              }}
            >
              TikTok
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Login Form Component
function LoginForm() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleDemoUser = (username: string, password: string) => {
    setFormData({ username, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Username or Email"
        type="text"
        value={formData.username}
        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
        placeholder="Enter your username or email"
        leftIcon="👤"
        required
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        placeholder="Enter your password"
        leftIcon="🔒"
        required
      />

      <div style={{ textAlign: 'right', marginBottom: theme.spacing.md }}>
        <button
          type="button"
          onClick={() => alert('Forgot password feature coming soon!')}
          style={{
            background: 'none',
            border: 'none',
            color: theme.colors.primary,
            fontSize: '14px',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Forgot Password?
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: theme.spacing.sm,
          borderRadius: theme.radius.md,
          marginBottom: theme.spacing.md,
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        style={{ width: '100%', marginBottom: theme.spacing.md }}
      >
        Sign In
      </Button>

      <div style={{
        textAlign: 'center',
        fontSize: '14px',
        color: theme.colors.muted
      }}>
        <p style={{ margin: '0 0 8px 0' }}>Demo Users:</p>
        <div style={{ display: 'flex', gap: theme.spacing.xs, justifyContent: 'center' }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoUser('jane@example.com', 'password')}
            style={{ fontSize: '12px' }}
          >
            Jane
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoUser('john@example.com', 'password123')}
            style={{ fontSize: '12px' }}
          >
            John
          </Button>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: theme.spacing.md,
        fontSize: '14px',
        color: theme.colors.muted
      }}>
        <p style={{ margin: '0' }}>
          New here?{' '}
          <button
            type="button"
            onClick={() => {/* Switch to register tab */}}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.primary,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            Join the League
          </button>
        </p>
      </div>
    </form>
  );
}

// Register Form Component
function RegisterForm() {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    gender: '',
    phoneNumber: '',
    playerTag: '',
    socialMedia: {
      instagram: '',
      tiktok: '',
      facebook: '',
      twitter: ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});
    
    // Validate form
    const validation = validateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    try {
      await register(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
        <Input
          label="First Name"
          type="text"
          value={formData.firstName}
          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          placeholder="First name"
        />
        <Input
          label="Last Name"
          type="text"
          value={formData.lastName}
          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          placeholder="Last name"
        />
      </div>

      <Input
        label="Username"
        type="text"
        value={formData.username}
        onChange={(e) => {
          setFormData(prev => ({ ...prev, username: e.target.value }));
          if (errors.username) {
            setErrors(prev => ({ ...prev, username: '' }));
          }
        }}
        placeholder="Choose a username"
        leftIcon="👤"
        required
        error={errors.username}
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => {
          setFormData(prev => ({ ...prev, email: e.target.value }));
          if (errors.email) {
            setErrors(prev => ({ ...prev, email: '' }));
          }
        }}
        placeholder="Enter your email"
        leftIcon="📧"
        required
        error={errors.email}
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => {
          setFormData(prev => ({ ...prev, password: e.target.value }));
          if (errors.password) {
            setErrors(prev => ({ ...prev, password: '' }));
          }
        }}
        placeholder="Create a password"
        leftIcon="🔒"
        required
        error={errors.password}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: theme.spacing.xs,
            fontSize: '14px',
            fontWeight: '500',
            color: theme.colors.text
          }}>
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            style={{
              width: '100%',
              padding: theme.spacing.sm,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.md,
              fontSize: '14px',
              backgroundColor: 'white',
              color: theme.colors.text,
              fontWeight: '500'
            }}
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>
        <div>
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, phoneNumber: e.target.value }));
              // Clear error when user starts typing
              if (errors.phoneNumber) {
                setErrors(prev => ({ ...prev, phoneNumber: '' }));
              }
            }}
            placeholder="+977 98XXXXXXXX"
            leftIcon="📱"
            error={errors.phoneNumber}
          />
        </div>
      </div>

      <Input
        label="Player Tag"
        type="text"
        value={formData.playerTag}
        onChange={(e) => setFormData(prev => ({ ...prev, playerTag: e.target.value }))}
        placeholder="Enter your unique player tag (e.g., player23, striker99)"
        leftIcon="🏷️"
      />

      {/* Social Media Section */}
      <div style={{
        marginTop: theme.spacing.md,
        padding: theme.spacing.md,
        background: theme.colors.background,
        borderRadius: theme.radius.lg,
        border: `1px solid ${theme.colors.border}`
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          margin: '0 0 16px 0',
          color: theme.colors.text,
          textAlign: 'center'
        }}>
          Social Media (Optional)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
          <Input
            label="Instagram"
            type="text"
            value={formData.socialMedia.instagram}
            onChange={(e) => {
              setFormData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, instagram: e.target.value }
              }));
              if (errors.instagram) {
                setErrors(prev => ({ ...prev, instagram: '' }));
              }
            }}
            placeholder="@username"
            leftIcon="📷"
            error={errors.instagram}
          />
          <Input
            label="TikTok"
            type="text"
            value={formData.socialMedia.tiktok}
            onChange={(e) => {
              setFormData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, tiktok: e.target.value }
              }));
              if (errors.tiktok) {
                setErrors(prev => ({ ...prev, tiktok: '' }));
              }
            }}
            placeholder="@username"
            leftIcon="🎵"
            error={errors.tiktok}
          />
          <Input
            label="Facebook"
            type="text"
            value={formData.socialMedia.facebook}
            onChange={(e) => {
              setFormData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, facebook: e.target.value }
              }));
              if (errors.facebook) {
                setErrors(prev => ({ ...prev, facebook: '' }));
              }
            }}
            placeholder="username"
            leftIcon="👥"
            error={errors.facebook}
          />
          <Input
            label="Twitter"
            type="text"
            value={formData.socialMedia.twitter}
            onChange={(e) => {
              setFormData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, twitter: e.target.value }
              }));
              if (errors.twitter) {
                setErrors(prev => ({ ...prev, twitter: '' }));
              }
            }}
            placeholder="@username"
            leftIcon="🐦"
            error={errors.twitter}
          />
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: theme.spacing.sm,
          borderRadius: theme.radius.md,
          marginBottom: theme.spacing.md,
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        style={{ width: '100%' }}
      >
        Join the League
      </Button>
    </form>
  );
}
