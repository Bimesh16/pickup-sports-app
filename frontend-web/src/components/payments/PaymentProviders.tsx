import React from 'react';
import { Card } from '../ui';
import { theme } from '../../styles/theme';

// Payment provider logos
const PROVIDER_LOGOS = {
  esewa: '/images/esewa-logo.svg',
  khalti: '/images/khalti-logo.svg',
  cash: '/images/cash-icon.svg',
};

// Fallback logos using emoji
const FALLBACK_LOGOS = {
  esewa: '💳',
  khalti: '📱',
  cash: '💵',
};

export interface PaymentProvider {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  popular?: boolean;
}

interface PaymentProviderCardProps {
  provider: PaymentProvider;
  selected: boolean;
  onSelect: (providerId: string) => void;
}

export const PaymentProviderCard: React.FC<PaymentProviderCardProps> = ({
  provider,
  selected,
  onSelect,
}) => {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-2 border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
          : 'border border-[var(--border)] hover:border-[var(--brand-primary)]/50'
      }`}
      onClick={() => onSelect(provider.id)}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
          {PROVIDER_LOGOS[provider.id as keyof typeof PROVIDER_LOGOS] ? (
            <img
              src={PROVIDER_LOGOS[provider.id as keyof typeof PROVIDER_LOGOS]}
              alt={provider.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                // If image fails to load, show fallback emoji
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl">${
                  FALLBACK_LOGOS[provider.id as keyof typeof FALLBACK_LOGOS] || '💰'
                }</span>`;
              }}
            />
          ) : (
            <span className="text-2xl">
              {FALLBACK_LOGOS[provider.id as keyof typeof FALLBACK_LOGOS] || '💰'}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-[var(--text-primary)]">{provider.name}</h4>
          {provider.description && (
            <p className="text-sm text-[var(--text-muted)]">{provider.description}</p>
          )}
          {provider.popular && (
            <span className="inline-block text-xs bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] px-2 py-0.5 rounded-full mt-1">
              Popular
            </span>
          )}
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selected
              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]'
              : 'border-[var(--border)]'
          }`}
        >
          {selected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </div>
    </Card>
  );
};

interface PaymentProviderSelectorProps {
  providers: PaymentProvider[];
  selectedProviderId: string;
  onSelectProvider: (providerId: string) => void;
}

export const PaymentProviderSelector: React.FC<PaymentProviderSelectorProps> = ({
  providers,
  selectedProviderId,
  onSelectProvider,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-[var(--text-primary)]">Select Payment Method</h3>
      {providers.map((provider) => (
        <PaymentProviderCard
          key={provider.id}
          provider={provider}
          selected={selectedProviderId === provider.id}
          onSelect={onSelectProvider}
        />
      ))}
    </div>
  );
};