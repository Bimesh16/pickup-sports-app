// src/constants/nepal.ts - Nepal-specific Constants

export const NEPAL_COLORS = {
  primary: '#DC143C', // Crimson red from Nepal flag
  secondary: '#003893', // Navy blue from Nepal flag
  accent: '#FFD700', // Gold
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  text: '#1f2937', // Dark gray for text
  border: '#d1d5db', // Light gray for borders
  muted: '#6b7280',
  background: '#f8fafc',
  surface: '#ffffff',
  mountainGreen: '#2d5016',
  himalayaBlue: '#4a90e2',
  rhododendronPink: '#e91e63',
  prayer: '#ff6b35'
} as const;

export const NEPAL_LOCATIONS = {
  KATHMANDU: { lat: 27.7172, lng: 85.3240, name: 'Kathmandu' },
  POKHARA: { lat: 28.2096, lng: 83.9856, name: 'Pokhara' },
  LALITPUR: { lat: 27.6588, lng: 85.3247, name: 'Lalitpur' },
  BHAKTAPUR: { lat: 27.6710, lng: 85.4298, name: 'Bhaktapur' },
  CHITWAN: { lat: 27.5291, lng: 84.3542, name: 'Chitwan' },
  BIRATNAGAR: { lat: 26.4525, lng: 87.2718, name: 'Biratnagar' },
  DHARAN: { lat: 26.8147, lng: 87.2847, name: 'Dharan' },
  BUTWAL: { lat: 27.7000, lng: 83.4486, name: 'Butwal' },
  NEPALGUNJ: { lat: 28.0500, lng: 81.6167, name: 'Nepalgunj' },
  JANAKPUR: { lat: 26.7288, lng: 85.9245, name: 'Janakpur' }
} as const;

export const POPULAR_SPORTS_NEPAL = [
  { 
    id: 1, 
    name: 'Futsal', 
    icon: '⚽', 
    popularity: 95, 
    description: 'Most popular indoor sport in Nepal',
    nepaliName: 'फुटसल'
  },
  { 
    id: 2, 
    name: 'Football', 
    icon: '🏈', 
    popularity: 90, 
    description: 'National passion',
    nepaliName: 'फुटबल'
  },
  { 
    id: 3, 
    name: 'Cricket', 
    icon: '🏏', 
    popularity: 85, 
    description: 'Growing rapidly',
    nepaliName: 'क्रिकेट'
  },
  { 
    id: 4, 
    name: 'Basketball', 
    icon: '🏀', 
    popularity: 75, 
    description: 'Urban favorite',
    nepaliName: 'बास्केटबल'
  },
  { 
    id: 5, 
    name: 'Volleyball', 
    icon: '🏐', 
    popularity: 70, 
    description: 'School and college favorite',
    nepaliName: 'भलिबल'
  },
  { 
    id: 6, 
    name: 'Table Tennis', 
    icon: '🏓', 
    popularity: 65, 
    description: 'Indoor choice',
    nepaliName: 'टेबल टेनिस'
  },
  { 
    id: 7, 
    name: 'Badminton', 
    icon: '🏸', 
    popularity: 60, 
    description: 'Recreation favorite',
    nepaliName: 'ब्याडमिन्टन'
  },
  { 
    id: 8, 
    name: 'Tennis', 
    icon: '🎾', 
    popularity: 45, 
    description: 'Growing in cities',
    nepaliName: 'टेनिस'
  }
] as const;

export const KATHMANDU_AREAS = [
  'Thamel', 'Durbar Marg', 'New Baneshwor', 'Koteshwor', 'Balaju',
  'Maharajgunj', 'Lazimpat', 'Anamnagar', 'Dillibazar', 'Putalisadak',
  'Tripureshwor', 'Kalimati', 'Kalanki', 'Gongabu', 'Budhanilkantha'
] as const;

export const POKHARA_AREAS = [
  'Lakeside', 'Damside', 'New Road', 'Mahendrapul', 'Birauta',
  'Chipledhunga', 'Bindyabasini', 'Ram Bazaar', 'Parsyang', 'Hemja'
] as const;

export const SKILL_LEVELS = [
  { 
    value: 'BEGINNER', 
    label: 'Beginner', 
    icon: '🌱', 
    color: NEPAL_COLORS.success,
    description: 'Just starting out',
    nepaliName: 'शुरुवाती'
  },
  { 
    value: 'INTERMEDIATE', 
    label: 'Intermediate', 
    icon: '⚡', 
    color: NEPAL_COLORS.warning,
    description: 'Getting better',
    nepaliName: 'मध्यम'
  },
  { 
    value: 'ADVANCED', 
    label: 'Advanced', 
    icon: '🏆', 
    color: NEPAL_COLORS.error,
    description: 'Experienced player',
    nepaliName: 'उच्च'
  }
] as const;

export const NEPAL_FESTIVALS = [
  'Dashain', 'Tihar', 'Holi', 'Buddha Jayanti', 'Teej', 'Indra Jatra',
  'Gai Jatra', 'Janai Purnima', 'Shivaratri', 'Bisket Jatra'
] as const;

export const TRADITIONAL_PATTERNS = {
  mandala: 'repeating-conic-gradient(from 0deg, #DC143C 0deg 60deg, transparent 60deg 120deg)',
  prayer: 'linear-gradient(45deg, #DC143C 25%, transparent 25%, transparent 75%, #DC143C 75%)',
  mountain: 'linear-gradient(135deg, #4a90e2 0%, #2d5016 50%, #FFD700 100%)'
} as const;

export const NEPALI_GREETINGS = [
  'नमस्ते! (Namaste!)',
  'सुभ प्रभात! (Good Morning!)',
  'सुभ दिन! (Good Day!)',
  'खुशी भयो! (Nice to meet you!)'
] as const;

export const TIME_SLOTS = [
  { value: 'EARLY_MORNING', label: 'Early Morning (5-8 AM)', nepali: 'बिहान सकाल' },
  { value: 'MORNING', label: 'Morning (8-11 AM)', nepali: 'बिहान' },
  { value: 'LATE_MORNING', label: 'Late Morning (11 AM-2 PM)', nepali: 'दिउसो' },
  { value: 'AFTERNOON', label: 'Afternoon (2-5 PM)', nepali: 'दिउसो' },
  { value: 'EVENING', label: 'Evening (5-8 PM)', nepali: 'बेलुका' },
  { value: 'NIGHT', label: 'Night (8-11 PM)', nepali: 'राति' }
] as const;

export const VENUE_AMENITIES = [
  { id: 'parking', name: 'Parking', icon: '🚗', nepali: 'पार्किङ' },
  { id: 'changing_room', name: 'Changing Room', icon: '👔', nepali: 'कपडा फेर्ने कोठा' },
  { id: 'shower', name: 'Shower', icon: '🚿', nepali: 'नुहाउने ठाउँ' },
  { id: 'refreshments', name: 'Refreshments', icon: '🥤', nepali: 'खाजा' },
  { id: 'equipment_rental', name: 'Equipment Rental', icon: '⚽', nepali: 'उपकरण भाडा' },
  { id: 'first_aid', name: 'First Aid', icon: '🏥', nepali: 'प्राथमिक उपचार' },
  { id: 'wifi', name: 'WiFi', icon: '📶', nepali: 'वाइफाइ' },
  { id: 'seating', name: 'Spectator Seating', icon: '🪑', nepali: 'बस्ने ठाउँ' }
] as const;

export const PAYMENT_METHODS = [
  { id: 'esewa', name: 'eSewa', icon: '💳', popular: true },
  { id: 'khalti', name: 'Khalti', icon: '📱', popular: true },
  { id: 'ime_pay', name: 'IME Pay', icon: '💰', popular: true },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', popular: false },
  { id: 'cash', name: 'Cash Payment', icon: '💵', popular: true }
] as const;
