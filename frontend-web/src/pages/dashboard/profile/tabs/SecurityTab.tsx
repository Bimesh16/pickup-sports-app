import React, { useState } from 'react';
import { Button, Card, Badge, Modal } from '@components/ui';
import { 
  Shield,
  Key,
  Smartphone,
  Monitor,
  MapPin,
  Clock,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { UserProfile } from '../types';

const SecurityTab: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const handleEnable2FA = () => {
    // Enable 2FA logic
    console.log('Enabling 2FA');
    setShow2FAModal(false);
  };

  const handleDisable2FA = () => {
    // Disable 2FA logic
    console.log('Disabling 2FA');
  };

  const handleRevokeSession = (sessionId: string) => {
    // Revoke session logic
    console.log('Revoking session:', sessionId);
  };

  const handleChangePassword = () => {
    // Change password logic
    console.log('Changing password');
    setShowPasswordModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-[var(--brand-primary)]" />
          <h3 className="font-semibold text-[var(--text)]">Security Overview</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-[var(--bg-muted)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--text)]">
              {profile.security.twoFactorEnabled ? '✓' : '✗'}
            </div>
            <div className="text-sm text-[var(--text-muted)]">2FA Status</div>
          </div>
          
          <div className="text-center p-3 bg-[var(--bg-muted)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--text)]">
              {profile.security.activeSessions.length}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Active Sessions</div>
          </div>
          
          <div className="text-center p-3 bg-[var(--bg-muted)] rounded-lg">
            <div className="text-2xl font-bold text-[var(--text)]">Strong</div>
            <div className="text-sm text-[var(--text-muted)]">Password Strength</div>
          </div>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--text)]">Two-Factor Authentication</h3>
            <p className="text-sm text-[var(--text-muted)]">
              {profile.security.twoFactorEnabled 
                ? 'Add an extra layer of security to your account' 
                : 'Your account is protected with 2FA'
              }
            </p>
          </div>
          <Button 
            variant={profile.security.twoFactorEnabled ? 'outline' : 'default'}
            onClick={() => setShow2FAModal(true)}
          >
            {profile.security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </Button>
        </div>
      </Card>

      {/* Active Sessions */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--text)]">Active Sessions</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSessionModal(true)}
          >
            Manage Sessions
          </Button>
        </div>
        
        <div className="space-y-3">
          {profile.security.activeSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-[var(--bg-muted)] rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-[var(--text-muted)]" />
                <div>
                  <div className="font-medium text-[var(--text)]">{session.device}</div>
                  <div className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {session.location}
                    <Clock className="w-3 h-3 ml-2" />
                    {session.lastActive}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session.current && (
                  <Badge variant="default" size="sm" className="bg-green-100 text-green-700 border-0">
                    Current
                  </Badge>
                )}
                {!session.current && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Password Change */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--text)]">Password</h3>
            <p className="text-sm text-[var(--text-muted)]">Last changed 30 days ago</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </Button>
        </div>
      </Card>

      {/* Security Tips */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Security Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use a strong, unique password</li>
              <li>• Enable two-factor authentication</li>
              <li>• Log out from devices you don't recognize</li>
              <li>• Don't share your login credentials</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* 2FA Modal */}
      <Modal isOpen={show2FAModal} onClose={() => setShow2FAModal(false)} size="md">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {profile.security.twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
          </h3>
          
          {!profile.security.twoFactorEnabled ? (
            <div className="space-y-4">
              <div className="text-center p-4 bg-[var(--bg-muted)] rounded-lg">
                <Smartphone className="w-12 h-12 mx-auto mb-3 text-[var(--brand-primary)]" />
                <p className="text-sm text-[var(--text-muted)]">
                  Scan this QR code with your authenticator app
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Enter verification code</label>
                  <input
                    type="text"
                    placeholder="000000"
                    className="w-full p-2 border border-[var(--border)] rounded-lg text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>
                
                <Button onClick={handleEnable2FA} className="w-full">
                  Enable 2FA
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-500" />
                <p className="text-sm text-red-700">
                  Are you sure you want to disable two-factor authentication? This will make your account less secure.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShow2FAModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDisable2FA}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Disable 2FA
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Password Change Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} size="md">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                className="w-full p-2 border border-[var(--border)] rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                className="w-full p-2 border border-[var(--border)] rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full p-2 border border-[var(--border)] rounded-lg"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleChangePassword}
                className="flex-1"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SecurityTab;
