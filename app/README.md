# 🏟️ Pickup Sports Nepal - Mobile App

A comprehensive React Native/Expo mobile application for discovering and joining pickup sports games in Nepal, with a special focus on futsal.

## 🇳🇵 Features

### Core Features
- **🔐 Authentication**: JWT-based auth with email verification and password reset
- **🎮 Game Discovery**: Find and join futsal and sports games near you
- **📍 Location-based Search**: GPS-powered game discovery
- **💰 Nepal Payments**: Integrated eSewa and Khalti payment gateways
- **💬 Real-time Chat**: WebSocket-powered game communication
- **🏆 User Profiles**: Skill levels, ratings, and game history
- **🏟️ Venue Management**: Browse and book sports venues

### Nepal-Specific Features
- **🇳🇵 Bilingual Support**: English and Nepali (Devanagari) text
- **💳 Local Payments**: eSewa and Khalti integration
- **🏟️ Futsal Focus**: Primary focus on futsal games (popular in Nepal)
- **📍 Kathmandu Areas**: Popular areas like Thamel, Lazimpat, New Baneshwor
- **🎨 Nepal Theme**: Flag colors (Crimson, Blue, White) throughout the UI

## 🏗️ Architecture

### Frontend Stack
- **React Native**: Cross-platform mobile development
- **Expo**: Development and deployment platform
- **TypeScript**: Type-safe development
- **Zustand**: Lightweight state management
- **React Navigation**: Navigation and routing
- **Axios**: HTTP client with interceptors
- **Socket.IO**: Real-time communication
- **Expo Location**: GPS and location services

### Backend Integration
- **REST API**: Full integration with Spring Boot backend
- **WebSocket**: Real-time chat and notifications
- **JWT Authentication**: Secure token-based auth
- **File Upload**: Profile pictures and game images

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g @expo/cli`
- Backend running on `http://localhost:8080`

### Installation

1. **Install dependencies:**
   ```bash
   cd app
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on device/simulator:**
   ```bash
   # iOS Simulator
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web Browser
   npm run web
   ```

### Demo Accounts
The app includes demo accounts for testing:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `demo` | `demo123` | User | Basic user account |
| `test` | `test123` | Player | Regular player |
| `admin` | `admin123` | Admin | Admin privileges |
| `user` | `user123` | User | Another test user |

## 📱 App Structure

```
app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── games/          # Game-related components
│   │   ├── home/           # Home screen components
│   │   └── common/         # Common UI components
│   ├── screens/            # Screen components
│   │   ├── auth/           # Authentication screens
│   │   ├── main/           # Main app screens
│   │   ├── games/          # Game management screens
│   │   └── profile/        # User profile screens
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API and external services
│   ├── stores/             # State management (Zustand)
│   ├── types/              # TypeScript type definitions
│   ├── constants/          # App constants and config
│   └── utils/              # Utility functions
├── assets/                 # Static assets (images, fonts)
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
└── package.json           # Dependencies and scripts
```

## 🎨 Design System

### Nepal Theme Colors
```typescript
colors = {
  primary: '#DC143C',      // Nepal Crimson Red
  secondary: '#003893',    // Nepal Blue
  accent: '#FFFFFF',       // Pure White
}
```

### Typography
- **Primary Font**: Inter (modern and readable)
- **Secondary Font**: Poppins (for headers)
- **Sizes**: Responsive scaling from 12px to 48px

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Primary (crimson), secondary (blue), and accent styles
- **Forms**: Clean inputs with validation
- **Navigation**: Bottom tabs with Nepali labels

## 🔌 Backend Integration

### API Services
- **AuthService**: User authentication and management
- **GameService**: Game CRUD operations and discovery
- **VenueService**: Venue browsing and booking
- **PaymentService**: Nepal payment gateway integration
- **ChatService**: Real-time messaging

### State Management
- **AuthStore**: User authentication state
- **GameStore**: Game data and operations
- **VenueStore**: Venue data and bookings

## 🌍 Internationalization

The app supports bilingual content:

```typescript
// English
title: "Welcome to Pickup Sports!"

// Nepali (Devanagari)
titleNepali: "पिकअप खेलकुदमा स्वागत छ!"
```

## 💳 Payment Integration

### Supported Providers
- **eSewa**: Nepal's leading digital wallet
- **Khalti**: Popular mobile payment solution

### Payment Flow
1. User selects game to join
2. Chooses payment provider (eSewa/Khalti)
3. Redirected to payment gateway
4. Payment verification and confirmation
5. Game participation confirmed

## 📱 Key Screens

### Authentication Flow
- **WelcomeScreen**: App introduction with Nepal theme
- **LoginScreen**: User login with demo accounts
- **RegisterScreen**: User registration with validation
- **ForgotPasswordScreen**: Password reset flow

### Main App
- **HomeScreen**: Dashboard with nearby games and quick actions
- **ExploreScreen**: Game discovery and search
- **GamesScreen**: User's games and history
- **ProfileScreen**: User profile and settings

### Game Management
- **GameDetailsScreen**: Game information and joining
- **CreateGameScreen**: Create new games
- **ChatScreen**: Real-time game communication
- **PaymentScreen**: Payment processing

## 🔧 Configuration

### API Configuration
```typescript
// Development
BASE_URL: 'http://localhost:8080'

// Production
BASE_URL: 'https://api.pickupsports.com.np'
```

### Feature Flags
```typescript
FEATURES: {
  ENABLE_LOCATION: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_CHAT: true,
  ENABLE_PAYMENTS: true,
  ENABLE_AI_RECOMMENDATIONS: true,
}
```

## 🚀 Deployment

### Build for Production
```bash
# Create production build
expo build:android
expo build:ios

# Or with EAS Build (recommended)
eas build --platform android
eas build --platform ios
```

### Environment Setup
Create `.env` files for different environments:
- `.env.development`
- `.env.staging`
- `.env.production`

## 🧪 Testing

### Demo Flow
1. Open the app
2. Use demo account (`demo` / `demo123`)
3. Enable location services
4. Browse nearby futsal games
5. Join a game and test payment flow
6. Try chat functionality
7. Explore venue booking

### Key Test Scenarios
- User registration and email verification
- Game discovery with location services
- Payment processing with Nepal providers
- Real-time chat functionality
- Offline functionality and caching

## 🤝 Contributing

### Code Style
- TypeScript strict mode
- ESLint and Prettier formatting
- Consistent naming conventions
- Component-based architecture

### Branching Strategy
- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches

## 📞 Support

- **Email**: support@pickupsports.com.np
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check API documentation for backend integration

---

**Made with ❤️ for Nepal's sports community**

This app brings together Nepal's love for sports, especially futsal, with modern mobile technology and local payment solutions.