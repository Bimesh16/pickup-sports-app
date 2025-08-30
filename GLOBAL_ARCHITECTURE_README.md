# 🌍 Global + Country-Specific Architecture

## 🎯 **Architecture Overview**

Your Pickup Sports App now follows a **hybrid architecture** that combines:

- **🌍 Global Foundation**: Universal game management for all countries
- **🇳🇵 Country-Specific Features**: Specialized functionality for Nepal (and future countries)
- **📍 Location-Based Routing**: Automatic country detection and feature routing

## 🏗️ **Architecture Design**

```
┌─────────────────────────────────────────────────────────────┐
│                    Global Foundation                        │
├─────────────────────────────────────────────────────────────┤
│  GameController (Universal)                                │
│  ├── POST /api/v1/games (Create Game)                     │
│  ├── GET /api/v1/games/{id} (Get Game)                    │
│  ├── GET /api/v1/games/nearby (Find Games)                │
│  ├── GET /api/v1/games/trending (Trending Games)          │
│  ├── PUT /api/v1/games/{id} (Update Game)                 │
│  └── DELETE /api/v1/games/{id} (Delete Game)              │
├─────────────────────────────────────────────────────────────┤
│  GameService (Universal)                                   │
│  ├── createGame()                                          │
│  ├── getGameById()                                         │
│  ├── findNearbyGames()                                     │
│  ├── getTrendingGames()                                    │
│  ├── updateGame()                                          │
│  └── deleteGame()                                          │
├─────────────────────────────────────────────────────────────┤
│  CountryDetectionService                                   │
│  ├── detectCountry(lat, lon) → Country Code               │
│  ├── getCountryInfo(code) → Country Details               │
│  └── isCountrySupported(code) → Boolean                   │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                Country-Specific Extensions                  │
├─────────────────────────────────────────────────────────────┤
│  🇳🇵 NepalController                                       │
│  ├── /api/v1/nepal/futsal/nearby                          │
│  ├── /api/v1/nepal/payment/esewa/initiate                 │
│  ├── /api/v1/nepal/hosts/apply                            │
│  └── /api/v1/nepal/sports/localized                       │
├─────────────────────────────────────────────────────────────┤
│  🇮🇳 IndiaController (Future)                              │
│  ├── /api/v1/india/cricket/games                          │
│  ├── /api/v1/india/payment/upi/initiate                   │
│  └── /api/v1/india/venues/cricket-grounds                 │
├─────────────────────────────────────────────────────────────┤
│  🇺🇸 USController (Future)                                 │
│  ├── /api/v1/us/basketball/games                          │
│  ├── /api/v1/us/payment/stripe/initiate                   │
│  └── /api/v1/us/venues/basketball-courts                  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 **How It Works**

### **1. User Location Detection**
```java
// User provides coordinates
POST /api/v1/games?lat=27.7172&lon=85.3240

// System automatically detects country
CountryDetectionService.detectCountry(27.7172, 85.3240) → "NP" (Nepal)
```

### **2. Smart Routing**
```java
// Global controller receives request
GameController.createGame(request, latitude, longitude)

// Detects country and routes appropriately
if (countryCode == "NP") {
    // Route to Nepal-specific logic
    return nepalGameController.createGame(request);
} else {
    // Use global game creation
    return gameService.createGame(request);
}
```

### **3. Country-Specific Features**
```java
// Nepal users get futsal-focused experience
GET /api/v1/nepal/futsal/nearby?lat=27.7172&lon=85.3240

// US users get basketball-focused experience (future)
GET /api/v1/us/basketball/games?lat=40.7128&lon=-74.0060
```

## 📍 **Country Detection**

### **Supported Countries**
- **🇳🇵 Nepal**: Kathmandu Valley, futsal focus
- **🇮🇳 India**: Cricket, UPI payments (future)
- **🇺🇸 United States**: Basketball, Stripe payments (future)
- **🇨🇦 Canada**: Hockey, Interac payments (future)
- **🇲🇽 Mexico**: Soccer, OXXO payments (future)

### **Detection Method**
```java
// Simple coordinate-based detection
CountryBounds nepal = new CountryBounds(26.0, 30.5, 80.0, 88.5);
CountryBounds india = new CountryBounds(6.0, 37.0, 68.0, 97.0);
CountryBounds usa = new CountryBounds(24.0, 71.0, -180.0, -66.0);

// Future: Integrate with Google Maps API or OpenStreetMap
```

## 🎮 **Game Management Flow**

### **Global Game Creation**
```java
POST /api/v1/games
{
  "sport": "Soccer",
  "location": "Central Park",
  "time": "2025-08-30T18:00:00Z",
  "skillLevel": "Intermediate",
  "latitude": 40.7829,
  "longitude": -73.9654
}
```

### **Country-Specific Enhancement**
```java
// If coordinates are in Nepal
POST /api/v1/games?lat=27.7172&lon=85.3240
{
  "sport": "Futsal",  // Auto-suggested for Nepal
  "location": "Baneshwor Futsal Center",
  "time": "2025-08-30T18:00:00+05:45",  // Nepal timezone
  "skillLevel": "Intermediate",
  "pricePerPlayer": 250.00,  // NPR pricing
  "paymentMethod": "esewa"   // Nepal payment method
}
```

## 💰 **Payment Integration**

### **Global Payment Interface**
```java
POST /api/v1/payments/create-intent
{
  "gameId": 123,
  "amount": 25.00,
  "currency": "USD",  // Auto-detected from country
  "country": "US"     // Auto-detected from coordinates
}
```

### **Country-Specific Payment Methods**
```java
// Nepal
POST /api/v1/nepal/payment/esewa/initiate
POST /api/v1/nepal/payment/khalti/initiate

// India (future)
POST /api/v1/india/payment/upi/initiate
POST /api/v1/india/payment/razorpay/initiate

// US (future)
POST /api/v1/us/payment/stripe/initiate
POST /api/v1/us/payment/paypal/initiate
```

## 🌐 **API Endpoints Structure**

### **Global Endpoints**
```
/api/v1/games                    # Universal game management
/api/v1/users                    # User management
/api/v1/venues                   # Venue management
/api/v1/search                   # Global search
```

### **Country-Specific Endpoints**
```
/api/v1/nepal/                   # Nepal features
├── futsal/                      # Futsal games
├── payment/                     # eSewa, Khalti
├── hosts/                       # City Champions
└── sports/                      # Localized sports

/api/v1/india/                   # India features (future)
├── cricket/                     # Cricket games
├── payment/                     # UPI, Razorpay
└── venues/                      # Cricket grounds

/api/v1/us/                      # US features (future)
├── basketball/                  # Basketball games
├── payment/                     # Stripe, PayPal
└── venues/                      # Basketball courts
```

## 🔄 **Migration Strategy**

### **Phase 1: Nepal Launch (Current)**
- ✅ Global game management
- ✅ Nepal-specific features
- ✅ Country detection
- ✅ Basic routing

### **Phase 2: India Expansion**
- 🔄 Cricket game management
- 🔄 UPI payment integration
- 🔄 Regional sports preferences
- 🔄 Local venue integration

### **Phase 3: Global Expansion**
- 🔄 US basketball focus
- 🔄 Canada hockey focus
- 🔄 Mexico soccer focus
- 🔄 Multi-language support

## 🛠️ **Technical Implementation**

### **Key Services**
```java
@Service
public class GameController {
    private final GameService gameService;           // Global
    private final CountryDetectionService countryService;
    private final NepalGameController nepalController;  // Country-specific
}

@Service
public class CountryDetectionServiceImpl {
    public String detectCountry(Double lat, Double lon) {
        // Coordinate-based country detection
        // Future: External geocoding service
    }
}
```

### **Data Flow**
```
User Request → Country Detection → Route Decision → Service Execution
     ↓              ↓                ↓              ↓
Game Creation → Detect Nepal → Nepal Logic → Futsal Game
Game Creation → Detect India → India Logic → Cricket Game
Game Creation → Unknown → Global Logic → Generic Game
```

## 🎯 **Benefits of This Architecture**

### **✅ Immediate Benefits**
- **Nepal Launch Ready**: Focused features for immediate market
- **Global Foundation**: Ready for international expansion
- **Smart Routing**: Automatic feature selection based on location
- **Maintainable Code**: Clear separation of concerns

### **✅ Future Benefits**
- **Easy Country Addition**: New countries require minimal changes
- **Localized Experience**: Each country gets tailored features
- **Payment Flexibility**: Country-specific payment methods
- **Cultural Relevance**: Local sports, time zones, languages

### **✅ Technical Benefits**
- **Scalable**: Add countries without changing core logic
- **Testable**: Each layer can be tested independently
- **Deployable**: Roll out country features incrementally
- **Maintainable**: Clear boundaries between global and local code

## 🚀 **Getting Started**

### **1. Launch in Nepal**
```bash
# The app is already configured for Nepal
./scripts/build.sh
# Deploy to Nepal market
```

### **2. Add New Country**
```java
// 1. Add country bounds
COUNTRY_BOUNDS.put("IN", new CountryBounds(6.0, 37.0, 68.0, 97.0));

// 2. Create country controller
@RestController
@RequestMapping("/api/v1/india")
public class IndiaController { ... }

// 3. Add routing logic
case "IN": return indiaController.createGame(request);
```

### **3. Test Country Detection**
```bash
# Test Nepal detection
curl "http://localhost:8080/api/v1/games/nearby?lat=27.7172&lon=85.3240"

# Test India detection (future)
curl "http://localhost:8080/api/v1/games/nearby?lat=28.6139&lon=77.2090"
```

## 🎉 **Summary**

Your app now has the **best of both worlds**:

1. **🌍 Global Foundation**: Universal game management for worldwide users
2. **🇳🇵 Nepal Focus**: Specialized features for immediate market launch
3. **📍 Smart Routing**: Automatic country detection and feature selection
4. **🚀 Future Ready**: Easy expansion to new countries and markets

**You can launch in Nepal today while building for global expansion tomorrow!** 🎯
