#!/bin/bash

# Pickup Sports Nepal - Setup Script
# This script sets up the React Native/Expo frontend application

echo "🏟️ Setting up Pickup Sports Nepal Mobile App..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ npm $(npm -v) detected"
echo ""

# Install Expo CLI globally if not present
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI globally..."
    npm install -g @expo/cli
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Expo CLI"
        exit 1
    fi
    echo "✅ Expo CLI installed successfully"
else
    echo "✅ Expo CLI $(expo --version) detected"
fi

echo ""

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if backend is running
echo "🔧 Checking backend connectivity..."
if curl -f -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:8080"
else
    echo "⚠️  Backend is not running on http://localhost:8080"
    echo "   Please start your Spring Boot backend first:"
    echo "   cd .. && ./mvnw spring-boot:run"
fi

echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
# Pickup Sports Nepal - Environment Configuration

# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws

# App Configuration  
EXPO_PUBLIC_APP_NAME=Pickup Sports Nepal
EXPO_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
EXPO_PUBLIC_ENABLE_LOCATION=true
EXPO_PUBLIC_ENABLE_NOTIFICATIONS=true
EXPO_PUBLIC_ENABLE_CHAT=true
EXPO_PUBLIC_ENABLE_PAYMENTS=true
EXPO_PUBLIC_ENABLE_AI_RECOMMENDATIONS=true
EOL
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""

# Display setup completion
echo "🎉 Setup completed successfully!"
echo ""
echo "📱 To start the development server:"
echo "   npm start"
echo ""
echo "🔧 To run on specific platforms:"
echo "   npm run ios      # iOS Simulator"
echo "   npm run android  # Android Emulator"  
echo "   npm run web      # Web Browser"
echo ""
echo "👤 Demo accounts for testing:"
echo "   Username: demo     Password: demo123"
echo "   Username: test     Password: test123"
echo "   Username: admin    Password: admin123"
echo "   Username: user     Password: user123"
echo ""
echo "🇳🇵 Made with ❤️ for Nepal's sports community"
echo ""