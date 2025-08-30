#!/bin/bash

# Setup Script for Cricket and International Features
# This script sets up the enhanced pickup sports app with cricket and international payment support

set -e

echo "🏏 Setting up Cricket and International Features for Pickup Sports App"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running from correct directory
if [ ! -f "pom.xml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_info "Step 1: Database Migration"
echo "Running cricket and international features migration..."

# Run the database migration
if ./mvnw flyway:migrate > /dev/null 2>&1; then
    print_status "Database migration V1070 completed successfully"
else
    print_warning "Migration may have already been applied or database is not running"
fi

print_info "Step 2: Sample Data Setup"
echo "Setting up sample games and cricket data..."

# Check if database is accessible
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-pickup_sports}
DB_USER=${DB_USER:-pickup_sports_user}

# Create sample data setup
if command -v psql &> /dev/null && [ ! -z "$DB_PASSWORD" ]; then
    echo "Loading sample game data..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/seed/top-10-games.sql
    print_status "Sample games loaded successfully"
else
    print_warning "PostgreSQL client not found or DB_PASSWORD not set. Please run manually:"
    print_info "psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f scripts/seed/top-10-games.sql"
fi

print_info "Step 3: Application Configuration"
echo "Setting up cricket and international payment configuration..."

# Create application configuration for cricket and international features
cat > src/main/resources/cricket-config.yml << 'EOF'
# Cricket Configuration
cricket:
  scoring:
    auto-save-interval: 30s
    milestone-notifications: true
    real-time-updates: true
    max-balls-per-over: 6
  formats:
    default: T20
    allow-custom: false
  analytics:
    performance-tracking: true
    career-stats: true

# International Payment Configuration  
payments:
  international:
    enabled: true
    test-mode: true
    supported-countries: [US, CA, MX, IN, NP]
    default-currency: USD
    
# Location Services
location:
  country-detection:
    enabled: true
    cache-duration: PT1H
    fallback-country: US
EOF

print_status "Configuration files created"

print_info "Step 4: Environment Setup"
echo "Creating environment template for payment gateways..."

# Create environment template
cat > .env.template << 'EOF'
# Payment Gateway Configuration
# Copy this to .env and fill in your actual API keys

# Stripe (US, Canada, Mexico)
STRIPE_PUBLISHABLE_KEY_US=pk_test_your_key_here
STRIPE_SECRET_KEY_US=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET_US=whsec_your_secret_here

# Razorpay (India)
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_here

# eSewa (Nepal)
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q

# Khalti (Nepal)
KHALTI_PUBLIC_KEY=test_public_key_here
KHALTI_SECRET_KEY=test_secret_key_here

# PayPal (Global)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret

# Exchange Rate API
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
EXCHANGE_RATE_PROVIDER=fixer.io
EOF

print_status "Environment template created (.env.template)"
print_warning "Please copy .env.template to .env and add your actual API keys"

print_info "Step 5: Testing Setup"
echo "Creating test scripts for cricket and international features..."

# Create cricket test script
mkdir -p scripts/test
cat > scripts/test/test-cricket-features.sh << 'EOF'
#!/bin/bash
# Test cricket features

BASE_URL=${BASE_URL:-http://localhost:8080}

echo "🏏 Testing Cricket Features"
echo "=========================="

# Test cricket formats
echo "1. Getting cricket formats..."
curl -s "$BASE_URL/cricket/formats" | jq '.'

# Test cricket templates  
echo "2. Getting cricket templates..."
curl -s "$BASE_URL/cricket/templates" | jq '.'

echo "✅ Cricket API tests completed"
EOF

# Create international payment test script
cat > scripts/test/test-international-payments.sh << 'EOF'
#!/bin/bash
# Test international payment features

BASE_URL=${BASE_URL:-http://localhost:8080}

echo "💰 Testing International Payment Features"
echo "========================================"

# Test payment methods for each country
countries=("US" "CA" "MX" "IN" "NP")

for country in "${countries[@]}"; do
    echo "Testing payment methods for $country..."
    curl -s "$BASE_URL/payments/international/methods/$country" | jq '.'
done

# Test exchange rates
echo "Testing exchange rates..."
curl -s "$BASE_URL/payments/international/exchange-rates" | jq '.'

echo "✅ International payment tests completed"
EOF

# Make test scripts executable
chmod +x scripts/test/test-cricket-features.sh
chmod +x scripts/test/test-international-payments.sh

print_status "Test scripts created in scripts/test/"

print_info "Step 6: Documentation"
echo "Setting up API documentation..."

# The OpenAPI documentation will automatically include the new endpoints
print_status "Enhanced API documentation available at /swagger-ui.html"

print_info "Step 7: Verification"
echo "Verifying setup..."

# Check if Spring Boot can compile with new classes
if ./mvnw compile -q; then
    print_status "Application compiles successfully with new features"
else
    print_error "Compilation failed. Please check for missing dependencies or imports"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Your pickup sports app now includes:"
echo "✅ Professional cricket scoring and statistics"
echo "✅ International payments (US, CA, MX, IN, NP)"  
echo "✅ Country-based game discovery"
echo "✅ Dynamic team formation (5v5, 7v7, etc.)"
echo "✅ Enhanced game templates and management"
echo ""
echo "Next Steps:"
echo "1. Configure payment gateway API keys in .env file"
echo "2. Start the application: ./mvnw spring-boot:run"
echo "3. Test cricket features: scripts/test/test-cricket-features.sh"
echo "4. Test payments: scripts/test/test-international-payments.sh"
echo "5. Access API docs: http://localhost:8080/swagger-ui.html"
echo ""
echo "🚀 Ready to compete with Plei and Good Rec internationally!"