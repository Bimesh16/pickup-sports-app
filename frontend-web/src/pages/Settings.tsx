// src/pages/Settings.tsx - App Settings and Preferences

import React, { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { Button, Card, Input, Badge } from '@components/ui';
import { theme } from '@styles/theme';

export function Settings() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      gameInvites: true,
      gameReminders: true,
      weatherAlerts: false,
      socialUpdates: true
    },
    privacy: {
      showLocation: true,
      showPhone: false,
      showSocialMedia: true,
      allowDirectMessages: true
    },
    preferences: {
      language: 'en',
      timezone: 'Asia/Kathmandu',
      theme: 'nepal',
      units: 'metric'
    }
  });

  const handleSave = async () => {
    // Here you would save settings to the backend
    console.log('Saving settings:', settings);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.gradients.mountain,
      padding: theme.spacing.lg
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: theme.spacing.xl,
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Settings
          </h1>
          <p style={{
            fontSize: '16px',
            opacity: 0.9,
            margin: 0
          }}>
            Customize your app experience
          </p>
        </div>

        {/* Notification Settings */}
        <Card style={{
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.lg
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 16px 0',
            color: theme.colors.text
          }}>
            🔔 Notifications
          </h2>
          <div style={{ display: 'grid', gap: theme.spacing.md }}>
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing.md,
                background: theme.colors.background,
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.colors.border}`
              }}>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: '0 0 4px 0',
                    color: theme.colors.text
                  }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: theme.colors.muted,
                    margin: 0
                  }}>
                    {key === 'gameInvites' && 'Get notified when someone invites you to a game'}
                    {key === 'gameReminders' && 'Receive reminders before your games start'}
                    {key === 'weatherAlerts' && 'Get weather alerts for outdoor games'}
                    {key === 'socialUpdates' && 'Get updates from your friends and connections'}
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, [key]: e.target.checked }
                    }))}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: value ? theme.colors.primary : theme.colors.muted,
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: value ? '26px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card style={{
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.lg
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 16px 0',
            color: theme.colors.text
          }}>
            🔒 Privacy
          </h2>
          <div style={{ display: 'grid', gap: theme.spacing.md }}>
            {Object.entries(settings.privacy).map(([key, value]) => (
              <div key={key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing.md,
                background: theme.colors.background,
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.colors.border}`
              }}>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: '0 0 4px 0',
                    color: theme.colors.text
                  }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: theme.colors.muted,
                    margin: 0
                  }}>
                    {key === 'showLocation' && 'Allow other users to see your location'}
                    {key === 'showPhone' && 'Show your phone number to other users'}
                    {key === 'showSocialMedia' && 'Display your social media links'}
                    {key === 'allowDirectMessages' && 'Allow other users to send you direct messages'}
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '50px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, [key]: e.target.checked }
                    }))}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: value ? theme.colors.primary : theme.colors.muted,
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: value ? '26px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Preferences */}
        <Card style={{
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.lg
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 16px 0',
            color: theme.colors.text
          }}>
            ⚙️ Preferences
          </h2>
          <div style={{ display: 'grid', gap: theme.spacing.md }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: theme.spacing.xs,
                color: theme.colors.text
              }}>
                Language
              </label>
              <select
                value={settings.preferences.language}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, language: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.md,
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="en">English</option>
                <option value="ne">नेपाली (Nepali)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: theme.spacing.xs,
                color: theme.colors.text
              }}>
                Timezone
              </label>
              <select
                value={settings.preferences.timezone}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, timezone: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.md,
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="Asia/Kathmandu">Asia/Kathmandu (NPT)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: theme.spacing.xs,
                color: theme.colors.text
              }}>
                Units
              </label>
              <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                <Button
                  variant={settings.preferences.units === 'metric' ? 'primary' : 'outline'}
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, units: 'metric' }
                  }))}
                >
                  Metric (km, °C)
                </Button>
                <Button
                  variant={settings.preferences.units === 'imperial' ? 'primary' : 'outline'}
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, units: 'imperial' }
                  }))}
                >
                  Imperial (miles, °F)
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div style={{ textAlign: 'center' }}>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            style={{ minWidth: '200px' }}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

