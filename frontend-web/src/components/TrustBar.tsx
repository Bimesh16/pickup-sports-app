import React from 'react';
import { Shield, Target, Zap, Lock } from 'lucide-react';

const TrustBar: React.FC = () => {
  const trustItems = [
    {
      icon: Shield,
      text: 'Secure',
      description: 'Your data is protected'
    },
    {
      icon: Target,
      text: 'Fair Play',
      description: 'Equal opportunities for all'
    },
    {
      icon: Zap,
      text: 'Fast',
      description: 'Lightning quick performance'
    },
    {
      icon: Lock,
      text: 'Protected',
      description: 'Privacy first approach'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 safe-area-pb">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="flex items-center gap-2 text-center">
                <div className="flex-shrink-0">
                  <IconComponent className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {item.text}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {item.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrustBar;
