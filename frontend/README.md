# 🏆 Pickup Sports App - Frontend

A next-level React Native frontend for the Pickup Sports app, featuring advanced animations, Nepal-themed design, and robust architecture.

## ✨ Key Features

### 🎯 **Advanced User Experience**
- **Consistent Scrolling**: Custom `ScrollContainer` with pull-to-refresh, animations, and performance optimizations
- **Advanced Dropdowns**: Feature-rich dropdowns with search, multi-select, blur effects, and smooth animations
- **Modal System**: Comprehensive modal system with background dismissal, multiple animation types, and gesture handling
- **Nepal-Themed Design**: Beautiful UI using Nepal flag colors (blue, crimson, white) with modern Poppins font

### 📱 **Core Functionality**
- **Authentication**: Complete auth flow with JWT tokens, secure storage, and biometric support
- **Game Discovery**: Location-based game finding with AI recommendations and advanced filters
- **Real-time Chat**: WebSocket-powered messaging system with notifications
- **Payment Integration**: Nepal-specific payments (eSewa, Khalti) with global fallbacks
- **Profile Management**: Comprehensive user profiles with stats, achievements, and preferences

### 🏗️ **Advanced Architecture**
- **TypeScript**: Full type safety with comprehensive type definitions
- **Zustand**: Optimized state management with persistence and selectors
- **React Query**: Advanced server state management with caching and optimistic updates
- **React Navigation**: Smooth navigation with custom transitions and deep linking
- **Performance**: Lazy loading, code splitting, memory optimization, and efficient rendering

## 🚀 Quick Start

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start

# Run on specific platforms
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Web browser
```

## 📁 Project Structure

```
frontend/
├── App.tsx                    # Main app component
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── common/           # Common components (ScrollContainer, Modal, Dropdown)
│   │   ├── games/            # Game-related components
│   │   ├── home/             # Home screen components
│   │   ├── messages/         # Chat and notification components
│   │   └── profile/          # Profile components
│   ├── navigation/           # Navigation configuration
│   │   ├── RootNavigator.tsx # Main navigation setup
│   │   ├── AuthNavigator.tsx # Authentication flow
│   │   └── MainNavigator.tsx # Main app navigation
│   ├── screens/              # Screen components
│   │   ├── auth/             # Authentication screens
│   │   ├── main/             # Main app screens
│   │   └── LoadingScreen.tsx # Global loading screen
│   ├── services/             # API and business logic
│   │   ├── api.ts            # API client with interceptors
│   │   └── appInitializer.ts # App startup configuration
│   ├── stores/               # Zustand state management
│   │   ├── authStore.ts      # Authentication state
│   │   ├── gameStore.ts      # Game management state
│   │   └── locationStore.ts  # Location services state
│   ├── styles/               # Design system and themes
│   │   └── theme.ts          # Nepal-themed design tokens
│   └── types/                # TypeScript definitions
│       └── index.ts          # All type definitions
├── assets/                   # Images, fonts, and static assets
├── package.json              # Dependencies and scripts
└── expo.json                 # Expo configuration
```

## 🎨 Design System

### **Nepal Flag Colors**
- **Primary Blue**: `#003893` - Navigation, secondary actions
- **Primary Crimson**: `#DC143C` - Primary actions, highlights
- **Primary White**: `#FFFFFF` - Text on colored backgrounds
- **Futsal Green**: `#16A085` - Nepal's favorite sport highlight

### **Typography**
- **Font Family**: Poppins (modern, catchy font for younger generation)
- **Font Weights**: Regular (400), Medium (500), SemiBold (600), Bold (700)
- **Responsive Sizing**: From 10px to 36px with proper line heights

### **Components**
- **Consistent Spacing**: 8px base unit with small (8px), medium (16px), large (24px), xl (32px)
- **Border Radius**: Small (8px), medium (12px), large (16px), xl (24px)
- **Shadows**: Three levels with proper elevation and color

## 📡 API Integration

### **Base Configuration**
```typescript
const API_BASE_URL = 'http://localhost:8080/api/v1';
const WS_BASE_URL = 'ws://localhost:8080/ws';
```

### **Supported Endpoints**
- **Authentication**: `/auth/*` - Login, register, token refresh
- **Games**: `/games/*` - CRUD operations, search, nearby games
- **Nepal Features**: `/nepal/*` - Futsal games, local payments, City Champions
- **Venues**: `/venues/*` - Venue search and booking
- **AI Recommendations**: `/ai/*` - Personalized game suggestions
- **User Management**: `/users/*` - Profile management and stats

### **Advanced Features**
- **Token Refresh**: Automatic JWT refresh with retry logic
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Offline Support**: Basic offline functionality with data persistence
- **WebSocket**: Real-time updates for chat and notifications

## 🔧 Key Components

### **ScrollContainer**
```typescript
<ScrollContainer
  refreshing={isLoading}
  onRefresh={handleRefresh}
  contentContainerStyle={styles.content}
>
  {/* Your content */}
</ScrollContainer>
```

### **AdvancedDropdown**
```typescript
<AdvancedDropdown
  options={SPORT_OPTIONS}
  value={selectedSport}
  onSelect={handleSportSelect}
  placeholder="Select sport"
  searchable={true}
  multiple={false}
/>
```

### **AdvancedModal**
```typescript
const { showModal, showConfirmDialog } = useModal();

showModal(
  <YourModalContent />,
  {
    title: 'Modal Title',
    dismissible: true,
    animationType: 'slide',
    position: 'center',
  }
);
```

## 🔐 Security Features

- **Secure Token Storage**: JWT tokens stored in Expo SecureStore
- **Biometric Authentication**: Fingerprint/Face ID support for payments
- **Input Validation**: Client-side validation with security best practices
- **API Security**: Request signing and HTTPS-only communication

## 📊 Performance Optimizations

- **Lazy Loading**: Components and screens loaded on demand
- **Image Optimization**: Proper image caching and compression
- **Memory Management**: Efficient list rendering with `getItemLayout`
- **Bundle Optimization**: Code splitting and tree shaking
- **Animation Performance**: Hardware-accelerated animations with Reanimated

## 🇳🇵 Nepal-Specific Features

- **Futsal Focus**: Specialized futsal game discovery and management
- **Local Payments**: eSewa and Khalti integration with proper verification
- **City Champions**: Local host discovery and application system
- **Cultural Adaptation**: Nepal flag colors, local sports preferences
- **Localized Content**: Nepal-specific time slots, venues, and pricing

## 🧪 Testing Strategy

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📱 Platform Support

- **iOS**: iOS 13.0+ (iPhone 6s and newer)
- **Android**: Android 8.0+ (API level 26+)
- **Web**: Modern browsers with PWA support

## 🔮 Advanced Features Implemented

1. **✅ Consistent Scrolling**: Advanced ScrollContainer with animations and pull-to-refresh
2. **✅ Advanced Dropdowns**: Feature-rich dropdowns with search, multi-select, and animations
3. **✅ Modal System**: Comprehensive modal system with background dismissal and multiple animation types
4. **✅ Nepal Theme**: Beautiful design using Nepal flag colors with modern typography
5. **✅ Performance**: Optimized rendering, animations, and memory management
6. **✅ Scalability**: Modular architecture with proper separation of concerns
7. **✅ Type Safety**: Comprehensive TypeScript implementation
8. **✅ Error Handling**: Robust error boundaries and user feedback

## 🎯 Next Steps

1. **Backend Integration**: Connect to your Spring Boot backend
2. **Testing**: Add comprehensive unit and integration tests
3. **Performance**: Monitor and optimize using React Native performance tools
4. **Store Deployment**: Prepare for iOS App Store and Google Play Store
5. **Analytics**: Add user analytics and crash reporting

## 📞 Support

For questions or issues, refer to:
- **Backend API**: [Backend Documentation](../docs/)
- **React Native**: [Official Documentation](https://reactnative.dev/)
- **Expo**: [Expo Documentation](https://docs.expo.dev/)

---

**Your next-level frontend is ready! 🚀**