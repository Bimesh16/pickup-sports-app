// src/components/steps/StepReview.tsx - Step 4: Review & Confirm

import React from 'react';
import { StepReviewProps } from '../../types/registration';

const StepReview: React.FC<StepReviewProps> = ({
  formData,
  countryCode,
  acceptTerms,
  acceptPrivacy,
  emailUpdates,
  setAcceptTerms,
  setAcceptPrivacy,
  setEmailUpdates,
  navigateToStep
}) => {
  const obfuscate = (v: string) => {
    if (!v) return '';
    if (v.includes('@')) {
      const [u, d] = v.split('@');
      return `${u.slice(0,2)}***@***.${(d.split('.').pop()||'').slice(0,3)}`;
    }
    return v.length > 6 ? `${v.slice(0,3)} **** ${v.slice(-3)}` : v;
  };

  const getGenderDisplay = (gender: string) => {
    const genderMap: Record<string, string> = {
      'male': '👨 Male',
      'female': '👩 Female', 
      'non-binary': '⚧ Non-binary',
      'prefer-not-to-say': '🤐 Prefer not to say'
    };
    return genderMap[gender] || '—';
  };

  return (
    <div className="space-y-6">
      {/* Identity Section */}
      <div className="rounded-2xl bg-white/50 p-4 ring-1 ring-black/5" aria-labelledby="review-identity">
        <div className="flex items-center justify-between mb-3">
          <h3 id="review-identity" className="text-sm font-semibold text-[#E9EEF5]">Your Jersey Identity</h3>
          <button
            onClick={() => navigateToStep('identity')}
            className="text-xs text-nepal-crimson hover:text-nepal-crimson/80 font-medium px-2 py-1 rounded-md hover:bg-nepal-crimson/10 transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
            <span className="text-xs text-[#0E1116]">Display Name</span>
            <span className="text-sm font-medium text-gray-900">{`${formData.firstName} ${formData.lastName}`.trim() || '—'}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
            <span className="text-xs text-[#0E1116]">Player Tag</span>
            <span className="text-sm font-medium text-gray-900">@{formData.username?.toLowerCase() || '—'}</span>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="rounded-2xl bg-white/50 p-4 ring-1 ring-black/5" aria-labelledby="review-contact">
        <div className="flex items-center justify-between mb-3">
          <h3 id="review-contact" className="text-sm font-semibold text-[#E9EEF5]">Contact & Gender</h3>
          <button
            onClick={() => navigateToStep('contact')}
            className="text-xs text-nepal-crimson hover:text-nepal-crimson/80 font-medium px-2 py-1 rounded-md hover:bg-nepal-crimson/10 transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
            <span className="text-xs text-[#0E1116]">Email</span>
            <span className="text-sm font-medium text-gray-900">{obfuscate(formData.email || '') || '—'}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
            <span className="text-xs text-[#0E1116]">Phone</span>
            <span className="text-sm font-medium text-gray-900">{obfuscate(formData.phone || '') || '—'}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
            <span className="text-xs text-[#0E1116]">Gender</span>
            <span className="text-sm font-medium text-gray-900">{getGenderDisplay(formData.gender)}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
            <span className="text-xs text-[#0E1116]">Country</span>
            <span className="text-sm font-medium text-gray-900">{countryCode || '—'}</span>
          </div>
        </div>
      </div>

      {/* Badge Section (kept but hidden details on review per spec) */}
      <div className="rounded-2xl bg-white/50 p-4 ring-1 ring-black/5" aria-labelledby="review-badge">
        <div className="flex items-center justify-between mb-3">
          <h3 id="review-badge" className="text-sm font-semibold text-[#E9EEF5]">Your Player Badge</h3>
          <button
            onClick={() => navigateToStep('badge')}
            className="text-xs text-nepal-crimson hover:text-nepal-crimson/80 font-medium px-2 py-1 rounded-md hover:bg-nepal-crimson/10 transition-colors"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Only show collected essentials on Review */}
          <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
            <span className="text-xs text-[#0E1116]">Country</span>
            <span className="text-sm font-medium text-gray-900">{countryCode || '—'}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
            <span className="text-xs text-[#0E1116]">Email</span>
            <span className="text-sm font-medium text-gray-900">{obfuscate(formData.email || '') || '—'}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
            <span className="text-xs text-[#0E1116]">Phone</span>
            <span className="text-sm font-medium text-gray-900">{obfuscate(formData.phone || '') || '—'}</span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-3 p-4 bg-white/80 rounded-xl ring-1 ring-black/5">
        <h3 className="text-sm font-semibold text-gray-900">Terms & Conditions</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-900">
            <input 
              type="checkbox" 
              checked={acceptTerms} 
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 text-nepal-crimson focus:ring-nepal-crimson border-gray-300 rounded"
            /> 
            I agree to the <a href="/terms" className="text-nepal-crimson hover:underline">Terms of Service</a>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-900">
            <input 
              type="checkbox" 
              checked={acceptPrivacy} 
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              className="h-4 w-4 text-nepal-crimson focus:ring-nepal-crimson border-gray-300 rounded"
            /> 
            I agree to the <a href="/privacy" className="text-nepal-crimson hover:underline">Privacy Policy</a>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input 
              type="checkbox" 
              checked={emailUpdates} 
              onChange={(e) => setEmailUpdates(e.target.checked)}
              className="h-4 w-4 text-nepal-crimson focus:ring-nepal-crimson border-gray-300 rounded"
            /> 
            Send me email updates about games and events (optional)
          </label>
        </div>
      </div>
    </div>
  );
};

export default StepReview;
