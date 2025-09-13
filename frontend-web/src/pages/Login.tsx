import React from 'react';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const { doLogin } = useAuth();
  const [username, setUsername] = React.useState('jane@example.com');
  const [password, setPassword] = React.useState('password');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await doLogin(username, password);
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    { username: 'jane@example.com', password: 'password', name: 'Jane (Soccer)' },
    { username: 'john@example.com', password: 'password123', name: 'John (Basketball)' }
  ];

  const fillDemoUser = (user: typeof demoUsers[0]) => {
    setUsername(user.username);
    setPassword(user.password);
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ 
          fontSize: 28, 
          fontWeight: '700', 
          color: '#1f2937', 
          margin: '0 0 8px 0' 
        }}>
          Welcome to Pickup Sports
        </h1>
        <p style={{ 
          fontSize: 16, 
          color: '#6b7280', 
          margin: 0 
        }}>
          Find and join sports games in your area
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ 
        backgroundColor: '#ffffff',
        padding: 32,
        borderRadius: 16,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ 
          fontSize: 20, 
          fontWeight: '600', 
          color: '#1f2937', 
          margin: '0 0 24px 0',
          textAlign: 'center'
        }}>
          Sign In
        </h2>
        
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: 6 
            }}>
              Email/Username
            </label>
            <input 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              type="text" 
              required 
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s ease-in-out',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: 14, 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: 6 
            }}>
              Password
            </label>
            <input 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              type="password" 
              required 
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.2s ease-in-out',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          
          {error && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: 14,
              padding: '8px 12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 6
            }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ 
          fontSize: 16, 
          fontWeight: '600', 
          color: '#374151', 
          margin: '0 0 12px 0',
          textAlign: 'center'
        }}>
          Demo Users
        </h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {demoUsers.map((user, index) => (
            <button
              key={index}
              type="button"
              onClick={() => fillDemoUser(user)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                color: '#374151',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            >
              {user.name} - {user.username}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

