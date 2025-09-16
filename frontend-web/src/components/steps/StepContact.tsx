// src/components/steps/StepContact.tsx - Step 2: Contact & Gender Information

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Mail, Phone, ChevronDown, Eye as EyeIcon } from 'lucide-react';
import { StepContactProps } from '../../types/registration';
import { COUNTRIES } from '../../lib/constants';

const StepContact: React.FC<StepContactProps> = ({
  formData,
  setFormData,
  errors,
  countryCode,
  setCountryCode,
  countrySearch,
  setCountrySearch,
  showCountryDropdown,
  setShowCountryDropdown,
  countryDropdownRef,
  genderPublic,
  setGenderPublic
}) => {
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const optionsContainerRef = useRef<HTMLDivElement>(null);

  // Debounced filter (250–300ms) and reset active index
  useEffect(() => {
    const t = setTimeout(() => {
      if (countrySearch) {
        const q = countrySearch.toLowerCase();
        const filtered = COUNTRIES.filter(country =>
          country.name.toLowerCase().includes(q) || country.code.toLowerCase().includes(q)
        );
        setFilteredCountries(filtered);
      } else {
        setFilteredCountries(COUNTRIES);
      }
      setActiveIndex(-1);
    }, 260);
    return () => clearTimeout(t);
  }, [countrySearch]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^\d\s\-\(\)]/g, '');
    setFormData((prev: any) => ({ ...prev, phone: cleanValue }));
  };

  const handlePhoneBlur = () => {
    if (formData.phone && !formData.phone.startsWith('+')) {
      const selectedCountry = COUNTRIES.find(c => c.code === countryCode);
      if (selectedCountry) {
        const fullPhone = `${selectedCountry.code}${formData.phone}`;
        setFormData((prev: any) => ({ ...prev, phone: fullPhone }));
      }
    }
  };

  const handleCountrySelect = (country: any) => {
    setCountryCode(country.code);
    setShowCountryDropdown(false);
    setCountrySearch('');
    
    // Update phone number with new country code if phone exists
    if (formData.phone && !formData.phone.startsWith('+')) {
      const fullPhone = `${country.code}${formData.phone}`;
      setFormData((prev: any) => ({ ...prev, phone: fullPhone }));
    }
  };

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode);

  // Keyboard navigation within dropdown
  const onKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCountryDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(filteredCountries.length - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && filteredCountries[activeIndex]) {
        e.preventDefault();
        handleCountrySelect(filteredCountries[activeIndex]);
      }
    }
  };

  // Scroll active option into view on keyboard navigation
  useEffect(() => {
    if (!showCountryDropdown) return;
    const container = optionsContainerRef.current;
    if (!container) return;
    const buttons = container.querySelectorAll('button[role="option"]');
    const el = buttons.item(activeIndex) as HTMLElement | null;
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, showCountryDropdown]);

  const highlight = (text: string) => {
    if (!countrySearch) return text;
    const q = countrySearch.trim();
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")})`, 'ig');
    return (
      <>
        {text.split(re).map((part, i) => (
          re.test(part) ? <strong key={i} className="text-gray-900">{part}</strong> : <span key={i}>{part}</span>
        ))}
      </>
    ) as unknown as string;
  };

  return (
    <div className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#E9EEF5] mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C7D1E0]" />
          <input
            type="email"
            placeholder="your@email.com"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all bg-white text-gray-900 placeholder-[#95A3B6]"
          />
        </div>
        {errors?.email && (
          <p className="mt-1 text-sm text-nepal-crimson">{errors.email}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-[#E9EEF5] mb-2">
          Phone Number
        </label>
        <div className="flex gap-2">
          {/* Country Selector */}
          <div className="relative w-36 flex-shrink-0" ref={countryDropdownRef}>
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="w-full flex items-center justify-between px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all bg-white text-gray-900"
              data-testid="country-selector-button"
              aria-haspopup="listbox"
              aria-expanded={showCountryDropdown}
              aria-controls="country-dropdown-listbox"
            >
              <span className="text-sm truncate min-w-0">
                {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name} (${selectedCountry.code})` : 'Select Country'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {showCountryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl z-50 max-h-60 overflow-hidden" data-testid="country-dropdown" role="listbox" id="country-dropdown-listbox">
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    onKeyDown={onKeyDownSearch}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-nepal-crimson focus:border-transparent bg-white text-[#0E1116] placeholder-[#8A98AB]"
                    data-testid="country-search"
                    autoFocus
                  />
                </div>
                <div ref={optionsContainerRef} className="max-h-48 overflow-y-auto">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country, idx) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${idx === activeIndex ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                        aria-selected={idx === activeIndex}
                        role="option"
                        data-testid={`country-option-${country.code.replace('+','p')}`}
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span className="flex-1 truncate text-gray-900">{highlight(country.name)}</span>
                        <span className="text-gray-700 text-xs font-medium">{country.code}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Phone Input */}
          <div className="relative flex-1 min-w-0">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#C7D1E0]" />
            <input
              type="tel"
              placeholder="Enter your phone number"
              id="phone"
              value={formData.phone?.replace(/^\+\d+\s?/, '') || ''}
              onChange={handlePhoneChange}
              onBlur={handlePhoneBlur}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nepal-crimson focus:border-transparent transition-all bg-white text-gray-900 placeholder-[#95A3B6]"
            />
          </div>
        </div>
        {errors?.phone && (
          <p className="mt-1 text-sm text-nepal-crimson">{errors.phone}</p>
        )}
      </div>

      {/* Gender Selection */}
      <div>
        <p className="text-sm text-[#E9EEF5] mb-2">Choose how you want to be seen in the app.</p>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Gender selection">
          {[
            { value: 'male', label: 'Male', icon: '👕' },
            { value: 'female', label: 'Female', icon: '👚' },
            { value: 'non-binary', label: 'Non-binary', icon: '⚧' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say', icon: '🤐' }
          ].map((option) => {
            const selected = formData.gender === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData((prev: any) => ({ ...prev, gender: option.value }))}
                className={`relative text-left px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-nepal-crimson ${
                  selected
                    ? 'bg-white text-gray-800 border-nepal-crimson ring-1 ring-nepal-crimson shadow-[0_0_0_3px_rgba(220,20,60,0.15)]'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-nepal-crimson'
                }`}
                role="radio"
                aria-checked={selected}
              >
                {selected && (
                  <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-nepal-crimson text-white text-[10px] flex items-center justify-center shadow-[0_0_8px_rgba(220,20,60,0.6)]">✓</span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-[11px] text-gray-500">Tap to choose.</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {errors?.gender && (
          <p className="mt-1 text-sm text-nepal-crimson">{errors.gender}</p>
        )}
      </div>
      {/* Gender Public Toggle (pill style) */}
      <div className="pt-1">
        <button
          type="button"
          aria-pressed={genderPublic}
          onClick={() => setGenderPublic(!genderPublic)}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ring-1 ${
            genderPublic
              ? 'bg-nepal-crimson text-white ring-nepal-crimson'
              : 'bg-white text-gray-700 ring-gray-300 hover:text-nepal-crimson hover:ring-nepal-crimson'
          }`}
        >
          <span className="mr-1">👁️</span> {genderPublic ? 'Shown publicly' : 'Show publicly'}
        </button>
        <p className="mt-1 text-xs text-[#C7D1E0]">
          Used to personalize leagues; hidden by default.
        </p>
      </div>
    </div>
  );
};

export default StepContact;
