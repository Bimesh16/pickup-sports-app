import React, { useState, useEffect } from 'react';
import { Button, Card, Badge } from '@components/ui';
import { toast } from 'react-toastify';
import { 
  Settings,
  Bell,
  Globe,
  Moon,
  Sun,
  Shield,
  Download,
  Trash2,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { useThemeMode } from '@context/ThemeContext';
import { apiClient } from '@lib/apiClient';

// Types
interface NotificationPreferences {
  invites: boolean;
  reminders: boolean;
  gameUpdates: boolean;
  teamUpdates: boolean;
  achievements: boolean;
}

interface AppSettings {
  language: 'en' | 'ne';
  theme: 'light' | 'dark' | 'system';
  pushNotifications: boolean;
  locationServices: boolean;
  analytics: boolean;
}

// Quick Actions Component
const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Advanced Settings',
      description: 'Configure detailed app preferences',
      icon: Settings,
      onClick: () => console.log('Open advanced settings'),
      color: 'text-blue-600'
    },
    {
      title: 'Notification Preferences',
      description: 'Manage your notification settings',
      icon: Bell,
      onClick: () => console.log('Open notification preferences'),
      color: 'text-green-600'
    },
    {
      title: 'How You Play',
      description: 'Update your sports profile',
      icon: ExternalLink,
      onClick: () => console.log('Open sports profile'),
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {actions.map((action, index) => {
        const IconComponent = action.icon;
        return (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={action.onClick}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-gray-100 ${action.color}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--text)] mb-1">{action.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{action.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// Notification Preferences Component
const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    invites: true,
    reminders: true,
    gameUpdates: true,
    teamUpdates: true,
    achievements: true
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    
    setLoading(true);
    try {
      await apiClient.put('/api/v1/notifications/preferences', newPreferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      // Revert on error
      setPreferences(preferences);
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    { key: 'invites', label: 'Game Invites', description: 'When someone invites you to a game' },
    { key: 'reminders', label: 'Reminders', description: 'Game reminders and updates' },
    { key: 'gameUpdates', label: 'Game Updates', description: 'Changes to games you\'re playing' },
    { key: 'teamUpdates', label: 'Team Updates', description: 'Updates from your teams' },
    { key: 'achievements', label: 'Achievements', description: 'When you earn badges or level up' }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)]">Notification Preferences</h3>
          <p className="text-sm text-[var(--text-muted)]">Choose what notifications you want to receive</p>
        </div>
        {saved && (
          <Badge variant="success" size="sm" className="bg-green-100 text-green-700 border-0">
            <Check className="w-3 h-3 mr-1" />
            Saved
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {notificationTypes.map((type) => (
          <div key={type.key} className="flex items-center justify-between p-4 bg-[var(--bg-muted)] rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-[var(--text)]">{type.label}</h4>
              <p className="text-sm text-[var(--text-muted)]">{type.description}</p>
            </div>
            <button
              onClick={() => handleToggle(type.key as keyof NotificationPreferences)}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences[type.key as keyof NotificationPreferences]
                  ? 'bg-[var(--brand-primary)]'
                  : 'bg-gray-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences[type.key as keyof NotificationPreferences] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};

// App Settings Component
const AppSettings: React.FC = () => {
  const { mode, setMode } = useThemeMode();
  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    theme: mode,
    pushNotifications: true,
    locationServices: true,
    analytics: true
  });
  const [loading, setLoading] = useState(false);

  const handleSettingChange = async (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    if (key === 'theme') {
      setMode(value);
    }
    
    setLoading(true);
    try {
      // Save to backend
      await apiClient.put('/api/v1/settings', newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-[var(--text)] mb-6">App Settings</h3>
      
      <div className="space-y-6">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">Language</label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-surface)]"
          >
            <option value="en">English</option>
            <option value="ne">नेपाली (Nepali)</option>
          </select>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Settings }
            ].map((theme) => {
              const IconComponent = theme.icon;
              return (
                <button
                  key={theme.value}
                  onClick={() => handleSettingChange('theme', theme.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    settings.theme === theme.value
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10'
                      : 'border-[var(--border)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between p-4 bg-[var(--bg-muted)] rounded-lg">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-[var(--text-muted)]" />
            <div>
              <h4 className="font-medium text-[var(--text)]">Push Notifications</h4>
              <p className="text-sm text-[var(--text-muted)]">Receive notifications on your device</p>
            </div>
          </div>
          <button
            onClick={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.pushNotifications ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Location Services */}
        <div className="flex items-center justify-between p-4 bg-[var(--bg-muted)] rounded-lg">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[var(--text-muted)]" />
            <div>
              <h4 className="font-medium text-[var(--text)]">Location Services</h4>
              <p className="text-sm text-[var(--text-muted)]">Allow location access for nearby games</p>
            </div>
          </div>
          <button
            onClick={() => handleSettingChange('locationServices', !settings.locationServices)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.locationServices ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.locationServices ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </Card>
  );
};

// Privacy & Data Component
const PrivacyData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDownloadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/v1/data/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'my-data.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await apiClient.delete('/api/v1/account');
      // Redirect to login or show success message
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-[var(--text)] mb-6">Privacy & Data</h3>
      
      <div className="space-y-4">
        {/* Download Data */}
        <div className="flex items-center justify-between p-4 bg-[var(--bg-muted)] rounded-lg">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-[var(--text-muted)]" />
            <div>
              <h4 className="font-medium text-[var(--text)]">Download My Data</h4>
              <p className="text-sm text-[var(--text-muted)]">Get a copy of all your data</p>
            </div>
          </div>
          <Button
            onClick={handleDownloadData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? 'Downloading...' : 'Download'}
          </Button>
        </div>

        {/* Delete Account */}
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-700">Permanently delete your account and all data</p>
            </div>
          </div>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// Invite Friends Component
const InviteFriends: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/invite?ref=user123`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Pickup Sports!',
          text: 'Check out this awesome sports app!',
          url: inviteLink
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-[var(--text)] mb-6">Invite Friends</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-[var(--bg-muted)] rounded-lg">
          <p className="text-sm text-[var(--text-muted)] mb-2">Your invite link:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-white rounded border text-sm font-mono">
              {inviteLink}
            </code>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              className={copied ? 'bg-green-100 text-green-700' : ''}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleShare} variant="outline" className="justify-start">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleCopyLink} variant="outline" className="justify-start">
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        </div>

        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            🎉 You'll both get <strong>50 XP</strong> when your friend joins!
          </p>
        </div>
      </div>
    </Card>
  );
};

// Main Settings Page Component
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <QuickActions />

      {/* Notification Preferences */}
      <NotificationPreferences />

      {/* App Settings */}
      <AppSettings />

      {/* Privacy & Data */}
      <PrivacyData />

      {/* Invite Friends */}
      <InviteFriends />
    </div>
  );
}