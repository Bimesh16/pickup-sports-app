# Integration Tests for Pickup Sports App

This directory contains comprehensive integration tests for the Pickup Sports App using Playwright and Lighthouse.

## Test Structure

```
e2e/
├── auth/                    # Authentication tests
│   └── login.spec.ts
├── dashboard/               # Dashboard functionality tests
│   ├── home.spec.ts
│   ├── games.spec.ts
│   ├── create-game.spec.ts
│   ├── profile.spec.ts
│   ├── notifications.spec.ts
│   └── settings.spec.ts
├── realtime/               # Real-time features tests
│   └── websocket.spec.ts
├── performance/            # Performance and Lighthouse tests
│   └── lighthouse.spec.ts
├── utils/                  # Test utilities and helpers
│   └── test-helpers.ts
├── data/                   # Test data and fixtures
│   └── test-data.ts
└── setup/                  # Test setup and configuration
    └── test-setup.ts
```

## Test Coverage

### 1. Authentication Flow
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Form validation
- ✅ Redirect to dashboard if already logged in
- ✅ Network error handling
- ✅ Login state persistence
- ✅ Logout functionality

### 2. Home Screen
- ✅ Hero banner with location and weather
- ✅ Quick actions navigation
- ✅ Nearby games display
- ✅ Trending sports display
- ✅ User XP and rank display
- ✅ Loading states
- ✅ Error handling
- ✅ Offline functionality
- ✅ Notifications preview
- ✅ Real-time connection status

### 3. Games Tab
- ✅ Search and filter functionality
- ✅ Location-based filtering
- ✅ Date and time filtering
- ✅ Skill level filtering
- ✅ Sorting options (distance, time, price, popularity)
- ✅ List and map view toggle
- ✅ Game joining functionality
- ✅ Infinite scroll pagination
- ✅ Loading states
- ✅ Empty state handling
- ✅ Game details display
- ✅ Map interactions

### 4. Create Game Form
- ✅ Multi-step form validation
- ✅ Required field validation
- ✅ Date and time constraints
- ✅ Player count constraints
- ✅ Price constraints
- ✅ Form preview functionality
- ✅ Game creation success
- ✅ Error handling
- ✅ Loading states
- ✅ Form reset functionality

### 5. Profile Management
- ✅ Profile header display
- ✅ Bio editing
- ✅ Sport preferences management
- ✅ Availability grid updates
- ✅ Profile completion progress
- ✅ Privacy settings
- ✅ Activity timeline
- ✅ Stats charts
- ✅ Badges display
- ✅ Teams management
- ✅ Error handling
- ✅ Data persistence

### 6. Notifications
- ✅ Notifications list display
- ✅ Mark as read functionality
- ✅ Mark all as read functionality
- ✅ Filter by type and status
- ✅ Notification timestamps
- ✅ Click navigation
- ✅ Empty state
- ✅ Loading states
- ✅ Error handling
- ✅ Pagination
- ✅ Notification count display

### 7. Settings
- ✅ Notification preferences
- ✅ App settings (language, theme, push notifications)
- ✅ Privacy and data management
- ✅ Invite friends functionality
- ✅ Error handling
- ✅ Loading states
- ✅ Data persistence
- ✅ Quick actions navigation

### 8. Real-time Updates
- ✅ WebSocket connection
- ✅ Game updates in real-time
- ✅ Notification banners
- ✅ Chat messages
- ✅ Connection status indicators
- ✅ Reconnection logic
- ✅ Error handling
- ✅ Offline functionality
- ✅ Message queuing

### 9. Performance Tests
- ✅ Core Web Vitals (LCP, FID, CLS)
- ✅ First Contentful Paint < 2.5s
- ✅ Time to Interactive < 4s
- ✅ Lighthouse performance score
- ✅ Bundle size optimization
- ✅ Image loading efficiency
- ✅ Caching strategies
- ✅ Memory usage
- ✅ DOM efficiency

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:install
```

### Test Commands

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in headed mode
npm run test:headed

# Run specific test suites
npm run test:auth
npm run test:dashboard
npm run test:realtime
npm run test:performance

# Run tests on specific browsers
npm run test:mobile
npm run test:desktop
npm run test:all-browsers

# Run performance tests with slow 3G
npm run test:slow-3g

# Run tests for CI
npm run test:ci

# Generate test code
npm run test:codegen
```

### Lighthouse Audits

```bash
# Run Lighthouse audit
npm run lighthouse

# Run mobile Lighthouse audit
npm run lighthouse:mobile

# Run Lighthouse for CI
npm run lighthouse:ci
```

## Test Configuration

### Playwright Configuration
- **Timeout**: 60 seconds for complex integration tests
- **Retries**: 2 retries in CI, 0 in local development
- **Parallel**: Tests run in parallel for faster execution
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Network**: Slow 3G simulation for performance tests

### Test Data
- Mock API responses for all endpoints
- Realistic test data for users, games, venues, notifications
- WebSocket message simulation
- Performance metrics collection

### Performance Targets
- **First Contentful Paint**: < 2.5s (on 3G)
- **Time to Interactive**: < 4s
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Lighthouse Performance**: > 90
- **Bundle Size**: < 500KB

## Test Utilities

### TestHelpers Class
- Authentication helpers (login, logout)
- Navigation helpers
- Form helpers
- API mocking
- WebSocket simulation
- Performance measurement
- Screenshot capture
- Storage management

### Mock Data
- User profiles and authentication
- Games and venues
- Notifications and messages
- API responses
- WebSocket messages
- Performance metrics

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### Performance Testing
- Test on multiple devices and network conditions
- Measure Core Web Vitals
- Monitor bundle size and memory usage
- Test offline functionality

### Real-time Testing
- Mock WebSocket connections
- Simulate real-time events
- Test reconnection logic
- Verify UI updates

### Error Handling
- Test network failures
- Test API errors
- Test validation errors
- Test offline scenarios

## Continuous Integration

### GitHub Actions
```yaml
- name: Run Tests
  run: npm run test:ci

- name: Run Lighthouse
  run: npm run lighthouse:ci

- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: test-results/
```

### Test Reports
- HTML reports for detailed analysis
- JUnit reports for CI integration
- Screenshots on failure
- Video recordings for debugging
- Lighthouse reports for performance

## Debugging

### Debug Mode
```bash
# Run tests in debug mode
npm run test:debug

# Run specific test in debug mode
npx playwright test --debug e2e/auth/login.spec.ts
```

### Test Artifacts
- Screenshots on failure
- Video recordings
- Trace files
- Console logs
- Network logs

### Common Issues
- **Timeout errors**: Increase timeout in test configuration
- **Element not found**: Add proper wait conditions
- **API mocking**: Ensure mock responses match expected format
- **WebSocket issues**: Check connection state and message format

## Maintenance

### Regular Updates
- Update Playwright version
- Update test data
- Review and update test cases
- Monitor performance metrics

### Test Data Management
- Keep test data realistic
- Update mock responses
- Maintain data consistency
- Clean up test artifacts

### Performance Monitoring
- Track Core Web Vitals
- Monitor bundle size
- Check memory usage
- Review Lighthouse scores
