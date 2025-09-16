// src/pages/Profile.tsx - User Profile Management

import React, { useState, useRef } from 'react';
import { useAuth } from '@hooks/useAuth';
import { Button, Input, Card, Avatar, Badge } from '@components/ui';
import { theme } from '@styles/theme';
import { POPULAR_SPORTS_NEPAL } from '@constants/nepal';
import { validateForm } from '@lib/validation';

export function Profile() {
  const { user, logout, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    phoneNumber: user?.phoneNumber || '',
    location: user?.location || '',
    preferredSport: (user as any)?.preferredSport || '',
    socialMedia: {
      instagram: user?.socialMedia?.instagram || '',
      tiktok: user?.socialMedia?.tiktok || '',
      facebook: user?.socialMedia?.facebook || '',
      twitter: user?.socialMedia?.twitter || ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [errToast, setErrToast] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [preconditionBanner, setPreconditionBanner] = useState<boolean>(false);

  const handleSave = async () => {
    setErrors({});
    
    // Validate form
    const validation = validateForm({ ...formData, username: user?.username || '', email: user?.email || '', password: 'dummy' });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    try {
      // Use raw fetch to include ETag preconditions
      const token = localStorage.getItem('ps_token');
      const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
      const res = await fetch(`${base}/profiles/me`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
      const etag = res.headers.get('etag') || undefined;

      if (formData.preferredSport && formData.preferredSport !== (user as any)?.preferredSport) {
        const psRes = await fetch(`${base}/profiles/me/preferred-sport`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
          body: JSON.stringify({ name: formData.preferredSport })
        });
        if (!psRes.ok) {
          const msg = (await psRes.text()) || 'Failed to update preferred sport';
          throw new Error(msg);
        }
        try { await refreshProfile(); } catch {}
      }

      const upRes = await fetch(`${base}/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(etag ? { 'If-Match': etag } : {}),
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          bio: formData.bio || undefined,
          contactPreference: undefined,
          skillLevel: undefined,
          age: undefined,
          position: undefined
        })
      });
      if (!upRes.ok) {
        if (upRes.status === 412) {
          setPreconditionBanner(true);
        }
        let msg = 'Failed to update profile';
        try {
          const ct = upRes.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const data = await upRes.json();
            msg = data?.message || msg;
            // Inline mapping for common validation messages
            if (/Bio/i.test(msg)) setErrors(prev => ({ ...prev, bio: msg }));
            if (/Age/i.test(msg)) setErrors(prev => ({ ...prev, age: msg } as any));
            if (/Position/i.test(msg)) setErrors(prev => ({ ...prev, position: msg } as any));
            if (/Contact preference/i.test(msg)) setErrors(prev => ({ ...prev, contactPreference: msg } as any));
            if (/Skill level/i.test(msg)) setErrors(prev => ({ ...prev, skillLevel: msg } as any));
          } else {
            msg = await upRes.text();
          }
        } catch {}
        throw new Error(msg);
      }
      setIsEditing(false);
      setToast('Profile updated');
      setTimeout(() => setToast(null), 2500);
      try { await refreshProfile(); } catch {}
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrToast(error instanceof Error ? error.message : 'Failed to update profile');
      setTimeout(() => setErrToast(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      phoneNumber: user?.phoneNumber || '',
      location: user?.location || '',
      socialMedia: {
        instagram: user?.socialMedia?.instagram || '',
        tiktok: user?.socialMedia?.tiktok || '',
        facebook: user?.socialMedia?.facebook || '',
        twitter: user?.socialMedia?.twitter || ''
      }
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.gradients.mountain,
      padding: theme.spacing.lg
    }}>
      {preconditionBanner && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(251,191,36,0.2)', color: '#fde68a', border: '1px solid rgba(251,191,36,0.35)', padding: '8px 14px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🔄</span>
            <span>Profile changed elsewhere. Refresh before saving.</span>
            <button onClick={() => window.location.reload()} style={{ marginLeft: 8, padding: '4px 8px', borderRadius: 9999, background: 'white', color: '#92400e', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Reload</button>
          </div>
        </div>
      )}
      {toast && (
        <div style={{ position: 'fixed', top: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', color: '#A7F3D0', border: '1px solid rgba(16,185,129,0.3)', padding: '8px 14px', borderRadius: 9999 }}>
            {toast}
          </div>
        </div>
      )}
      {errToast && (
        <div style={{ position: 'fixed', top: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 14px', borderRadius: 9999 }}>
            {errToast}
          </div>
        </div>
      )}
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
            Profile Settings
          </h1>
          <p style={{
            fontSize: '16px',
            opacity: 0.9,
            margin: 0
          }}>
            Manage your account information
          </p>
        </div>

        {/* Profile Card */}
        <Card style={{
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.lg
        }}>
          {/* Profile Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: theme.spacing.xl,
            paddingBottom: theme.spacing.lg,
            borderBottom: `1px solid ${theme.colors.border}`
          }}>
            <div style={{ position: 'relative', marginRight: theme.spacing.md }}>
              <Avatar
                src={user?.avatarUrl}
                size="lg"
              />
              {uploadProgress > 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '50%' }}>
                  <div style={{ background: 'white', color: '#0f172a', fontSize: 12, padding: '2px 6px', borderRadius: 9999 }}>{uploadProgress}%</div>
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                margin: '0 0 4px 0',
                color: theme.colors.text
              }}>
                {user?.firstName} {user?.lastName}
              </h2>
              <p style={{
                fontSize: '16px',
                color: theme.colors.muted,
                margin: '0 0 8px 0'
              }}>
                @{user?.username}
              </p>
              <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                <Badge variant="success">
                  {user?.skillLevel || 'BEGINNER'}
                </Badge>
                {user?.isVerified && (
                  <Badge variant="primary">
                    ✓ Verified
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
            {isEditing && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const token = localStorage.getItem('ps_token');
                  const base = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080';
                  const res = await fetch(`${base}/profiles/me`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } });
                  const etag = res.headers.get('etag') || undefined;
                  const fd = new FormData();
                  fd.append('file', file);
                  setUploadProgress(10);
                  try {
                    const sendOnce = () => new Promise<void>((resolve, reject) => {
                      const xhr = new XMLHttpRequest();
                      xhr.open('POST', `${base}/profiles/me/avatar`);
                      if (etag) xhr.setRequestHeader('If-Match', etag);
                      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                      xhr.upload.onprogress = (evt) => {
                        if (evt.lengthComputable) {
                          const pct = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
                          setUploadProgress(pct);
                        }
                      };
                      xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) resolve();
                        else reject(new Error(xhr.responseText || 'Upload failed'));
                      };
                      xhr.onerror = () => reject(new Error('Network error during upload'));
                      xhr.send(fd);
                    });
                    // Exponential backoff retries: 3 attempts (0ms, 500ms, 1500ms)
                    const attempts = [0, 500, 1500];
                    let lastErr: any;
                    for (let i = 0; i < attempts.length; i++) {
                      try {
                        if (attempts[i]) await new Promise(r => setTimeout(r, attempts[i]));
                        await sendOnce();
                        lastErr = null;
                        break;
                      } catch (e) {
                        lastErr = e;
                      }
                    }
                    if (lastErr) throw lastErr;
                    setUploadProgress(100);
                    setToast('Avatar updated');
                    setTimeout(() => setToast(null), 2500);
                    try { await refreshProfile(); } catch {}
                  } catch (err: any) {
                    setErrToast(err?.message || 'Failed to upload avatar');
                    setTimeout(() => setErrToast(null), 3500);
                  } finally {
                    setUploadProgress(0);
                  }
                  const reader = new FileReader();
                  reader.onload = () => { (user as any).avatarUrl = reader.result as string; };
                  reader.readAsDataURL(file);
                }} />
                <Button style={{ marginLeft: theme.spacing.sm }} onClick={() => fileInputRef.current?.click()}>
                  Upload Photo
                </Button>
              </>
            )}
          </div>

          {/* Profile Form */}
          <div style={{ display: 'grid', gap: theme.spacing.lg }}>
            {/* Basic Information */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0 0 16px 0',
                color: theme.colors.text
              }}>
                Basic Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                <Input
                  label="First Name"
                  value={isEditing ? formData.firstName : user?.firstName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                  error={errors.firstName}
                />
                <Input
                  label="Last Name"
                  value={isEditing ? formData.lastName : user?.lastName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  disabled={!isEditing}
                  error={errors.lastName}
                />
              </div>
              <div style={{ marginTop: theme.spacing.md }}>
                <Input
                  label="Bio"
                  value={isEditing ? formData.bio : user?.bio || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  error={errors.bio}
                />
              </div>
            </div>

            {/* Preferred Sport */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: theme.colors.text }}>
                Preferred Sport
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {POPULAR_SPORTS_NEPAL.map((s) => {
                  const selected = (isEditing ? formData.preferredSport : (user as any)?.preferredSport) === s.name;
                  return (
                    <button
                      key={s.name}
                      disabled={!isEditing}
                      onClick={() => setFormData(prev => ({ ...prev, preferredSport: s.name }))}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 9999,
                        border: selected ? '2px solid #dc143c' : '1px solid #e2e8f0',
                        background: selected ? 'rgba(220,20,60,0.1)' : 'white',
                        color: selected ? '#dc143c' : '#0f172a',
                        cursor: isEditing ? 'pointer' : 'default'
                      }}
                      aria-pressed={selected}
                    >
                      <span style={{ marginRight: 6 }}>{s.icon || '🏅'}</span>{s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0 0 16px 0',
                color: theme.colors.text
              }}>
                Contact Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                <Input
                  label="Phone Number"
                  value={isEditing ? formData.phoneNumber : user?.phoneNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="+977 98XXXXXXXX"
                  error={errors.phoneNumber}
                />
                <Input
                  label="Location"
                  value={isEditing ? formData.location : user?.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Kathmandu, Nepal"
                  error={errors.location}
                />
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0 0 16px 0',
                color: theme.colors.text
              }}>
                Social Media
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                <Input
                  label="Instagram"
                  value={isEditing ? formData.socialMedia.instagram : user?.socialMedia?.instagram || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                  }))}
                  disabled={!isEditing}
                  placeholder="@username"
                  leftIcon="📷"
                  error={errors.instagram}
                />
                <Input
                  label="TikTok"
                  value={isEditing ? formData.socialMedia.tiktok : user?.socialMedia?.tiktok || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    socialMedia: { ...prev.socialMedia, tiktok: e.target.value }
                  }))}
                  disabled={!isEditing}
                  placeholder="@username"
                  leftIcon="🎵"
                  error={errors.tiktok}
                />
                <Input
                  label="Facebook"
                  value={isEditing ? formData.socialMedia.facebook : user?.socialMedia?.facebook || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                  }))}
                  disabled={!isEditing}
                  placeholder="username"
                  leftIcon="👥"
                  error={errors.facebook}
                />
                <Input
                  label="Twitter"
                  value={isEditing ? formData.socialMedia.twitter : user?.socialMedia?.twitter || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                  }))}
                  disabled={!isEditing}
                  placeholder="@username"
                  leftIcon="🐦"
                  error={errors.twitter}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div style={{
                display: 'flex',
                gap: theme.spacing.md,
                justifyContent: 'flex-end',
                paddingTop: theme.spacing.lg,
                borderTop: `1px solid ${theme.colors.border}`
              }}>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={isLoading}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Account Actions */}
        <Card style={{
          padding: theme.spacing.lg,
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 16px 0',
            color: theme.colors.text
          }}>
            Account Actions
          </h3>
          <div style={{
            display: 'flex',
            gap: theme.spacing.md,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Button
              variant="outline"
              onClick={() => {/* Change password */}}
            >
              Change Password
            </Button>
            <Button
              variant="outline"
              onClick={() => {/* Privacy settings */}}
            >
              Privacy Settings
            </Button>
            <Button
              variant="danger"
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
