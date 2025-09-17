import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Switch } from '@components/ui';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Monitor, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Trash2,
  Smartphone as PhoneIcon,
  Laptop,
  Tablet,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';
import { apiClient } from '@lib/apiClient';
import { toast } from 'react-toastify';

interface SecurityTabProps {
  profile: {
    id: string;
    email: string;
    username: string;
  };
}

interface Session {
  id: string;
  device: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
  userAgent: string;
}

interface SecuritySettings {
  has2FA: boolean;
  hasEmailVerification: boolean;
  hasPhoneVerification: boolean;
  lastPasswordChange: string;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  dataExportEnabled: boolean;
  accountDeletionRequested: boolean;
}

const DEVICE_ICONS = {
  mobile: PhoneIcon,
  desktop: Monitor,
  tablet: Tablet,
  unknown: Globe
};

const DEVICE_COLORS = {
  mobile: 'text-blue-500',
  desktop: 'text-green-500',
  tablet: 'text-purple-500',
  unknown: 'text-gray-500'
};

export default function SecurityTab({ profile }: SecurityTabProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    has2FA: false,
    hasEmailVerification: true,
    hasPhoneVerification: false,
    lastPasswordChange: '2024-01-01',
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    dataExportEnabled: true,
    accountDeletionRequested: false
  });
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load security data
  useEffect(() => {
    const loadSecurityData = async () => {
      try {
        setLoading(true);
        
        try {
          // Try real API first
          const [sessionsResponse, settingsResponse] = await Promise.all([
            apiClient.get('/api/v1/security/sessions'),
            apiClient.get('/api/v1/security/settings')
          ]);
          
          setSessions(sessionsResponse.data);
          setSecuritySettings(settingsResponse.data);
        } catch (apiError) {
          console.warn('API call failed, using mock data:', apiError);
          
          // Fallback to mock data
          const mockSessions: Session[] = [
            {
              id: '1',
              device: 'iPhone 14 Pro',
              deviceType: 'mobile',
              browser: 'Safari 17.0',
              location: 'Kathmandu, Nepal',
              ipAddress: '192.168.1.100',
              lastActive: '2024-01-20T10:30:00Z',
              isCurrent: true,
              userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
            },
            {
              id: '2',
              device: 'MacBook Pro',
              deviceType: 'desktop',
              browser: 'Chrome 120.0',
              location: 'Kathmandu, Nepal',
              ipAddress: '192.168.1.101',
              lastActive: '2024-01-19T15:45:00Z',
              isCurrent: false,
              userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
            },
            {
              id: '3',
              device: 'Samsung Galaxy S23',
              deviceType: 'mobile',
              browser: 'Chrome Mobile 120.0',
              location: 'Pokhara, Nepal',
              ipAddress: '203.0.113.42',
              lastActive: '2024-01-18T08:20:00Z',
              isCurrent: false,
              userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B)'
            }
          ];
          
          setSessions(mockSessions);
        }
      } catch (error) {
        console.error('Error loading security data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSecurityData();
  }, []);

  // Change password
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      await apiClient.put('/api/v1/security/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  // Enable/disable 2FA
  const handleToggle2FA = async () => {
    try {
      if (securitySettings.has2FA) {
        // Disable 2FA
        await apiClient.delete('/api/v1/security/2fa');
        setSecuritySettings(prev => ({ ...prev, has2FA: false }));
        toast.success('2FA disabled successfully');
      } else {
        // Enable 2FA
        const response = await apiClient.post('/api/v1/security/2fa/setup');
        setShow2FAModal(true);
        toast.success('2FA setup initiated');
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      toast.error('Failed to toggle 2FA');
    }
  };

  // Revoke session
  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiClient.delete(`/api/v1/security/sessions/${sessionId}`);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Session revoked successfully');
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error('Failed to revoke session');
    }
  };

  // Update security settings
  const handleSettingChange = async (setting: keyof SecuritySettings, value: boolean) => {
    try {
      await apiClient.put('/api/v1/security/settings', {
        [setting]: value
      });
      
      setSecuritySettings(prev => ({ ...prev, [setting]: value }));
      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    }
  };

  // Request account deletion
  const handleRequestAccountDeletion = async () => {
    try {
      await apiClient.post('/api/v1/security/account/deletion-request');
      setSecuritySettings(prev => ({ ...prev, accountDeletionRequested: true }));
      toast.success('Account deletion requested. You will receive an email confirmation.');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      toast.error('Failed to request account deletion');
    }
  };

  // Format last active time
  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get device icon
  const getDeviceIcon = (deviceType: string) => {
    const IconComponent = DEVICE_ICONS[deviceType as keyof typeof DEVICE_ICONS] || Globe;
    return <IconComponent className="w-5 h-5" />;
  };

  // Get device color
  const getDeviceColor = (deviceType: string) => {
    return DEVICE_COLORS[deviceType as keyof typeof DEVICE_COLORS] || 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
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
      {/* Security Overview */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-[var(--brand-primary)]" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">Security Overview</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-[var(--bg-muted)] rounded-lg">
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
              securitySettings.has2FA ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {securitySettings.has2FA ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <X className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="text-sm font-medium text-[var(--text-primary)]">2FA</div>
            <div className={`text-xs ${securitySettings.has2FA ? 'text-green-600' : 'text-red-600'}`}>
              {securitySettings.has2FA ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-[var(--bg-muted)] rounded-lg">
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
              securitySettings.hasEmailVerification ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {securitySettings.hasEmailVerification ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              )}
            </div>
            <div className="text-sm font-medium text-[var(--text-primary)]">Email</div>
            <div className={`text-xs ${securitySettings.hasEmailVerification ? 'text-green-600' : 'text-yellow-600'}`}>
              {securitySettings.hasEmailVerification ? 'Verified' : 'Pending'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-[var(--bg-muted)] rounded-lg">
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
              securitySettings.hasPhoneVerification ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {securitySettings.hasPhoneVerification ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <PhoneIcon className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div className="text-sm font-medium text-[var(--text-primary)]">Phone</div>
            <div className={`text-xs ${securitySettings.hasPhoneVerification ? 'text-green-600' : 'text-gray-600'}`}>
              {securitySettings.hasPhoneVerification ? 'Verified' : 'Not Set'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-[var(--bg-muted)] rounded-lg">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-[var(--text-primary)]">Last Password</div>
            <div className="text-xs text-[var(--text-muted)]">
              {new Date(securitySettings.lastPasswordChange).toLocaleDateString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Password Security */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">Password Security</h4>
            <p className="text-sm text-[var(--text-muted)]">Change your password to keep your account secure</p>
          </div>
          <Button
            onClick={() => setShowPasswordModal(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            Change Password
          </Button>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">Two-Factor Authentication</h4>
            <p className="text-sm text-[var(--text-muted)]">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={securitySettings.has2FA}
              onCheckedChange={handleToggle2FA}
            />
            <span className="text-sm text-[var(--text-muted)]">
              {securitySettings.has2FA ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
        
        {securitySettings.has2FA && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">2FA is enabled</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Your account is protected with two-factor authentication
            </p>
          </div>
        )}
      </Card>

      {/* Active Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">Active Sessions</h4>
            <p className="text-sm text-[var(--text-muted)]">Manage your active login sessions</p>
          </div>
          <Badge variant="outline">{sessions.length} sessions</Badge>
        </div>
        
        <div className="space-y-4">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.deviceType);
            const deviceColor = getDeviceColor(session.deviceType);
            
            return (
              <div key={session.id} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-[var(--bg-muted)] ${deviceColor}`}>
                    <DeviceIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-[var(--text-primary)]">{session.device}</h5>
                      {session.isCurrent && (
                        <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-[var(--text-muted)]">
                      {session.browser} • {session.location}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Last active: {formatLastActive(session.lastActive)}
                    </div>
                  </div>
                </div>
                
                {!session.isCurrent && (
                  <Button
                    onClick={() => handleRevokeSession(session.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Security Settings</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-[var(--text-primary)]">Login Notifications</div>
              <div className="text-sm text-[var(--text-muted)]">Get notified when someone logs into your account</div>
            </div>
            <Switch
              checked={securitySettings.loginNotifications}
              onCheckedChange={(checked) => handleSettingChange('loginNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-[var(--text-primary)]">Suspicious Activity Alerts</div>
              <div className="text-sm text-[var(--text-muted)]">Get alerts for unusual account activity</div>
            </div>
            <Switch
              checked={securitySettings.suspiciousActivityAlerts}
              onCheckedChange={(checked) => handleSettingChange('suspiciousActivityAlerts', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-[var(--text-primary)]">Data Export</div>
              <div className="text-sm text-[var(--text-muted)]">Allow downloading your account data</div>
            </div>
            <Switch
              checked={securitySettings.dataExportEnabled}
              onCheckedChange={(checked) => handleSettingChange('dataExportEnabled', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Account Deletion */}
      <Card className="p-6 border-red-200">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h4 className="text-lg font-semibold text-[var(--text-primary)]">Danger Zone</h4>
        </div>
        
        <div className="space-y-4">
          <div>
            <h5 className="font-medium text-[var(--text-primary)] mb-2">Delete Account</h5>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Request Account Deletion
            </Button>
          </div>
        </div>
      </Card>

      {/* Password Change Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} size="md">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Change Password</h2>
            <p className="text-[var(--text-muted)]">Enter your current password and choose a new one</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleChangePassword}
              disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="flex-1"
            >
              Change Password
            </Button>
            <Button
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
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
              <li>• Team memberships and invitations</li>
              <li>• Messages and notifications</li>
              <li>• All other account data</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRequestAccountDeletion}
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
