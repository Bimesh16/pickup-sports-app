import React, { useState, useEffect } from 'react';
import { Card, Button, Switch, Modal } from '@components/ui';
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
  Link, 
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  RefreshCw,
  Gamepad2,
  Users,
  MessageCircle,
  Calendar,
  MapPin,
  Star,
  Heart,
  Zap,
  Lock,
  Unlock
} from 'lucide-react';
import { apiClient } from '@lib/apiClient';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface NotificationPreferences {
  gameInvites: boolean;
  gameReminders: boolean;
  newGameUpdates: boolean;
  teamUpdates: boolean;
  friendRequests: boolean;
  systemAnnouncements: boolean;
  marketingEmails: boolean;
}

interface AppSettings {
  language: 'en' | 'ne';
  theme: 'light' | 'dark' | 'system';
  pushNotifications: boolean;
  locationServices: boolean;
  analytics: boolean;
  crashReporting: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  dataExportEnabled: boolean;
  accountDeletionRequested: boolean;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    gameInvites: true,
    gameReminders: true,
    newGameUpdates: true,
    teamUpdates: true,
    friendRequests: true,
    systemAnnouncements: true,
    marketingEmails: false
  });
  
  const [appSettings, setAppSettings] = useState<AppSettings>({
    language: 'en',
    theme: 'system',
    pushNotifications: true,
    locationServices: true,
    analytics: true,
    crashReporting: true
  });
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowFriendRequests: true,
    dataExportEnabled: true,
    accountDeletionRequested: false
  });
  
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        try {
          // Try real API first
          const [notifResponse, appResponse, privacyResponse] = await Promise.all([
            apiClient.get('/api/v1/notifications/preferences'),
            apiClient.get('/api/v1/settings/app'),
            apiClient.get('/api/v1/settings/privacy')
          ]);
          
          setNotificationPrefs(notifResponse.data);
          setAppSettings(appResponse.data);
          setPrivacySettings(privacyResponse.data);
        } catch (apiError) {
          console.warn('API call failed, using default settings:', apiError);
          // Use default settings from state
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update notification preferences
  const updateNotificationPref = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      await apiClient.put('/api/v1/notifications/preferences', {
        [key]: value
      });
      
      setNotificationPrefs(prev => ({ ...prev, [key]: value }));
      toast.success('Notification preference updated');
    } catch (error) {
      console.error('Error updating notification preference:', error);
      toast.error('Failed to update notification preference');
    }
  };

  // Update app settings
  const updateAppSetting = async (key: keyof AppSettings, value: any) => {
    try {
      await apiClient.put('/api/v1/settings/app', {
        [key]: value
      });
      
      setAppSettings(prev => ({ ...prev, [key]: value }));
      toast.success('App setting updated');
    } catch (error) {
      console.error('Error updating app setting:', error);
      toast.error('Failed to update app setting');
    }
  };

  // Update privacy settings
  const updatePrivacySetting = async (key: keyof PrivacySettings, value: any) => {
    try {
      await apiClient.put('/api/v1/settings/privacy', {
        [key]: value
      });
      
      setPrivacySettings(prev => ({ ...prev, [key]: value }));
      toast.success('Privacy setting updated');
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      toast.error('Failed to update privacy setting');
    }
  };

  // Handle data export
  const handleDataExport = async () => {
    try {
      const response = await apiClient.get('/api/v1/data/export', {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pickup-sports-data-${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Data export started. Check your downloads.');
      setShowDataExportModal(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  // Handle account deletion
  const handleAccountDeletion = async () => {
    try {
      await apiClient.post('/api/v1/account/delete-request');
      setPrivacySettings(prev => ({ ...prev, accountDeletionRequested: true }));
      toast.success('Account deletion requested. You will receive an email confirmation.');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      toast.error('Failed to request account deletion');
    }
  };

  // Handle invite friends
  const handleInviteFriends = () => {
    const inviteLink = `${window.location.origin}/invite?ref=${Date.now()}`;
    
    navigator.share?.({
      title: 'Join me on Pickup Sports!',
      text: 'Check out this awesome pickup sports app!',
      url: inviteLink
    }).catch(() => {
      navigator.clipboard.writeText(inviteLink);
      toast.success('Invite link copied to clipboard!');
    });
  };

  // Quick Actions
  const quickActions = [
    {
      title: 'Notification Preferences',
      description: 'Manage your notification settings',
      icon: Bell,
      onClick: () => document.getElementById('notifications-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      title: 'How You Play',
      description: 'Configure your sports profile',
      icon: Gamepad2,
      onClick: () => navigate('/profile?tab=sports')
    },
    {
      title: 'Team Management',
      description: 'Manage your teams and invites',
      icon: Users,
      onClick: () => navigate('/profile?tab=teams')
    },
    {
      title: 'Advanced Settings',
      description: 'Access all app settings',
      icon: Settings,
      onClick: () => document.getElementById('app-settings-section')?.scrollIntoView({ behavior: 'smooth' })
    }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-2">
              <div className="h-6 bg-[var(--bg-muted)] rounded w-1/3"></div>
              <div className="h-4 bg-[var(--bg-muted)] rounded w-1/2"></div>
              <div className="h-4 bg-[var(--bg-muted)] rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-8 h-8 text-[var(--brand-primary)]" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
            <p className="text-[var(--text-muted)]">Manage your app preferences and account settings</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="flex items-center gap-4 p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--bg-muted)] transition-colors text-left"
            >
              <div className="w-10 h-10 bg-[var(--brand-primary)]/10 rounded-lg flex items-center justify-center">
                <action.icon className="w-5 h-5 text-[var(--brand-primary)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[var(--text-primary)]">{action.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{action.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          ))}
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card id="notifications-section" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-[var(--brand-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notification Preferences</h2>
        </div>
        
        <div className="space-y-4">
          {[
            { key: 'gameInvites', label: 'Game Invites', description: 'Get notified when invited to games' },
            { key: 'gameReminders', label: 'Game Reminders', description: 'Reminders for upcoming games' },
            { key: 'newGameUpdates', label: 'New Game Updates', description: 'Updates about games you\'re following' },
            { key: 'teamUpdates', label: 'Team Updates', description: 'Updates about your teams' },
            { key: 'friendRequests', label: 'Friend Requests', description: 'New friend requests and connections' },
            { key: 'systemAnnouncements', label: 'System Announcements', description: 'Important app updates and news' },
            { key: 'marketingEmails', label: 'Marketing Emails', description: 'Promotional content and offers' }
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-[var(--text-primary)]">{pref.label}</div>
                <div className="text-sm text-[var(--text-muted)]">{pref.description}</div>
              </div>
              <Switch
                checked={notificationPrefs[pref.key as keyof NotificationPreferences]}
                onCheckedChange={(checked) => updateNotificationPref(pref.key as keyof NotificationPreferences, checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* App Settings */}
      <Card id="app-settings-section" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-[var(--brand-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">App Settings</h2>
        </div>
        
        <div className="space-y-6">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Language</label>
            <div className="flex gap-2">
              {[
                { value: 'en', label: 'English', flag: '🇺🇸' },
                { value: 'ne', label: 'नेपाली', flag: '🇳🇵' }
              ].map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => updateAppSetting('language', lang.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    appSettings.language === lang.value
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                      : 'border-[var(--border)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Theme</label>
            <div className="flex gap-2">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor }
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateAppSetting('theme', theme.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    appSettings.theme === theme.value
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                      : 'border-[var(--border)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  <theme.icon className="w-4 h-4" />
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Other Settings */}
          <div className="space-y-4">
            {[
              { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive notifications even when app is closed' },
              { key: 'locationServices', label: 'Location Services', description: 'Allow app to access your location for nearby games' },
              { key: 'analytics', label: 'Analytics', description: 'Help improve the app by sharing usage data' },
              { key: 'crashReporting', label: 'Crash Reporting', description: 'Automatically report crashes to help fix issues' }
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{setting.label}</div>
                  <div className="text-sm text-[var(--text-muted)]">{setting.description}</div>
                </div>
                <Switch
                  checked={appSettings[setting.key as keyof AppSettings] as boolean}
                  onCheckedChange={(checked) => updateAppSetting(setting.key as keyof AppSettings, checked)}
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Privacy & Data */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-[var(--brand-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Privacy & Data</h2>
        </div>
        
        <div className="space-y-6">
          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-[var(--text-primary)]">Privacy Settings</h3>
            {[
              { key: 'showOnlineStatus', label: 'Show Online Status', description: 'Let others see when you\'re online' },
              { key: 'allowFriendRequests', label: 'Allow Friend Requests', description: 'Let other users send you friend requests' },
              { key: 'dataExportEnabled', label: 'Data Export', description: 'Allow downloading your account data' }
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{setting.label}</div>
                  <div className="text-sm text-[var(--text-muted)]">{setting.description}</div>
                </div>
                <Switch
                  checked={privacySettings[setting.key as keyof PrivacySettings] as boolean}
                  onCheckedChange={(checked) => updatePrivacySetting(setting.key as keyof PrivacySettings, checked)}
                />
              </div>
            ))}
          </div>

          {/* Data Actions */}
          <div className="space-y-4">
            <h3 className="font-medium text-[var(--text-primary)]">Data Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowDataExportModal(true)}
                className="flex items-center gap-3 p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--bg-muted)] transition-colors w-full text-left"
              >
                <Download className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium text-[var(--text-primary)]">Download My Data</div>
                  <div className="text-sm text-[var(--text-muted)]">Get a copy of all your data</div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] ml-auto" />
              </button>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-3 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
                <div>
                  <div className="font-medium text-red-600">Delete Account</div>
                  <div className="text-sm text-red-500">Permanently delete your account and data</div>
                </div>
                <ChevronRight className="w-4 h-4 text-red-500 ml-auto" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Invite Friends */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-[var(--brand-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Invite Friends</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-[var(--text-muted)]">
            Share Pickup Sports with your friends and earn rewards for each friend who joins!
          </p>
          
          <div className="flex gap-3">
            <Button
              onClick={handleInviteFriends}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Invite Link
            </Button>
            
            <Button
              onClick={() => {
                const inviteLink = `${window.location.origin}/invite?ref=${Date.now()}`;
                navigator.clipboard.writeText(inviteLink);
                toast.success('Invite link copied to clipboard!');
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Export Modal */}
      <Modal isOpen={showDataExportModal} onClose={() => setShowDataExportModal(false)} size="md">
        <div className="space-y-6">
          <div className="text-center">
            <Download className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Download Your Data</h2>
            <p className="text-[var(--text-muted)]">
              We'll prepare a ZIP file containing all your account data, including profile information, game history, and preferences.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">What's included:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Profile information and settings</li>
              <li>• Game history and statistics</li>
              <li>• Team memberships and messages</li>
              <li>• Notification preferences</li>
              <li>• All other account data</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDataExport}
              className="flex-1"
            >
              Download Data
            </Button>
            <Button
              onClick={() => setShowDataExportModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Account Deletion Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="md">
        <div className="space-y-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Delete Account</h2>
            <p className="text-[var(--text-muted)]">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">What will be deleted:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Your profile and personal information</li>
              <li>• All game history and statistics</li>
              <li>• Team memberships and messages</li>
              <li>• All other account data</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAccountDeletion}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Yes, Delete My Account
            </Button>
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}