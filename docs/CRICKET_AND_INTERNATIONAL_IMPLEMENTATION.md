# Cricket & International Features Implementation Guide

## Overview

This document outlines the implementation plan for adding comprehensive cricket support and international payment processing across Nepal, US, Canada, Mexico, and India.

## Cricket Features Architecture

### Core Cricket Components

```
Cricket Management System
├── Match Management
│   ├── CricketMatch (match-level data)
│   ├── CricketInnings (innings tracking)
│   ├── TossManagement (toss and team decisions)
│   └── MatchStateMachine (status transitions)
├── Live Scoring
│   ├── BallByBallTracking (individual deliveries)
│   ├── PlayerPerformance (batting/bowling/fielding stats)
│   ├── RealTimeUpdates (WebSocket scoring updates)
│   └── MilestoneDetection (centuries, wickets, etc.)
├── Statistics & Analytics
│   ├── PlayerCricketStats (career statistics)
│   ├── MatchAnalytics (performance insights)
│   ├── TeamComparison (skill balancing)
│   └── PerformanceTracking (improvement over time)
└── Scorecard Generation
    ├── LiveScorecard (real-time display)
    ├── HistoricalScorecard (completed matches)
    ├── DetailedStatistics (comprehensive stats)
    └── MatchSummary (highlights and key moments)
```

### Cricket Game Templates

**Pre-configured Formats:**

1. **T20 Cricket** (Most Popular)
   - 20 overs per side, 11 players each
   - Duration: 3 hours  
   - Equipment: Full cricket gear
   - Rules: ICC T20 rules with powerplay

2. **Street Cricket** (Casual)
   - 6 players per side, flexible overs
   - Duration: 1 hour
   - Equipment: Tennis ball, basic setup
   - Rules: Modified street rules

3. **T10 Cricket** (Fast-paced)
   - 10 overs per side, 11 players each
   - Duration: 1.5 hours
   - Equipment: Standard cricket gear
   - Rules: T10 format with quick overs

4. **ODI Cricket** (Professional)
   - 30-50 overs per side, 11 players each
   - Duration: 5-8 hours
   - Equipment: Professional gear
   - Rules: One-day international format

## International Payment System

### Country-Specific Payment Gateways

**🇺🇸 United States:**
```
Primary Gateway: Stripe
Secondary: PayPal
Payment Methods:
  ├── Credit/Debit Cards (Visa, MasterCard, Amex)
  ├── Apple Pay / Google Pay
  ├── ACH Bank Transfers
  └── Buy Now, Pay Later (Klarna, Afterpay)
Currency: USD
Tax Rate: 8.75% (average sales tax)
```

**🇨🇦 Canada:**
```
Primary Gateway: Stripe  
Secondary: PayPal
Payment Methods:
  ├── Credit/Debit Cards
  ├── Interac e-Transfer
  ├── Apple Pay / Google Pay
  └── Bank Transfers
Currency: CAD
Tax Rate: 13% (HST/GST+PST combined)
```

**🇲🇽 Mexico:**
```
Primary Gateway: Stripe
Secondary: PayPal
Payment Methods:
  ├── Credit/Debit Cards
  ├── OXXO (Cash payments)
  ├── SPEI (Bank transfers)
  └── Mercado Pago
Currency: MXN
Tax Rate: 16% (IVA)
```

**🇮🇳 India:**
```
Primary Gateway: Razorpay
Secondary: Stripe
Payment Methods:
  ├── UPI (PhonePe, GPay, Paytm)
  ├── Credit/Debit Cards
  ├── Net Banking
  ├── Digital Wallets
  └── EMI Options
Currency: INR
Tax Rate: 18% (GST)
```

**🇳🇵 Nepal:**
```
Primary Gateway: eSewa
Secondary: Khalti
Payment Methods:
  ├── eSewa Digital Wallet
  ├── Khalti Digital Payment
  ├── IME Pay
  ├── Mobile Banking
  └── Bank Transfers
Currency: NPR
Tax Rate: 13% (VAT)
```

## Enhanced Implementation Phases

### Phase 1: Cricket Foundation (Week 1-2)

**Database Setup:**
- [ ] Run cricket migration V1070
- [ ] Create cricket entity repositories  
- [ ] Set up cricket game templates
- [ ] Initialize cricket match state management

**Core Cricket Services:**
```java
// Week 1: Core Cricket Entities
CricketMatch         ✓ Created
CricketInnings       ✓ Created  
CricketPlayerPerformance ✓ Created
CricketBall          ✓ Created

// Week 2: Cricket Services
CricketScoringService    ✓ Created
CricketMatchRepository   ⏳ To implement
CricketAnalyticsService  ⏳ To implement
CricketValidationService ⏳ To implement
```

**APIs:**
- [ ] Cricket match initialization
- [ ] Toss management
- [ ] Ball-by-ball scoring
- [ ] Live scorecard access

### Phase 2: International Payments (Week 3-4)

**Payment Gateway Integration:**
```java
// Week 3: Gateway Providers
StripePaymentProvider    ⏳ Implement
PayPalPaymentProvider    ⏳ Implement  
RazorpayPaymentProvider  ⏳ Implement
EsewaPaymentProvider     ⏳ Implement
KhaltiPaymentProvider    ⏳ Implement

// Week 4: Supporting Services  
ExchangeRateService      ⏳ Implement
PaymentValidationService ⏳ Implement
RefundProcessingService  ⏳ Implement
PaymentAnalyticsService  ⏳ Implement
```

**Currency & Localization:**
- [ ] Real-time exchange rate API integration
- [ ] Multi-currency display and conversion
- [ ] Country-specific payment method UI
- [ ] Tax calculation and compliance

### Phase 3: Country-Based Discovery (Week 5-6)

**Location Services:**
```java
// Week 5: Country Detection
CountryLocationService   ✓ Created
GeographicBoundaryService ⏳ Implement
RegionDetectionService   ⏳ Implement
TimeZoneService          ⏳ Implement

// Week 6: Discovery Features
CountryGameDiscovery     ⏳ Implement
RegionalRecommendations  ⏳ Implement
CulturalSportsService    ⏳ Implement
LocationPreferencesService ⏳ Implement
```

**Country-Specific Features:**
- [ ] Auto-detect country from GPS
- [ ] Regional game filtering (state/province level)
- [ ] Country-specific popular sports
- [ ] Cultural sport preferences by region

### Phase 4: Advanced Cricket Features (Week 7-8)

**Cricket Analytics:**
- [ ] Player career statistics across matches
- [ ] Team performance analysis
- [ ] Match prediction algorithms
- [ ] Performance improvement tracking

**Advanced Scoring:**
- [ ] Live commentary and updates
- [ ] Ball speed and direction tracking
- [ ] Field positioning analysis
- [ ] Partnership and milestone tracking

**Tournament Support:**
- [ ] Cricket tournament creation
- [ ] League table management
- [ ] Knockout tournament brackets
- [ ] Season-long cricket leagues

### Phase 5: Mobile Enhancement & Integration (Week 9-10)

**Mobile Cricket Features:**
- [ ] Live cricket scoring mobile app
- [ ] Push notifications for milestones
- [ ] Offline scorecard sync
- [ ] Camera integration for match photos

**International Mobile Features:**
- [ ] Location-based country detection
- [ ] Currency conversion in-app
- [ ] Regional sports recommendations
- [ ] Multi-language support

## Cricket Database Schema Details

### Enhanced Cricket Tables

```sql
-- Cricket User Statistics (extended from UserStats)
CREATE TABLE cricket_user_stats (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL REFERENCES app_user(id),
    
    -- Career Batting Stats
    total_runs              INTEGER DEFAULT 0,
    total_balls_faced       INTEGER DEFAULT 0,
    career_high_score       INTEGER DEFAULT 0,
    total_centuries         INTEGER DEFAULT 0,
    total_half_centuries    INTEGER DEFAULT 0,
    total_fours             INTEGER DEFAULT 0,
    total_sixes             INTEGER DEFAULT 0,
    career_strike_rate      DECIMAL(6,2),
    times_not_out           INTEGER DEFAULT 0,
    batting_average         DECIMAL(6,2),
    
    -- Career Bowling Stats
    total_wickets           INTEGER DEFAULT 0,
    total_overs_bowled      DECIMAL(8,1) DEFAULT 0.0,
    total_runs_conceded     INTEGER DEFAULT 0,
    best_bowling_figures    VARCHAR(20), -- "4/25"
    total_maidens           INTEGER DEFAULT 0,
    career_economy_rate     DECIMAL(5,2),
    five_wicket_hauls       INTEGER DEFAULT 0,
    
    -- Career Fielding Stats  
    total_catches           INTEGER DEFAULT 0,
    total_run_outs          INTEGER DEFAULT 0,
    total_stumpings         INTEGER DEFAULT 0,
    
    -- Match Participation
    matches_played          INTEGER DEFAULT 0,
    matches_won             INTEGER DEFAULT 0,
    matches_lost            INTEGER DEFAULT 0,
    man_of_match_awards     INTEGER DEFAULT 0,
    
    -- Performance Trends
    recent_form_rating      DECIMAL(3,2), -- Last 5 matches average
    skill_progression       VARCHAR(20),
    preferred_role          VARCHAR(20),
    
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Cricket Match Events (for detailed match timeline)
CREATE TABLE cricket_match_events (
    id                      BIGSERIAL PRIMARY KEY,
    cricket_match_id        BIGINT NOT NULL REFERENCES cricket_matches(id),
    event_type              VARCHAR(30) NOT NULL,
    event_time              TIMESTAMPTZ NOT NULL,
    innings_number          INTEGER,
    over_number             INTEGER,
    ball_number             INTEGER,
    player_id               BIGINT REFERENCES app_user(id),
    team_id                 BIGINT REFERENCES teams(id),
    event_description       TEXT,
    event_data              JSONB, -- Additional structured data
    is_milestone            BOOLEAN DEFAULT FALSE
);

-- Cricket Partnerships (batting partnerships tracking)
CREATE TABLE cricket_partnerships (
    id                      BIGSERIAL PRIMARY KEY,
    innings_id              BIGINT NOT NULL REFERENCES cricket_innings(id),
    batsman1_id             BIGINT NOT NULL REFERENCES app_user(id),
    batsman2_id             BIGINT NOT NULL REFERENCES app_user(id), 
    partnership_runs        INTEGER DEFAULT 0,
    partnership_balls       INTEGER DEFAULT 0,
    wicket_number           INTEGER, -- Which wicket this partnership is for
    start_over              INTEGER,
    end_over                INTEGER,
    partnership_time        INTEGER, -- Duration in minutes
    is_active               BOOLEAN DEFAULT TRUE
);
```

## Cricket API Endpoints Specification

### Match Management
```
POST   /cricket/matches/{gameId}/initialize   # Initialize cricket match
POST   /cricket/matches/{matchId}/toss        # Conduct toss
POST   /cricket/matches/{matchId}/start       # Start match
GET    /cricket/matches/{matchId}/scorecard   # Live scorecard
PUT    /cricket/matches/{matchId}/conditions  # Update conditions
POST   /cricket/matches/{matchId}/complete    # Complete match
```

### Live Scoring
```
POST   /cricket/matches/{matchId}/balls       # Record ball delivery
GET    /cricket/matches/{matchId}/current     # Current match state  
POST   /cricket/matches/{matchId}/innings/complete # End innings
GET    /cricket/matches/{matchId}/commentary  # Match commentary
POST   /cricket/matches/{matchId}/events      # Add match events
```

### Statistics & Analytics
```
GET    /cricket/players/{playerId}/stats      # Player cricket statistics
GET    /cricket/matches/{matchId}/analytics   # Match analysis
GET    /cricket/teams/{teamId}/performance    # Team performance
GET    /cricket/formats                       # Available formats
GET    /cricket/templates                     # Cricket game templates
```

## International Payment API Specification

### Payment Processing
```
GET    /payments/international/methods/{country}     # Available payment methods
POST   /payments/international/create-intent         # Create payment intent
POST   /payments/international/webhook/{gateway}     # Payment webhooks
GET    /payments/international/exchange-rates        # Current exchange rates
POST   /payments/international/refund                # Process refunds
```

### Location-Based Discovery
```
GET    /games/countries/detect                       # Detect country from GPS
GET    /games/countries/{country}/games              # Games by country
GET    /games/countries/{country}/regions/{region}/games # Games by region
GET    /games/countries/{country}/trending           # Trending games
GET    /games/countries/{country}/popular-sports     # Popular sports
POST   /games/countries/users/location               # Update user location
```

## Configuration Requirements

### Payment Gateway Configuration

**Environment Variables:**
```properties
# Stripe (US, CA, MX)
STRIPE_PUBLISHABLE_KEY_US=pk_test_...
STRIPE_SECRET_KEY_US=sk_test_...
STRIPE_WEBHOOK_SECRET_US=whsec_...

STRIPE_PUBLISHABLE_KEY_CA=pk_test_...
STRIPE_SECRET_KEY_CA=sk_test_...

STRIPE_PUBLISHABLE_KEY_MX=pk_test_...
STRIPE_SECRET_KEY_MX=sk_test_...

# PayPal (Global)
PAYPAL_CLIENT_ID=AeA1QIZXiflr...
PAYPAL_CLIENT_SECRET=EJQ4QICGk...
PAYPAL_WEBHOOK_SECRET=WH-...

# Razorpay (India)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# eSewa (Nepal)
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_SUCCESS_URL=https://your-app.com/payment/success
ESEWA_FAILURE_URL=https://your-app.com/payment/failure

# Khalti (Nepal)  
KHALTI_PUBLIC_KEY=test_public_key_...
KHALTI_SECRET_KEY=test_secret_key_...
KHALTI_WEBHOOK_SECRET=...

# Exchange Rate API
EXCHANGE_RATE_API_KEY=your_api_key
EXCHANGE_RATE_PROVIDER=fixer.io
```

**Application Properties:**
```yaml
# Cricket Configuration
cricket:
  scoring:
    auto-save-interval: 30s
    milestone-notifications: true
    real-time-updates: true
  formats:
    default: T20
    allow-custom: false
  analytics:
    performance-tracking: true
    career-stats: true

# International Payments
payments:
  international:
    enabled: true
    test-mode: ${PAYMENT_TEST_MODE:true}
    supported-countries: [US, CA, MX, IN, NP]
    default-currency: USD
    currency-conversion:
      provider: fixer.io
      cache-duration: PT5M
      fallback-rates: true
  
  gateways:
    stripe:
      enabled: true
      countries: [US, CA, MX]
    paypal:
      enabled: true  
      countries: [US, CA, MX]
    razorpay:
      enabled: true
      countries: [IN]
    esewa:
      enabled: true
      countries: [NP]
    khalti:
      enabled: true
      countries: [NP]

# Location Services
location:
  country-detection:
    enabled: true
    cache-duration: PT1H
    fallback-country: US
  regional-discovery:
    enabled: true
    max-search-radius: 100km
```

## Cricket Scoring Workflow

### Match Setup Flow
```
1. Game Owner creates cricket game
2. System offers cricket format templates
3. Owner selects T20/T10/ODI/Street format
4. System auto-configures team structure
5. Players register and join teams
6. Auto-team balancing based on skill
7. Match initialization with toss
```

### Live Scoring Flow
```
1. Designated scorer starts match
2. Conducts toss and sets batting order
3. Ball-by-ball scoring begins
4. Real-time updates to all participants
5. Automatic milestone detection
6. Innings transition management
7. Match completion and statistics
```

### Ball Recording Example
```json
{
  "bowlerId": 123,
  "batsmanOnStrikeId": 456,
  "batsmanNonStrikeId": 789,
  "runs": 4,
  "outcome": "FOUR", 
  "isWicket": false,
  "isExtra": false,
  "shotType": "Cover Drive",
  "commentary": "Beautiful cover drive to the boundary!"
}
```

## Payment Processing Workflow

### Multi-Country Payment Flow
```
1. User selects game in any supported country
2. System detects user location/country
3. Shows relevant payment methods for country
4. Auto-converts currency if needed
5. Routes to appropriate payment gateway
6. Processes payment with local taxes
7. Confirms game registration
8. Sends receipt in local currency
```

### Payment Method Selection Logic
```python
def select_payment_method(user_country, user_preferences):
    if user_country == "US":
        return ["stripe_card", "apple_pay", "google_pay", "paypal"]
    elif user_country == "IN":  
        return ["razorpay_upi", "razorpay_card", "paytm", "phonepe", "gpay"]
    elif user_country == "NP":
        return ["esewa", "khalti", "ime_pay", "mobile_banking"]
    elif user_country == "CA":
        return ["stripe_card", "interac_transfer", "apple_pay", "paypal"]
    elif user_country == "MX":
        return ["stripe_card", "oxxo", "spei", "paypal"]
```

## Data Seeding Strategy

### Cricket Sample Data
```sql
-- Sample Cricket Games
INSERT INTO game_templates VALUES
(DEFAULT, 'T20 Evening Match', 'Cricket', 'T20', 11, 2, 16, 22, 0, 180, 
 'Standard T20 cricket rules, 20 overs per side', 'Cricket gear provided', true, true),
(DEFAULT, 'Street Cricket Fun', 'Cricket', 'Street', 6, 2, 8, 16, 4, 60,
 'Casual street cricket, tennis ball', 'Bring your own bat', false, false);

-- Sample Cricket Matches with Different Countries
-- India Cricket Match (Mumbai)
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, status, price_per_player, total_cost, country_code)
VALUES ('Cricket', 'Oval Maidan, Mumbai', NOW() + INTERVAL '3 days', 'Intermediate', 18.9294, 72.8240, 1, 'PUBLISHED', 300.00, 6600.00, 'IN');

-- Nepal Cricket Match (Kathmandu) 
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, status, price_per_player, total_cost, country_code)
VALUES ('Cricket', 'TU Cricket Ground, Kathmandu', NOW() + INTERVAL '5 days', 'Advanced', 27.7172, 85.3240, 2, 'PUBLISHED', 500.00, 11000.00, 'NP');

-- US Cricket Match (New York)
INSERT INTO game (sport, location, time, skill_level, latitude, longitude, user_id, status, price_per_player, total_cost, country_code) 
VALUES ('Cricket', 'Van Cortlandt Park Cricket Field, NYC', NOW() + INTERVAL '7 days', 'Beginner', 40.8896, -73.8965, 3, 'PUBLISHED', 30.00, 660.00, 'US');
```

## Testing Strategy

### Cricket Feature Testing
```java
@Test
class CricketScoringServiceTest {
    
    @Test 
    void shouldInitializeCricketMatch() {
        // Test cricket match creation from game
    }
    
    @Test
    void shouldRecordBallWithStatistics() {
        // Test ball-by-ball recording
    }
    
    @Test
    void shouldCalculatePlayerPerformance() {
        // Test statistics calculations
    }
    
    @Test
    void shouldDetectMilestones() {
        // Test century, wicket milestones
    }
    
    @Test
    void shouldBalanceTeamsForCricket() {
        // Test cricket team balancing
    }
}
```

### International Payment Testing
```java
@Test
class InternationalPaymentServiceTest {
    
    @Test
    void shouldCreatePaymentIntentForIndia() {
        // Test Razorpay integration
    }
    
    @Test
    void shouldCreatePaymentIntentForNepal() {
        // Test eSewa integration  
    }
    
    @Test
    void shouldConvertCurrency() {
        // Test USD to INR conversion
    }
    
    @Test
    void shouldProcessWebhookFromMultipleGateways() {
        // Test webhook handling
    }
}
```

## Monitoring & Analytics

### Cricket Match Analytics
- Live scoring accuracy and reliability
- Match completion rates by format
- Player engagement during live matches
- Popular cricket formats by country

### Payment Analytics  
- Success rates by country and gateway
- Currency conversion volumes
- Payment method preferences by region
- Transaction processing times

### Location Analytics
- Game discovery patterns by country
- Regional sports popularity trends
- Cross-border game participation
- Location accuracy and detection rates

## Success Metrics

### Cricket Features
- [ ] 95%+ accurate live scoring
- [ ] < 2 second real-time score updates
- [ ] 90%+ user satisfaction with cricket features
- [ ] 80%+ match completion rate

### International Payments
- [ ] 98%+ payment success rate across all countries
- [ ] < 5 second payment processing time
- [ ] Support for 15+ payment methods across 5 countries
- [ ] Real-time currency conversion with <1% margin

### Country-Based Discovery
- [ ] 95%+ accurate country detection from GPS
- [ ] Regional game discovery with <500ms response time
- [ ] Cultural sport recommendations with 4.5+ rating
- [ ] Multi-country search capability

---

This implementation plan transforms your pickup sports app into a comprehensive international platform with advanced cricket support, rivaling specialized cricket apps while maintaining the broad sports appeal of platforms like Plei and Good Rec.