#!/bin/bash

# Test runner script for Pickup Sports App
# Usage: ./scripts/run-tests.sh [test-type] [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="all"
HEADLESS="true"
BROWSER="chromium"
REPORT="html"
VERBOSE="false"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -t|--type)
      TEST_TYPE="$2"
      shift 2
      ;;
    -h|--headless)
      HEADLESS="$2"
      shift 2
      ;;
    -b|--browser)
      BROWSER="$2"
      shift 2
      ;;
    -r|--report)
      REPORT="$2"
      shift 2
      ;;
    -v|--verbose)
      VERBOSE="true"
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  -t, --type      Test type: all, auth, dashboard, realtime, performance, mobile, desktop"
      echo "  -h, --headless  Run in headless mode: true, false"
      echo "  -b, --browser   Browser: chromium, firefox, webkit, mobile-chrome, mobile-safari"
      echo "  -r, --report    Report format: html, json, junit"
      echo "  -v, --verbose   Verbose output"
      echo "  --help          Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    if [ ! -d "node_modules" ]; then
        npm ci
    else
        print_warning "Dependencies already installed"
    fi
}

# Function to install Playwright browsers
install_playwright() {
    print_status "Installing Playwright browsers..."
    npx playwright install --with-deps
}

# Function to build application
build_app() {
    print_status "Building application..."
    npm run build
}

# Function to start application
start_app() {
    print_status "Starting application..."
    npm run preview -- --port 5174 &
    APP_PID=$!
    
    # Wait for application to start
    print_status "Waiting for application to start..."
    npx wait-on http://localhost:5174 --timeout 30000
    
    if [ $? -eq 0 ]; then
        print_success "Application started successfully"
    else
        print_error "Failed to start application"
        exit 1
    fi
}

# Function to stop application
stop_app() {
    if [ ! -z "$APP_PID" ]; then
        print_status "Stopping application..."
        kill $APP_PID 2>/dev/null || true
        wait $APP_PID 2>/dev/null || true
    fi
}

# Function to run tests
run_tests() {
    local test_type=$1
    local browser=$2
    local headless=$3
    local report=$4
    local verbose=$5
    
    print_status "Running $test_type tests on $browser..."
    
    # Build command
    local cmd="npx playwright test"
    
    # Add browser project
    case $browser in
        "chromium"|"firefox"|"webkit")
            cmd="$cmd --project=$browser"
            ;;
        "mobile-chrome"|"mobile-safari")
            cmd="$cmd --project=$browser"
            ;;
        "all")
            cmd="$cmd --project=chromium --project=firefox --project=webkit"
            ;;
    esac
    
    # Add headless mode
    if [ "$headless" = "true" ]; then
        cmd="$cmd --headed=false"
    else
        cmd="$cmd --headed"
    fi
    
    # Add report format
    case $report in
        "html")
            cmd="$cmd --reporter=html"
            ;;
        "json")
            cmd="$cmd --reporter=json"
            ;;
        "junit")
            cmd="$cmd --reporter=junit"
            ;;
        "all")
            cmd="$cmd --reporter=html --reporter=json --reporter=junit"
            ;;
    esac
    
    # Add verbose output
    if [ "$verbose" = "true" ]; then
        cmd="$cmd --verbose"
    fi
    
    # Add test type filter
    case $test_type in
        "auth")
            cmd="$cmd e2e/auth/"
            ;;
        "dashboard")
            cmd="$cmd e2e/dashboard/"
            ;;
        "realtime")
            cmd="$cmd e2e/realtime/"
            ;;
        "performance")
            cmd="$cmd e2e/performance/"
            ;;
        "mobile")
            cmd="$cmd --project=mobile-chrome --project=mobile-safari"
            ;;
        "desktop")
            cmd="$cmd --project=chromium --project=firefox --project=webkit"
            ;;
        "all")
            # Run all tests
            ;;
    esac
    
    # Set environment variables
    export E2E_BASE_URL="http://localhost:5174"
    
    # Run tests
    eval $cmd
    
    if [ $? -eq 0 ]; then
        print_success "Tests completed successfully"
    else
        print_error "Tests failed"
        return 1
    fi
}

# Function to run Lighthouse audit
run_lighthouse() {
    print_status "Running Lighthouse audit..."
    
    # Run desktop Lighthouse
    npx lighthouse http://localhost:5174 --output=html --output-path=./lighthouse-report.html --chrome-flags='--headless'
    
    if [ $? -eq 0 ]; then
        print_success "Desktop Lighthouse audit completed"
    else
        print_error "Desktop Lighthouse audit failed"
    fi
    
    # Run mobile Lighthouse
    npx lighthouse http://localhost:5174 --output=html --output-path=./lighthouse-mobile-report.html --form-factor=mobile --throttling-method=devtools --chrome-flags='--headless'
    
    if [ $? -eq 0 ]; then
        print_success "Mobile Lighthouse audit completed"
    else
        print_error "Mobile Lighthouse audit failed"
    fi
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    stop_app
    # Clean up any remaining processes
    pkill -f "npm run preview" 2>/dev/null || true
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Main execution
main() {
    print_status "Starting test execution..."
    print_status "Test Type: $TEST_TYPE"
    print_status "Browser: $BROWSER"
    print_status "Headless: $HEADLESS"
    print_status "Report: $REPORT"
    print_status "Verbose: $VERBOSE"
    
    # Check if Node.js is installed
    if ! command_exists node; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Install dependencies
    install_dependencies
    
    # Install Playwright
    install_playwright
    
    # Build application
    build_app
    
    # Start application
    start_app
    
    # Run tests
    run_tests "$TEST_TYPE" "$BROWSER" "$HEADLESS" "$REPORT" "$VERBOSE"
    
    # Run Lighthouse if performance tests
    if [ "$TEST_TYPE" = "performance" ] || [ "$TEST_TYPE" = "all" ]; then
        run_lighthouse
    fi
    
    print_success "All tests completed successfully!"
}

# Run main function
main "$@"
