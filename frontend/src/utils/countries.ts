export interface Country {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}

export interface Nationality {
  code: string;
  name: string;
  countryCode: string;
}

export const COUNTRIES: Country[] = [
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', phoneCode: '+977' },
  { code: 'US', name: 'United States', flag: '🇺🇸', phoneCode: '+1' },
  { code: 'IN', name: 'India', flag: '🇮🇳', phoneCode: '+91' },
  { code: 'CN', name: 'China', flag: '🇨🇳', phoneCode: '+86' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phoneCode: '+44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', phoneCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', phoneCode: '+61' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', phoneCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', phoneCode: '+33' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', phoneCode: '+81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', phoneCode: '+82' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', phoneCode: '+65' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', phoneCode: '+60' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', phoneCode: '+66' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', phoneCode: '+880' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', phoneCode: '+92' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', phoneCode: '+94' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹', phoneCode: '+975' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', phoneCode: '+960' },
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', phoneCode: '+93' },
];

export const NATIONALITIES: Nationality[] = [
  { code: 'NP', name: 'Nepali', countryCode: 'NP' },
  { code: 'US', name: 'American', countryCode: 'US' },
  { code: 'IN', name: 'Indian', countryCode: 'IN' },
  { code: 'CN', name: 'Chinese', countryCode: 'CN' },
  { code: 'GB', name: 'British', countryCode: 'GB' },
  { code: 'CA', name: 'Canadian', countryCode: 'CA' },
  { code: 'AU', name: 'Australian', countryCode: 'AU' },
  { code: 'DE', name: 'German', countryCode: 'DE' },
  { code: 'FR', name: 'French', countryCode: 'FR' },
  { code: 'JP', name: 'Japanese', countryCode: 'JP' },
  { code: 'KR', name: 'Korean', countryCode: 'KR' },
  { code: 'SG', name: 'Singaporean', countryCode: 'SG' },
  { code: 'MY', name: 'Malaysian', countryCode: 'MY' },
  { code: 'TH', name: 'Thai', countryCode: 'TH' },
  { code: 'BD', name: 'Bangladeshi', countryCode: 'BD' },
  { code: 'PK', name: 'Pakistani', countryCode: 'PK' },
  { code: 'LK', name: 'Sri Lankan', countryCode: 'LK' },
  { code: 'BT', name: 'Bhutanese', countryCode: 'BT' },
  { code: 'MV', name: 'Maldivian', countryCode: 'MV' },
  { code: 'AF', name: 'Afghan', countryCode: 'AF' },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(country => country.code === code);
};

export const getNationalityByCode = (code: string): Nationality | undefined => {
  return NATIONALITIES.find(nationality => nationality.code === code);
};

export const getCountriesByRegion = (region: 'asia' | 'europe' | 'americas' | 'africa' | 'oceania'): Country[] => {
  const regionMap = {
    asia: ['NP', 'IN', 'CN', 'JP', 'KR', 'SG', 'MY', 'TH', 'BD', 'PK', 'LK', 'BT', 'MV', 'AF'],
    europe: ['GB', 'DE', 'FR'],
    americas: ['US', 'CA'],
    africa: [],
    oceania: ['AU'],
  };
  
  const codes = regionMap[region] || [];
  return COUNTRIES.filter(country => codes.includes(country.code));
};
