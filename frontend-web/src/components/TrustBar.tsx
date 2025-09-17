import React from 'react';
import { Shield, Target, Zap, Lock } from 'lucide-react';

interface TrustBarProps {
  className?: string;
}

const trustItems = [
  {
    icon: Shield,
    text: 'Secure',
    description: 'End-to-end encryption'
  },
  {
    icon: Target,
    text: 'Fair Play',
    description: 'Verified players only'
  },
  {
    icon: Zap,
    text: 'Fast',
    description: 'Lightning quick matching'
  },
  {
    icon: Lock,
    text: 'Protected',
    description: 'Your data is safe'
  }
];

export default function TrustBar({ className = '' }: TrustBarProps) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--border)] shadow-lg ${className}`}>
      {/* Safe area padding for mobile devices */}
      <div className="pb-safe-area-inset-bottom">
        <div className="px-4 py-3">
          <div className="flex items-center justify-center gap-6 md:gap-8">
            {trustItems.map((item, index) => {
              const IconComponent = item.icon;
              
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 text-center group cursor-pointer"
                  title={item.description}
                >
                  <div className="w-8 h-8 bg-[var(--brand-primary)]/10 rounded-full flex items-center justify-center group-hover:bg-[var(--brand-primary)]/20 transition-colors">
                    <IconComponent className="w-4 h-4 text-[var(--brand-primary)]" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:inline">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}