# 🎯 Frontend Specification - Pickup Sports App

## 📱 **Application Overview**

**Pickup Sports App** is a location-based sports discovery and booking platform that automatically adapts to user location, providing country-specific features while maintaining global functionality.

### **🎯 Target Markets**
- **🇳🇵 Nepal (Primary)**: Futsal focus, eSewa/Khalti payments, City Champions
- **🌍 Global (Future)**: Multi-country expansion with localized experiences

### **📱 Platform Requirements**
- **Mobile-First Design**: Primary focus on mobile app
- **Responsive Web**: Secondary web interface
- **Cross-Platform**: React Native or Flutter recommended

---

## 🏗️ **Architecture & Navigation**

### **📱 App Structure**
```
┌─────────────────────────────────────────────────────────────┐
│                    Main Navigation                          │
├─────────────────────────────────────────────────────────────┤
│  🏠 Home          🎮 Games        🔍 Explore    👤 Profile │
├─────────────────────────────────────────────────────────────┤
│                    Feature Screens                          │
├─────────────────────────────────────────────────────────────┤
│  📍 Location     🏟️ Venues       💰 Payments   🏆 Hosts   │
│  🎯 Sports       📅 Schedule      💬 Chat       ⚙️ Settings│
└─────────────────────────────────────────────────────────────┘
```

### **🔄 Screen Flow**
```
Splash → Onboarding → Location Permission → Home
   ↓
Home → Games List → Game Details → RSVP/Payment
   ↓
Profile → Settings → Notifications → Preferences
```

---

## 🎮 **Core Features & Screens**

### **1. 🏠 Home Screen**
**Purpose**: Main dashboard showing nearby games and trending activities

**Components**:
- **Location Header**: Current city/country with location icon
- **Quick Actions**: Create Game, Find Games, My Games
- **Nearby Games**: Horizontal scroll of closest games
- **Trending Sports**: Popular sports in current area
- **Recent Activity**: User's recent game participation
- **Notifications**: Important updates and invites

**API Endpoints**:
```typescript
// Get nearby games
GET /api/v1/games/nearby?lat={lat}&lon={lon}&radius={km}

// Get trending games
GET /api/v1/games/trending?lat={lat}&lon={lon}

// Get user's recent games
GET /api/v1/users/{userId}/games/recent
```

**Design Requirements**:
- **Hero Section**: Large banner with current location and weather
- **Card Layout**: Game cards with sport icon, time, location, players
- **Pull to Refresh**: Update nearby games
- **Location Button**: Quick location change

---

### **2. 🎮 Games Discovery**
**Purpose**: Browse and search for available games

**Components**:
- **Search Bar**: Sport, location, time, skill level filters
- **Filter Panel**: Advanced filtering options
- **Map View**: Interactive map showing game locations
- **List View**: Scrollable list of games
- **Sort Options**: Distance, time, price, popularity

**API Endpoints**:
```typescript
// Search games with filters
GET /api/v1/games/search?{filters}

// Get games by sport
GET /api/v1/games/sport/{sportName}?lat={lat}&lon={lon}

// Get popular areas
GET /api/v1/nepal/futsal/popular-areas
```

**Design Requirements**:
- **Toggle Views**: Map/List view switch
- **Filter Chips**: Selected filters display
- **Game Cards**: Rich information with action buttons
- **Distance Indicators**: Show distance from user location

---

### **3. 🎯 Game Details**
**Purpose**: Comprehensive game information and RSVP

**Components**:
- **Game Header**: Sport, time, location, creator
- **Game Info**: Description, rules, equipment, pricing
- **Participants**: Current players and capacity
- **Map**: Game location with directions
- **RSVP Actions**: Join, Waitlist, Share, Report
- **Payment Integration**: Country-specific payment methods

**API Endpoints**:
```typescript
// Get game details
GET /api/v1/games/{gameId}

// RSVP to game
POST /api/v1/games/{gameId}/rsvp

// Get game participants
GET /api/v1/games/{gameId}/participants
```

**Design Requirements**:
- **Hero Image**: Sport-specific background
- **Info Tabs**: Details, Participants, Rules, Location
- **Action Buttons**: Prominent RSVP and payment buttons
- **Social Features**: Share, invite friends

---

### **4. ➕ Create Game**
**Purpose**: Create new games with location and preferences

**Components**:
- **Basic Info**: Sport, location, time, skill level
- **Advanced Options**: Capacity, pricing, rules, equipment
- **Location Picker**: Map-based location selection
- **Time Picker**: Date and time selection
- **Preview**: Game preview before creation
- **Country Detection**: Auto-suggest country-specific features

**API Endpoints**:
```typescript
// Create game
POST /api/v1/games?lat={lat}&lon={lon}

// Get sports list
GET /api/v1/nepal/sports/localized

// Get popular time slots
GET /api/v1/nepal/time-slots/popular
```

**Design Requirements**:
- **Step-by-Step Flow**: Multi-step form with progress indicator
- **Smart Suggestions**: Auto-fill based on location and preferences
- **Validation**: Real-time form validation
- **Preview Mode**: See how game will appear to others

---

### **5. 💰 Payment & Booking**
**Purpose**: Handle game payments with country-specific methods

**Components**:
- **Payment Methods**: Country-specific payment options
- **Amount Display**: Clear pricing breakdown
- **Payment Flow**: Secure payment processing
- **Confirmation**: Booking confirmation and details
- **Receipt**: Payment receipt and game details

**API Endpoints**:
```typescript
// Nepal Payments
POST /api/v1/nepal/payment/esewa/initiate
POST /api/v1/nepal/payment/khalti/initiate

// Payment verification
POST /api/v1/nepal/payment/esewa/verify
POST /api/v1/nepal/payment/khalti/verify
```

**Design Requirements**:
- **Payment Selection**: Clear payment method options
- **Security Indicators**: SSL, security badges
- **Progress Tracking**: Payment status updates
- **Error Handling**: Clear error messages and retry options

---

### **6. 🏆 City Champions (Hosts)**
**Purpose**: Discover and connect with local sports organizers

**Components**:
- **Host Discovery**: Find nearby City Champions
- **Host Profiles**: Detailed host information and ratings
- **Host Application**: Apply to become a City Champion
- **Host Dashboard**: Manage games and participants
- **Performance Tracking**: Host statistics and achievements

**API Endpoints**:
```typescript
// Find nearby hosts
GET /api/v1/nepal/hosts/nearby?lat={lat}&lon={lon}

// Get host profile
GET /api/v1/nepal/hosts/{hostId}/profile

// Apply as host
POST /api/v1/nepal/hosts/apply
```

**Design Requirements**:
- **Host Cards**: Rich host information with ratings
- **Application Form**: Multi-step host application
- **Performance Metrics**: Visual representation of host stats
- **Contact Options**: Direct communication with hosts

---

### **7. 👤 User Profile**
**Purpose**: User account management and preferences

**Components**:
- **Profile Info**: Personal details, sports preferences
- **Game History**: Past and upcoming games
- **Achievements**: Badges and milestones
- **Settings**: App preferences and notifications
- **Payment Methods**: Saved payment options

**API Endpoints**:
```typescript
// Get user profile
GET /api/v1/users/{userId}/profile

// Update profile
PUT /api/v1/users/{userId}/profile

// Get user games
GET /api/v1/users/{userId}/games
```

**Design Requirements**:
- **Profile Header**: Large profile picture and basic info
- **Stats Cards**: Games played, sports, achievements
- **Settings Panel**: Organized preference categories
- **Privacy Controls**: Data sharing and visibility options

---

### **8. 🔍 Explore & Search**
**Purpose**: Advanced game discovery and recommendations

**Components**:
- **Search Filters**: Sport, location, time, skill, price
- **Recommendations**: AI-powered game suggestions
- **Popular Areas**: Trending locations and venues
- **Sports Categories**: Browse by sport type
- **Saved Searches**: Store favorite search criteria

**API Endpoints**:
```typescript
// Advanced search
GET /api/v1/games/search?{advanced_filters}

// Get recommendations
GET /api/v1/ai/recommendations?userId={userId}

// Get popular areas
GET /api/v1/nepal/futsal/popular-areas
```

**Design Requirements**:
- **Advanced Filters**: Collapsible filter panel
- **Search History**: Recent searches and suggestions
- **Results Sorting**: Multiple sort options
- **Saved Searches**: Quick access to favorite searches

---

## 🎨 **Design System**

### **🎨 Color Palette**
```css
/* Primary Colors */
--primary-nepal: #DC143C;      /* Nepal Red */
--primary-global: #2563EB;     /* Global Blue */
--secondary: #10B981;          /* Success Green */

/* Neutral Colors */
--background: #FFFFFF;         /* White */
--surface: #F8FAFC;           /* Light Gray */
--text-primary: #1E293B;      /* Dark Text */
--text-secondary: #64748B;    /* Secondary Text */

/* Status Colors */
--success: #10B981;           /* Green */
--warning: #F59E0B;           /* Yellow */
--error: #EF4444;             /* Red */
--info: #3B82F6;              /* Blue */
```

### **🔤 Typography**
```css
/* Font Family */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-secondary: 'Poppins', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;          /* 12px */
--text-sm: 0.875rem;         /* 14px */
--text-base: 1rem;           /* 16px */
--text-lg: 1.125rem;         /* 18px */
--text-xl: 1.25rem;          /* 20px */
--text-2xl: 1.5rem;          /* 24px */
--text-3xl: 1.875rem;        /* 30px */
```

### **📱 Component Library**
```typescript
// Button Components
<PrimaryButton>Join Game</PrimaryButton>
<SecondaryButton>Share</SecondaryButton>
<IconButton icon="heart" />

// Card Components
<GameCard game={game} />
<HostCard host={host} />
<VenueCard venue={venue} />

// Form Components
<SearchInput placeholder="Find games..." />
<LocationPicker onLocationSelect={handleLocation} />
<TimePicker onTimeSelect={handleTime} />

// Navigation Components
<BottomNavigation />
<TabNavigation />
<BreadcrumbNavigation />
```

---

## 📱 **Mobile App Requirements**

### **📱 Platform Support**
- **iOS**: iOS 13.0+ (iPhone 6s and newer)
- **Android**: Android 8.0+ (API level 26+)
- **Responsive**: Support for various screen sizes

### **📱 Device Features**
- **GPS**: Location services for game discovery
- **Camera**: Profile pictures and game photos
- **Push Notifications**: Game updates and reminders
- **Biometric Auth**: Fingerprint/Face ID for payments
- **Offline Support**: Basic functionality without internet

### **📱 Performance Requirements**
- **App Launch**: < 3 seconds cold start
- **Screen Transitions**: < 300ms between screens
- **Image Loading**: Lazy loading with placeholders
- **Data Caching**: Offline-first approach
- **Battery Optimization**: Efficient location and network usage

---

## 🌐 **Web Interface Requirements**

### **💻 Browser Support**
- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

### **💻 Responsive Design**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+
- **Large Screens**: 1440px+

### **💻 Progressive Web App**
- **Service Worker**: Offline functionality
- **App Manifest**: Installable on devices
- **Push Notifications**: Browser notifications
- **Background Sync**: Data synchronization

---

## 🔌 **API Integration**

### **🌐 Base Configuration**
```typescript
// API Configuration
const API_CONFIG = {
  baseURL: 'https://api.pickupsports.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Authentication
const AUTH_CONFIG = {
  tokenKey: 'pickup_sports_token',
  refreshTokenKey: 'pickup_sports_refresh_token',
  autoRefresh: true
};
```

### **🔐 Authentication Flow**
```typescript
// Login Flow
1. User enters credentials
2. App sends login request
3. Server returns JWT token
4. App stores token securely
5. App includes token in subsequent requests

// Token Refresh
1. Token expires
2. App detects 401 response
3. App sends refresh token
4. Server returns new JWT
5. App updates stored token
```

### **📡 Real-time Features**
```typescript
// WebSocket Connections
const WEBSOCKET_CONFIG = {
  url: 'wss://api.pickupsports.com/ws',
  reconnectInterval: 5000,
  maxReconnectAttempts: 5
};

// Real-time Updates
- Game participant changes
- Payment confirmations
- Chat messages
- Push notifications
```

---

## 🧪 **Testing Requirements**

### **📱 Mobile Testing**
- **Device Testing**: Test on actual devices, not just simulators
- **Network Testing**: Test with poor network conditions
- **Location Testing**: Test GPS accuracy and location services
- **Payment Testing**: Test payment flows with test accounts

### **🌐 Web Testing**
- **Cross-browser Testing**: Test on all supported browsers
- **Responsive Testing**: Test on various screen sizes
- **Performance Testing**: Lighthouse scores and Core Web Vitals
- **Accessibility Testing**: WCAG 2.1 AA compliance

### **🔧 Integration Testing**
- **API Testing**: Test all API endpoints
- **Payment Testing**: Test payment gateway integration
- **Location Testing**: Test country detection and routing
- **Error Handling**: Test error scenarios and edge cases

---

## 📋 **Development Guidelines**

### **🏗️ Code Structure**
```typescript
// Recommended folder structure
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── services/           # API and business logic
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # App constants
├── assets/             # Images, fonts, etc.
└── styles/             # Global styles and themes
```

### **🎯 Best Practices**
- **TypeScript**: Use TypeScript for type safety
- **Component Composition**: Build complex UIs from simple components
- **State Management**: Use React Context or Redux for global state
- **Error Boundaries**: Implement error boundaries for graceful error handling
- **Loading States**: Show loading indicators for async operations
- **Error Handling**: Provide clear error messages and recovery options

### **📱 Mobile Best Practices**
- **Touch Targets**: Minimum 44x44 points for touch targets
- **Gestures**: Support common gestures (swipe, pinch, etc.)
- **Keyboard**: Handle keyboard appearance and input
- **Orientation**: Support both portrait and landscape modes
- **Accessibility**: Implement VoiceOver and TalkBack support

---

## 🚀 **Deployment & Release**

### **📱 Mobile App Stores**
- **iOS App Store**: Submit through App Store Connect
- **Google Play Store**: Submit through Google Play Console
- **Beta Testing**: Use TestFlight and Google Play Beta

### **🌐 Web Deployment**
- **Hosting**: AWS, Google Cloud, or similar
- **CDN**: Use CDN for static assets
- **SSL**: HTTPS required for all connections
- **Monitoring**: Implement error tracking and analytics

### **📊 Analytics & Monitoring**
- **User Analytics**: Track user behavior and engagement
- **Performance Monitoring**: Monitor app performance and crashes
- **Error Tracking**: Track and resolve errors quickly
- **A/B Testing**: Test different features and designs

---

## 📅 **Development Timeline**

### **Phase 1: Core Features (4-6 weeks)**
- ✅ User authentication and profiles
- ✅ Game discovery and browsing
- ✅ Basic game creation
- ✅ Location services integration

### **Phase 2: Nepal Features (3-4 weeks)**
- ✅ Nepal-specific UI and content
- ✅ Futsal game management
- ✅ eSewa/Khalti payment integration
- ✅ City Champions features

### **Phase 3: Advanced Features (3-4 weeks)**
- ✅ Real-time updates and chat
- ✅ Advanced search and filters
- ✅ Push notifications
- ✅ Offline functionality

### **Phase 4: Testing & Polish (2-3 weeks)**
- ✅ Comprehensive testing
- ✅ Performance optimization
- ✅ UI/UX polish
- ✅ App store preparation

---

## 🎯 **Success Metrics**

### **📱 User Engagement**
- **Daily Active Users**: Target 1000+ DAU within 3 months
- **Session Duration**: Average 15+ minutes per session
- **Retention Rate**: 40%+ day 7 retention
- **Game Participation**: 60%+ of users join games

### **🌍 Market Penetration**
- **Nepal Market**: 5000+ users in Kathmandu Valley
- **User Growth**: 20%+ month-over-month growth
- **Payment Conversion**: 80%+ payment success rate
- **Host Engagement**: 100+ active City Champions

### **📊 Technical Performance**
- **App Store Rating**: 4.5+ stars
- **Crash Rate**: < 1% crash rate
- **Load Times**: < 3 seconds for main screens
- **API Response**: < 500ms average response time

---

## 📞 **Support & Resources**

### **👥 Team Contacts**
- **Product Manager**: [Contact Information]
- **Backend Team**: [Contact Information]
- **Design Team**: [Contact Information]
- **QA Team**: [Contact Information]

### **📚 Documentation**
- **API Documentation**: [Link to API docs]
- **Design System**: [Link to design system]
- **Component Library**: [Link to component docs]
- **Testing Guide**: [Link to testing docs]

### **🛠️ Development Tools**
- **Design Tools**: Figma, Sketch, Adobe XD
- **Development**: React Native, Flutter, or native
- **Testing**: Jest, Detox, Appium
- **Analytics**: Firebase Analytics, Mixpanel
- **Monitoring**: Sentry, Crashlytics

---

## 🎉 **Conclusion**

This frontend specification provides a comprehensive guide for building a world-class pickup sports app that:

✅ **Launches in Nepal** with specialized futsal features  
✅ **Scales globally** with country-specific adaptations  
✅ **Provides excellent UX** across mobile and web platforms  
✅ **Integrates seamlessly** with the backend architecture  
✅ **Meets modern standards** for performance and accessibility  

**Your frontend team now has everything they need to build an amazing user experience!** 🚀

---

*For questions or clarifications, please contact the product team or refer to the backend API documentation.*
