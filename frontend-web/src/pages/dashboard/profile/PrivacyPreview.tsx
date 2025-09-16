import React from 'react';
import { Card } from '@components/ui';
import { 
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserProfile } from './types';

interface PrivacyPreviewProps {
  privacy: UserProfile['privacy'];
  onToggle: (field: keyof UserProfile['privacy']) => void;
}

const PrivacyPreview: React.FC<PrivacyPreviewProps> = ({ privacy, onToggle }) => {
  const fields = [
    { key: 'showEmail', label: 'Email', icon: Mail, public: privacy.showEmail },
    { key: 'showPhone', label: 'Phone', icon: Phone, public: privacy.showPhone },
    { key: 'showLocation', label: 'Location', icon: MapPin, public: privacy.showLocation }
  ];

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-[var(--text)] mb-4">Privacy Settings</h3>
      <div className="space-y-3">
        {fields.map((field) => {
          const IconComponent = field.icon;
          return (
            <div key={field.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-sm">{field.label}</span>
              </div>
              <button
                onClick={() => onToggle(field.key as keyof UserProfile['privacy'])}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-colors ${
                  field.public 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {field.public ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {field.public ? 'Public' : 'Private'}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PrivacyPreview;
