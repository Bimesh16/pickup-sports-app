# Pickup Sports App - Consolidated Frontend

A comprehensive React Native mobile application for discovering, organizing, and joining pickup sports games in Nepal. Built with modern technologies and designed with Nepal's cultural elements in mind.

## 🏆 Features

### Core Functionality
- **User Authentication** - Complete auth flow with secure token management
- **Game Discovery** - Search and filter games by sport, location, skill level
- **Game Creation** - Comprehensive game setup with location picking
- **Real-time Chat** - Communication between players
- **Payment Integration** - Secure payment handling for games
- **Profile Management** - User profiles with stats and achievements
- **Location Services** - Venue discovery and mapping
- **Multi-sport Support** - Football, Basketball, Cricket, Badminton, Tennis, Volleyball, Futsal

### Design Highlights
- **Nepal-inspired Design** - Uses Nepal flag colors (Blue #003893, Crimson #DC143C, White)
- **Modern UI/UX** - Clean, intuitive interface designed for the newer generation
- **Inter Font Family** - Modern typography for excellent readability
- **Responsive Design** - Optimized for various screen sizes

## 🛠 Tech Stack

### Frontend Framework
- **React Native** with Expo SDK 49
- **TypeScript** for type safety
- **React Navigation 6** for navigation

### State Management
- **Zustand** for lightweight state management
- **Expo SecureStore** for secure token storage

### UI Components
- **React Native Paper** for Material Design components
- **Expo Vector Icons** for consistent iconography
- **React Native Maps** for location features

### Development Tools
- **Babel** with module resolver for clean imports
- **ESLint & TypeScript** for code quality
- **Metro** bundler for React Native

## 📱 App Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common UI components
│   ├── create/         # Game creation components
│   ├── explore/        # Game discovery components
│   ├── games/          # Game-related components
│   ├── home/           # Home screen components
│   ├── messages/       # Chat/messaging components
│   └── profile/        # Profile components
├── contexts/           # React contexts
├── navigation/         # Navigation configuration
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── games/         # Game-related screens
│   ├── main/          # Main app screens
│   ├── payment/       # Payment screens
│   ├── settings/      # Settings screens
│   └── venues/        # Venue screens
├── services/          # API services and utilities
├── stores/            # Zustand stores
├── styles/            # Global styles and themes
└── types/             # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. **Clone and Install**
   ```bash
   cd frontend-consolidated
   npm install
   ```

2. **Environment Setup**
   Create `.env` file:
   ```
   EXPO_PUBLIC_API_URL=http://your-backend-url:8080/api
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Simulator**
   ```bash
   npm run android    # For Android
   npm run ios        # For iOS
   npm run web        # For web browser
   ```

## 🎨 Design System

### Color Palette
- **Primary**: #003893 (Nepal Blue)
- **Secondary**: #DC143C (Nepal Crimson) 
- **Background**: #FFFFFF (Nepal White)
- **Accent**: #4A90E2 (Light Blue)
- **Success**: #4CAF50
- **Warning**: #FF9800
- **Error**: #F44336

### Typography
- **Font Family**: Inter (Regular, Medium, SemiBold, Bold)
- **Scales**: 12px to 36px with consistent line heights
- **Usage**: Optimized for mobile readability

### Components
- **Cards**: Elevated surfaces with subtle shadows
- **Buttons**: Rounded corners with proper touch targets
- **Inputs**: Clean borders with focus states
- **Icons**: Consistent Ionicons throughout

## 🔧 API Integration

The app integrates with a comprehensive backend API:

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/verify` - Token verification
- `POST /auth/forgot-password` - Password reset

### Game Management
- `GET /games` - List games with filters
- `POST /games` - Create new game
- `GET /games/:id` - Get game details
- `POST /games/:id/join` - Join game
- `POST /games/:id/leave` - Leave game

### User & Profile
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `GET /users/stats` - User statistics

### Location & Venues
- `GET /venues` - List venues
- `GET /venues/:id` - Venue details

### Payments
- `POST /payments/create` - Create payment
- `POST /payments/:id/verify` - Verify payment

### Messaging
- `GET /messages/conversations` - List conversations
- `GET /messages/conversations/:id` - Get messages
- `POST /messages/send` - Send message

## 📊 Key Components

### Authentication Flow
- Welcome screen with Nepal-themed design
- Login/Register with form validation
- Secure token storage and management
- Password reset functionality

### Game Discovery
- Advanced filtering by sport, location, skill level
- Real-time game updates
- Interactive game cards with key information
- Join/leave game functionality

### Game Creation
- Step-by-step game setup
- Location picker with map integration
- Equipment and rules specification
- Skill level matching

### User Profile
- Stats tracking and achievements
- Game history and ratings
- Profile customization
- Social features

## 🏃‍♂️ Development Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator  
npm run web        # Run in web browser
npm run build      # Build for production
npm run test       # Run tests
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

## 🚀 Deployment

### Development Build
```bash
expo build:android --type apk
expo build:ios --type archive
```

### Production Build
```bash
expo build:android --type app-bundle
expo build:ios --type archive --release-channel production
```

## 🔄 State Management

The app uses Zustand for lightweight state management:

- **AuthStore** - User authentication state
- **GameStore** - Game data and filters  
- **LocationStore** - Location and venue data
- **ChatStore** - Messaging state

## 🎯 Next Steps

### Immediate Priorities
1. **Complete remaining screens** (Messages, Profile details, Settings)
2. **Add map integration** for venue selection
3. **Implement real-time chat** with WebSocket
4. **Add push notifications** for game updates
5. **Payment gateway integration** (eSewa, Khalti)

### Future Enhancements
1. **Offline support** with local data caching
2. **Social features** (friends, teams)
3. **Achievement system** gamification
4. **Advanced analytics** and insights
5. **Multi-language support** (Nepali)

## 📄 License

This project is part of the Pickup Sports App ecosystem for Nepal.

---

**Built with ❤️ for the sports community in Nepal** 🇳🇵