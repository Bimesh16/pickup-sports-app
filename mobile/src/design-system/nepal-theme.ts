// 🇳🇵 Nepal Cultural Design System
// Inspired by Nepal's flag, culture, and natural beauty

export const NepalColors = {
  // Primary colors from Nepal flag
  primary: '#DC143C',        // Nepal Crimson Red
  secondary: '#003893',      // Nepal Blue
  
  // Cultural accent colors
  himalayan_gold: '#FFD700',   // Gold from temples and stupas
  mountain_green: '#228B22',   // Evergreen forests
  prayer_flag_red: '#FF0000',  // Prayer flag colors
  prayer_flag_blue: '#0000FF',
  prayer_flag_yellow: '#FFFF00',
  prayer_flag_green: '#00FF00',
  prayer_flag_white: '#FFFFFF',
  
  // Natural colors inspired by Nepal
  temple_gold: '#B8860B',      // Temple ornaments
  mountain_blue: '#4682B4',    // Mountain sky
  rhododendron: '#FF1493',     // National flower
  yak_brown: '#8B4513',        // Traditional color
  snow_white: '#FFFAFA',       // Mountain peaks
  
  // Functional colors
  success: '#228B22',
  warning: '#FF8C00',
  error: '#DC143C',
  info: '#4682B4',
  
  // Neutral colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text_primary: '#1A1A1A',
  text_secondary: '#666666',
  text_muted: '#999999',
  border: '#E0E0E0',
  divider: '#F0F0F0',
} as const;

export const NepalGradients = {
  // Cultural gradients
  nepal_flag: ['#DC143C', '#003893'],
  himalayan_sunset: ['#FF6B35', '#F7931E', '#FFD700'],
  temple_gold: ['#FFD700', '#B8860B'],
  prayer_flags: ['#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FFFFFF'],
  mountain_mist: ['#87CEEB', '#B0C4DE', '#E6E6FA'],
  
  // Sport-specific gradients
  futsal_field: ['#32CD32', '#228B22'],
  cricket_pitch: ['#8FBC8F', '#556B2F'],
  basketball_court: ['#CD853F', '#8B4513'],
  volleyball_sand: ['#F4A460', '#DEB887'],
} as const;

export const NepalTypography = {
  // Font families
  primary: 'Noto Sans Devanagari', // Supports Nepali script
  secondary: 'Inter',              // Clean, modern
  cultural: 'Mukti',               // Traditional Nepali font
  monospace: 'JetBrains Mono',
  
  // Font sizes
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
    '5xl': 36,
    '6xl': 48,
  },
  
  // Font weights
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

export const NepalSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const NepalBorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const NepalShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  nepal_flag: {
    shadowColor: NepalColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
} as const;

// Cultural design elements
export const CulturalElements = {
  sports: {
    futsal: {
      icon: '⚽',
      emoji: '🥅',
      cultural_name: 'फुटसल',
      gradient: NepalGradients.futsal_field,
      celebration: 'prayer_flags_wave',
      background_pattern: 'mandala_soccer',
    },
    cricket: {
      icon: '🏏',
      emoji: '🏟️',
      cultural_name: 'क्रिकेट',
      gradient: NepalGradients.cricket_pitch,
      celebration: 'victory_drums',
      background_pattern: 'temple_arches',
    },
    basketball: {
      icon: '🏀',
      emoji: '🏀',
      cultural_name: 'बास्केटबल',
      gradient: NepalGradients.basketball_court,
      celebration: 'mountain_echo',
      background_pattern: 'geometric_traditional',
    },
    volleyball: {
      icon: '🏐',
      emoji: '🏐',
      cultural_name: 'भलिबल',
      gradient: NepalGradients.volleyball_sand,
      celebration: 'temple_bells',
      background_pattern: 'prayer_flags_vertical',
    },
    tennis: {
      icon: '🎾',
      emoji: '🎾',
      cultural_name: 'टेनिस',
      gradient: NepalGradients.temple_gold,
      celebration: 'golden_victory',
      background_pattern: 'lotus_pattern',
    },
  },
  
  patterns: {
    mandala: {
      type: 'circular',
      complexity: 'high',
      cultural_significance: 'meditation_focus',
    },
    prayer_wheel: {
      type: 'rotating',
      animation: 'continuous_spin',
      cultural_significance: 'spiritual_merit',
    },
    mountain_silhouette: {
      type: 'landscape',
      peaks: ['everest', 'annapurna', 'dhaulagiri'],
      cultural_significance: 'natural_beauty',
    },
    prayer_flags: {
      type: 'horizontal_vertical',
      colors: ['red', 'blue', 'yellow', 'green', 'white'],
      cultural_significance: 'spreading_goodwill',
    },
  },
  
  celebrations: {
    goal_scored: {
      animation: 'prayer_flags_wave',
      sound: 'temple_bell_chime',
      duration: 3000,
      colors: NepalGradients.prayer_flags,
    },
    game_won: {
      animation: 'mandala_burst',
      sound: 'victory_drums',
      duration: 5000,
      colors: NepalGradients.himalayan_sunset,
    },
    tournament_victory: {
      animation: 'mountain_peak_glow',
      sound: 'traditional_music',
      duration: 8000,
      colors: NepalGradients.temple_gold,
    },
  },
} as const;

// Responsive breakpoints
export const NepalBreakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Animation timings
export const NepalAnimations = {
  fast: 150,
  normal: 300,
  slow: 500,
  prayer_wheel: 2000,  // Slow, meditative rotation
  flag_wave: 1500,     // Gentle flag waving
} as const;

// Create the main theme object
export const NepalTheme = {
  colors: NepalColors,
  gradients: NepalGradients,
  typography: NepalTypography,
  spacing: NepalSpacing,
  borderRadius: NepalBorderRadius,
  shadows: NepalShadows,
  cultural: CulturalElements,
  breakpoints: NepalBreakpoints,
  animations: NepalAnimations,
} as const;

export type NepalThemeType = typeof NepalTheme;

// Helper functions for cultural features
export const getCulturalSportInfo = (sport: keyof typeof CulturalElements.sports) => {
  return CulturalElements.sports[sport];
};

export const getNepalText = (sport: keyof typeof CulturalElements.sports) => {
  return CulturalElements.sports[sport].cultural_name;
};

export const getSportGradient = (sport: keyof typeof CulturalElements.sports) => {
  return CulturalElements.sports[sport].gradient;
};

// Cultural holidays and festivals (for special themes)
export const NepalFestivals = {
  dashain: {
    name: 'दशैं',
    colors: ['#DC143C', '#FFD700'],
    duration: '15_days',
    special_features: ['flower_decorations', 'traditional_music'],
  },
  tihar: {
    name: 'तिहार',
    colors: ['#FFD700', '#FF6B35'],
    duration: '5_days',
    special_features: ['light_decorations', 'rangoli_patterns'],
  },
  holi: {
    name: 'होली',
    colors: ['#FF1493', '#00FF00', '#FFFF00', '#FF6347'],
    duration: '2_days',
    special_features: ['color_splash_effects', 'festive_music'],
  },
} as const;

export default NepalTheme;
