// src/components/ui/index.tsx - Reusable UI Components

import React from 'react';
import { theme, nepalComponents, keyframes } from '@styles/theme';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props 
}: ButtonProps) {
  const sizeStyles = {
    sm: { padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`, fontSize: '12px' },
    md: { padding: `${theme.spacing.sm}px ${theme.spacing.md}px`, fontSize: '14px' },
    lg: { padding: `${theme.spacing.md}px ${theme.spacing.lg}px`, fontSize: '16px' }
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      style={{
        ...nepalComponents.button[variant],
        ...sizeStyles[size],
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...props.style
      }}
    >
      {isLoading && (
        <div style={{ 
          marginRight: theme.spacing.xs,
          width: '16px',
          height: '16px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      {leftIcon && <span style={{ marginRight: theme.spacing.xs }}>{leftIcon}</span>}
      {children}
      {rightIcon && <span style={{ marginLeft: theme.spacing.xs }}>{rightIcon}</span>}
    </button>
  );
}

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, rightIcon, ...props }: InputProps) {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: theme.colors.muted,
          marginBottom: theme.spacing.xs
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <div style={{
            position: 'absolute',
            left: theme.spacing.sm,
            top: '50%',
            transform: 'translateY(-50%)',
            color: theme.colors.muted,
            pointerEvents: 'none'
          }}>
            {leftIcon}
          </div>
        )}
        <input
          {...props}
          style={{
            ...nepalComponents.input,
            paddingLeft: leftIcon ? theme.spacing.xl : theme.spacing.md,
            paddingRight: rightIcon ? theme.spacing.xl : theme.spacing.md,
            borderColor: error ? theme.colors.error : undefined,
            color: theme.colors.text,
            fontWeight: '500',
            ...props.style
          }}
        />
        {rightIcon && (
          <div style={{
            position: 'absolute',
            right: theme.spacing.sm,
            top: '50%',
            transform: 'translateY(-50%)',
            color: theme.colors.muted
          }}>
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p style={{
          fontSize: '12px',
          color: theme.colors.error,
          marginTop: theme.spacing.xs,
          margin: 0
        }}>
          {error}
        </p>
      )}
    </div>
  );
}

// Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  padding?: keyof typeof theme.spacing;
}

export function Card({ elevated = false, padding = 'md', children, ...props }: CardProps) {
  return (
    <div
      {...props}
      style={{
        ...(elevated ? nepalComponents.cardElevated : nepalComponents.card),
        padding: theme.spacing[padding],
        ...props.style
      }}
    >
      {children}
    </div>
  );
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const sizeStyles = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '500px' },
    lg: { maxWidth: '800px' }
  };

  if (!isOpen) return null;

  return (
    <div style={nepalComponents.modal.backdrop} onClick={onClose}>
      <div 
        style={{
          ...nepalComponents.modal.content,
          ...sizeStyles[size]
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
            paddingBottom: theme.spacing.md,
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: theme.colors.primary,
              margin: 0
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: theme.colors.muted,
                padding: 0
              }}
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// Badge Component
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', size = 'md', children }: BadgeProps) {
  const variants = {
    default: { background: '#f3f4f6', color: '#374151' },
    success: { background: `${theme.colors.success}20`, color: theme.colors.success },
    warning: { background: `${theme.colors.warning}20`, color: theme.colors.warning },
    error: { background: `${theme.colors.error}20`, color: theme.colors.error },
    info: { background: `${theme.colors.secondary}20`, color: theme.colors.secondary }
  };

  const sizes = {
    sm: { padding: '2px 6px', fontSize: '11px' },
    md: { padding: '4px 8px', fontSize: '12px' }
  };

  return (
    <span style={{
      ...variants[variant],
      ...sizes[size],
      borderRadius: theme.radius.full,
      fontWeight: '500',
      display: 'inline-block'
    }}>
      {children}
    </span>
  );
}

// Loading Spinner
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Spinner({ size = 'md', color = theme.colors.primary }: SpinnerProps) {
  const sizes = {
    sm: '16px',
    md: '24px',
    lg: '32px'
  };

  return (
    <div style={{
      width: sizes[size],
      height: sizes[size],
      border: '2px solid #f3f4f6',
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  );
}

// Avatar Component
interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
}

export function Avatar({ src, alt, size = 'md', fallback }: AvatarProps) {
  const sizes = {
    sm: '32px',
    md: '40px',
    lg: '56px'
  };

  const fontSize = {
    sm: '14px',
    md: '16px',
    lg: '20px'
  };

  return (
    <div style={{
      width: sizes[size],
      height: sizes[size],
      borderRadius: '50%',
      overflow: 'hidden',
      background: theme.gradients.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: fontSize[size]
    }}>
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        fallback || '?'
      )}
    </div>
  );
}

// Tabs Component
interface TabsProps {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  defaultTab?: string;
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  return (
    <div>
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: theme.spacing.lg
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
              color: activeTab === tab.id ? theme.colors.primary : theme.colors.muted,
              fontWeight: activeTab === tab.id ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find(tab => tab.id === activeTab)?.content}
    </div>
  );
}

// Toast Container (to be used with a toast context)
export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div style={nepalComponents.toast.container}>
      {children}
    </div>
  );
}

// Individual Toast
interface ToastProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div style={nepalComponents.toast[type]}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            marginLeft: theme.spacing.sm,
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Google Maps Component
interface GoogleMapProps {
  center: { lat: number; lng: number };
  markers?: Array<{ lat: number; lng: number; title: string }>;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  className?: string;
}

export function GoogleMap({ 
  center, 
  markers = [], 
  onLocationSelect, 
  className = '' 
}: GoogleMapProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = React.useState<{ lat: number; lng: number; address: string } | null>(null);

  // Mock Google Maps implementation
  React.useEffect(() => {
    if (mapRef.current) {
      // In a real implementation, you would initialize Google Maps here
      mapRef.current.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #4a90e2 0%, #2d5016 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          position: relative;
          border-radius: 8px;
        ">
          <div>
            <div style="font-size: 24px; margin-bottom: 8px;">🗺️</div>
            <div>Nepal Interactive Map</div>
            <div style="font-size: 12px; margin-top: 4px; opacity: 0.8;">
              Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)}
            </div>
            ${markers.length > 0 ? `<div style="font-size: 12px; margin-top: 8px;">${markers.length} locations found</div>` : ''}
          </div>
        </div>
      `;
    }
  }, [center, markers]);

  const handleMapClick = () => {
    // Mock location selection
    const mockLocation = {
      lat: center.lat + (Math.random() - 0.5) * 0.01,
      lng: center.lng + (Math.random() - 0.5) * 0.01,
      address: 'Selected Location, Kathmandu, Nepal'
    };
    setSelectedLocation(mockLocation);
    onLocationSelect?.(mockLocation);
  };

  return (
    <div style={{ position: 'relative', ...(className ? { className } : {}) }}>
      <div 
        ref={mapRef} 
        style={{
          width: '100%',
          height: '256px',
          cursor: 'pointer',
          borderRadius: theme.radius.lg
        }}
        onClick={handleMapClick}
      />
      {selectedLocation && (
        <div style={{
          position: 'absolute',
          bottom: theme.spacing.sm,
          left: theme.spacing.sm,
          background: 'white',
          padding: theme.spacing.sm,
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadows.lg,
          fontSize: '14px'
        }}>
          📍 {selectedLocation.address}
        </div>
      )}
    </div>
  );
}

// Create Game Form Component
interface CreateGameFormProps {
  onSubmit: (gameData: any) => void;
  onCancel: () => void;
}

export function CreateGameForm({ onSubmit, onCancel }: CreateGameFormProps) {
  const [formData, setFormData] = React.useState({
    sport: '',
    location: '',
    latitude: 27.7172,
    longitude: 85.3240,
    gameTime: '',
    skillLevel: '',
    description: '',
    minPlayers: 2,
    maxPlayers: 10,
    pricePerPlayer: 0,
    durationMinutes: 60
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      location: location.address,
      latitude: location.lat,
      longitude: location.lng
    }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Sport</label>
          <select
            value={formData.sport}
            onChange={(e) => setFormData(prev => ({ ...prev, sport: e.target.value }))}
            style={{
              width: '100%',
              padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
              border: '1px solid #d1d5db',
              borderRadius: theme.radius.lg,
              outline: 'none'
            }}
            required
          >
            <option value="">Select Sport</option>
            <option value="Futsal">⚽ Futsal</option>
            <option value="Basketball">🏀 Basketball</option>
            <option value="Cricket">🏏 Cricket</option>
            <option value="Volleyball">🏐 Volleyball</option>
            <option value="Table Tennis">🏓 Table Tennis</option>
            <option value="Badminton">🏸 Badminton</option>
            <option value="Tennis">🎾 Tennis</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Skill Level</label>
          <select
            value={formData.skillLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
            style={{
              width: '100%',
              padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
              border: '1px solid #d1d5db',
              borderRadius: theme.radius.lg,
              outline: 'none'
            }}
          >
            <option value="">Any Level</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Game Date & Time</label>
        <input
          type="datetime-local"
          value={formData.gameTime}
          onChange={(e) => setFormData(prev => ({ ...prev, gameTime: e.target.value }))}
          style={{
            width: '100%',
            padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
            border: '1px solid #d1d5db',
            borderRadius: theme.radius.lg,
            outline: 'none'
          }}
          required
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Location</label>
        <GoogleMap
          center={{ lat: formData.latitude, lng: formData.longitude }}
          onLocationSelect={handleLocationSelect}
          className="mb-2"
        />
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Enter location or click on map"
          style={{
            width: '100%',
            padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
            border: '1px solid #d1d5db',
            borderRadius: theme.radius.lg,
            outline: 'none'
          }}
          required
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your game..."
          rows={3}
          style={{
            width: '100%',
            padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
            border: '1px solid #d1d5db',
            borderRadius: theme.radius.lg,
            outline: 'none'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
        <Input
          label="Min Players"
          type="number"
          value={formData.minPlayers}
          onChange={(e) => setFormData(prev => ({ ...prev, minPlayers: Number(e.target.value) }))}
          required
        />
        <Input
          label="Max Players"
          type="number"
          value={formData.maxPlayers}
          onChange={(e) => setFormData(prev => ({ ...prev, maxPlayers: Number(e.target.value) }))}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
        <Input
          label="Price per Player (NPR)"
          type="number"
          value={formData.pricePerPlayer}
          onChange={(e) => setFormData(prev => ({ ...prev, pricePerPlayer: Number(e.target.value) }))}
        />
        <Input
          label="Duration (minutes)"
          type="number"
          value={formData.durationMinutes}
          onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
          required
        />
      </div>

      <div style={{ display: 'flex', gap: theme.spacing.sm, paddingTop: theme.spacing.md }}>
        <Button type="submit" style={{ flex: 1 }}>
          Create Game
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// User Profile Component
interface UserProfileProps {
  user: any;
  onUpdateProfile: (data: any) => void;
}

export function UserProfile({ user, onUpdateProfile }: UserProfileProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || '',
    skillLevel: user.skillLevel || 'BEGINNER',
    age: user.age || '',
    position: user.position || '',
    location: user.location || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card padding="lg">
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: theme.spacing.lg }}>Edit Profile</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            />
          </div>

          <Input
            label="Bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself..."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Skill Level</label>
              <select
                value={formData.skillLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
                style={{
                  width: '100%',
                  padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                  border: '1px solid #d1d5db',
                  borderRadius: theme.radius.lg,
                  outline: 'none'
                }}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <Input
              label="Age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            />
          </div>

          <Input
            label="Preferred Position"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            placeholder="e.g., Midfielder, Point Guard, etc."
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Your city/area"
          />

          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <Button type="submit" style={{ flex: 1 }}>Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.lg }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Profile</h2>
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          Edit Profile
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.md }}>
        <img
          src={user.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face'}
          alt={user.username}
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            border: `4px solid ${theme.colors.primary}20`
          }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
            {user.firstName} {user.lastName}
          </h3>
          <p style={{ color: theme.colors.muted }}>@{user.username}</p>
          {user.skillLevel && (
            <Badge variant="default" style={{ marginTop: theme.spacing.sm }}>
              {user.skillLevel}
            </Badge>
          )}
          {user.bio && (
            <p style={{ marginTop: theme.spacing.sm, color: '#374151' }}>{user.bio}</p>
          )}
          <div style={{ marginTop: theme.spacing.sm, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: theme.colors.muted }}>
            {user.location && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: theme.spacing.xs }}>📍</span>
                {user.location}
              </div>
            )}
            {user.age && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: theme.spacing.xs }}>🎂</span>
                {user.age} years old
              </div>
            )}
            {user.position && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: theme.spacing.xs }}>⚽</span>
                {user.position}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Global styles to inject
export const GlobalStyles = () => {
  React.useEffect(() => {
    // Inject web fonts (Inter + Montserrat) once
    if (!document.head.querySelector('link[data-app-fonts="true"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.setAttribute('data-app-fonts', 'true');
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@700;800&display=swap';
      document.head.appendChild(link);
    }
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      ${keyframes}
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes confetti-fall {
        0% { opacity: 0; transform: translateY(0) rotate(0deg); }
        10% { opacity: 1; }
        100% { opacity: 0; transform: translateY(300px) rotate(360deg); }
      }
      
      :root {
        --color-primary: #E63946;
        --color-primary-700: #C82F3A;
        --color-primary-50: #FDECEF;
        --color-ink: #0E1116;
        --color-ink-muted: #4A5568;
        --color-bg: #0F1626;
        --neutral-0: #FFFFFF;
        --neutral-50: #F5F7FA;
        --neutral-200: #E6E8EC;
        --neutral-300: #C7CDD8;
        --success: #2ECC71;
        --warning: #F4B400;
        --danger: #E11D48;
        --info: #3B82F6;
        --focus-ring: #7C3AED;

        --radius-input: 16px;
        --radius-card: 24px;
        --radius-pill: 999px;
        --shadow-card: 0 12px 30px rgba(0,0,0,0.25);
      }

      * {
        box-sizing: border-box;
      }
      
      body {
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
        color: var(--neutral-50);
        margin: 0;
        padding: 0;
        background-color: var(--color-bg);
        /* Reduce warm/orange cast; favor navy with subtle crimson */
        background-image:
          radial-gradient(ellipse at 10% -10%, rgba(230,57,70,0.10), transparent 55%),
          radial-gradient(ellipse at 110% 0%, rgba(27,38,59,0.30), transparent 60%),
          radial-gradient(ellipse at 50% 120%, rgba(27,38,59,0.20), transparent 60%);
      }
      h1, h2, .display { font-family: Montserrat, Inter, system-ui, -apple-system, sans-serif; letter-spacing: -0.01em; }
      /* Ensure form field text is visible on light inputs, even in dark sections */
      input, select, textarea {
        color: #111827; /* slate-900 */
        -webkit-text-fill-color: #111827; /* Safari */
        background-color: #ffffff;
        caret-color: #111827;
      }
      input::placeholder, textarea::placeholder {
        color: #6b7280; /* slate-500 */
      }
      /* Reasonable default sizing; components can override with classes */
      input, select, textarea {
        font-size: 15px;
      }
      @media (max-width: 380px) {
        input, select, textarea {
          font-size: 14px;
          padding: 8px 10px;
        }
      }
      
      button:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible {
        outline: 3px solid var(--focus-ring);
        outline-offset: 2px;
      }

      /* Utility button classes using tokens */
      .btn { min-height: 48px; border-radius: var(--radius-input); font-weight: 700; letter-spacing: .2px; }
      .btn-primary { background: var(--color-primary); color: #fff; border: none; box-shadow: var(--shadow-card); }
      .btn-primary:hover { filter: brightness(1.05); transform: translateY(-2px); }
      .btn-outline { background: transparent; color: var(--neutral-0); border: 1px solid rgba(255,255,255,0.35); }
      .btn-outline:hover { background: rgba(255,255,255,0.08); }
      .btn-gradient { background: linear-gradient(45deg, #1B263B, #6A2F8E, #E63946); color: #fff; }

      /* Frosted card */
      .card-frost { backdrop-filter: blur(16px); background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius-card); box-shadow: var(--shadow-card); }
    `;
    
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return null;
};
