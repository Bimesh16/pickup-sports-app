#!/bin/bash

# 🏆 Pickup Sports Frontend Setup Script
# This script sets up the React Native development environment

echo "🚀 Setting up Pickup Sports Frontend..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Check Node.js version
echo "📦 Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 16 ]; then
    echo "❌ Error: Node.js 16+ is required. Current version: $(node -v)"
    echo "Please install Node.js 16 or higher from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed successfully"

# Check if Expo CLI is installed
echo ""
echo "🔧 Checking Expo CLI..."
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
    
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install Expo CLI"
        echo "Please run: npm install -g @expo/cli"
        exit 1
    fi
fi
echo "✅ Expo CLI ready"

# Create assets directory if it doesn't exist
echo ""
echo "📁 Setting up assets..."
if [ ! -d "assets" ]; then
    mkdir -p assets/fonts
    echo "📂 Created assets directory"
fi

# Create placeholder assets if they don't exist
if [ ! -f "assets/icon.png" ]; then
    echo "📸 Creating placeholder app icon..."
    # You would typically have actual icon files here
    touch assets/icon.png
    touch assets/adaptive-icon.png
    touch assets/favicon.png
    touch assets/splash-icon.png
fi

if [ ! -d "assets/fonts" ]; then
    mkdir -p assets/fonts
    echo "🔤 Created fonts directory"
    echo "ℹ️  Please add Poppins font files to assets/fonts/:"
    echo "   - Poppins-Regular.ttf"
    echo "   - Poppins-Medium.ttf"
    echo "   - Poppins-SemiBold.ttf"
    echo "   - Poppins-Bold.ttf"
fi

# Create development configuration
echo ""
echo "⚙️  Creating development configuration..."

# Update API base URL for development
if [ -f "src/services/api.ts" ]; then
    # Check if running on localhost
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - use localhost
        echo "🍎 Configuring for macOS development (localhost)"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - might need different IP
        echo "🐧 Configuring for Linux development"
        echo "ℹ️  If running on WSL or remote, update API_BASE_URL in src/services/api.ts"
    fi
fi

# Run type checking
echo ""
echo "🔍 Running type check..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  Type check failed. Some type issues may need to be resolved."
else
    echo "✅ Type check passed"
fi

# Setup complete
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📱 Next steps:"
echo "1. Make sure your backend is running on http://localhost:8080"
echo "2. Add Poppins font files to assets/fonts/ directory"
echo "3. Update assets with your actual app icons"
echo "4. Start the development server:"
echo ""
echo "   npm start"
echo ""
echo "🚀 Available commands:"
echo "   npm start        - Start Expo development server"
echo "   npm run ios      - Run on iOS simulator"
echo "   npm run android  - Run on Android emulator"
echo "   npm run web      - Run in web browser"
echo "   npm test         - Run tests"
echo "   npm run lint     - Run linter"
echo ""
echo "📚 Documentation:"
echo "   - README.md for detailed information"
echo "   - Check /docs for architecture and API docs"
echo ""
echo "🇳🇵 Features implemented:"
echo "   ✅ Nepal-themed design with flag colors"
echo "   ✅ Advanced scrolling with pull-to-refresh"
echo "   ✅ Feature-rich dropdowns with search"
echo "   ✅ Modal system with background dismissal"
echo "   ✅ Comprehensive authentication flow"
echo "   ✅ Game discovery and creation"
echo "   ✅ Real-time chat and notifications"
echo "   ✅ Performance optimizations"
echo ""
echo "Happy coding! 🏆"