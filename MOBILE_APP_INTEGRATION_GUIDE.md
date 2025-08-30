# 📱 Mobile App Integration Guide - Nepal Features

## 🎯 **Quick Start for Mobile Team**

Your backend is **production-ready** with complete Nepal Phase 1 features. Here's everything your mobile app needs to integrate.

---

## 🔧 **Backend Setup**

### **Local Development:**
```bash
# Start backend with H2 database (no external dependencies)
./mvnw spring-boot:run -Dspring-boot.run.profiles=h2

# Backend will be available at:
http://localhost:8080

# API Documentation:
http://localhost:8080/swagger-ui/index.html

# Health Check:
http://localhost:8080/actuator/health
```

### **Production Setup:**
```bash
# Deploy JAR to production server
java -jar pickup-sports-app-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# Environment variables needed:
export ESEWA_MERCHANT_ID=your_esewa_merchant_id
export KHALTI_PUBLIC_KEY=your_khalti_public_key
export KHALTI_SECRET_KEY=your_khalti_secret_key
```

---

## 🇳🇵 **Nepal-Specific API Endpoints**

### **Futsal Game Discovery**
```typescript
// Find nearby futsal games
GET /api/v1/nepal/futsal/nearby
Query params: latitude, longitude, radiusKm?, timeSlot?
Response: FutsalGameDTO[]

// Get popular areas in Kathmandu
GET /api/v1/nepal/futsal/popular-areas
Response: PopularAreaDTO[]

// Get sports with Nepali translations
GET /api/v1/nepal/sports/localized
Response: LocalizedSportDTO[]

// Get popular time slots
GET /api/v1/nepal/time-slots/popular
Query params: area?
Response: PopularTimeSlotDTO[]
```

### **Payment Integration**
```typescript
// eSewa Payment
POST /api/v1/nepal/payment/esewa/initiate
Body: { gameId, userId, amount, description }
Response: { paymentId, paymentUrl, status }

POST /api/v1/nepal/payment/esewa/verify
Body: { paymentId, transactionId, amount }
Response: { status, isVerified, message }

// Khalti Payment
POST /api/v1/nepal/payment/khalti/initiate
Body: { gameId, userId, amount, description }
Response: { paymentId, paymentUrl, status }

POST /api/v1/nepal/payment/khalti/verify
Body: { paymentId, token }
Response: { status, isVerified, message }
```

### **City Champions (Hosts)**
```typescript
// Apply to become City Champion
POST /api/v1/nepal/hosts/apply
Body: { userId, city, district, province, experience?, motivation? }
Response: { success, hostId, applicationNumber, message }

// Find nearby hosts
GET /api/v1/nepal/hosts/nearby
Query params: latitude, longitude, radiusKm?
Response: CityHostDTO[]

// Get host profile
GET /api/v1/nepal/hosts/{hostId}/profile
Response: CityHostProfileDTO
```

---

## 📱 **Mobile App Implementation Examples**

### **React Native Integration**
```typescript
// API Configuration
const NEPAL_API_BASE = 'http://localhost:8080/api/v1/nepal';

// Find futsal games near user
export const findNearbyFutsal = async (lat: number, lng: number, radius: number = 5) => {
  const response = await fetch(
    `${NEPAL_API_BASE}/futsal/nearby?latitude=${lat}&longitude=${lng}&radiusKm=${radius}`
  );
  return response.json();
};

// Initiate eSewa payment
export const payWithESewa = async (gameId: number, userId: number, amount: number) => {
  const response = await fetch(`${NEPAL_API_BASE}/payment/esewa/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gameId,
      userId, 
      amount,
      description: 'Futsal Game Booking'
    })
  });
  return response.json();
};

// Apply as City Champion
export const applyAsHost = async (applicationData: HostApplication) => {
  const response = await fetch(`${NEPAL_API_BASE}/hosts/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(applicationData)
  });
  return response.json();
};

// Get popular areas for futsal
export const getPopularAreas = async () => {
  const response = await fetch(`${NEPAL_API_BASE}/futsal/popular-areas`);
  return response.json();
};
```

### **UI Components (React Native)**
```typescript
// Futsal Game Card Component
const FutsalGameCard = ({ game }: { game: FutsalGameDTO }) => (
  <View style={styles.gameCard}>
    <Text style={styles.title}>{game.title}</Text>
    <Text style={styles.venue}>{game.venueName}</Text>
    <Text style={styles.area}>{game.area}</Text>
    <Text style={styles.price}>NPR {game.pricePerPlayer}/player</Text>
    <Text style={styles.players}>{game.currentPlayers}/{game.maxPlayers} players</Text>
    <Text style={styles.time}>{formatTime(game.startTime)}</Text>
    <Text style={styles.host}>Host: {game.hostName} ({game.hostRating}⭐)</Text>
    <TouchableOpacity style={styles.joinButton} onPress={() => joinGame(game.gameId)}>
      <Text style={styles.joinText}>Join Game</Text>
    </TouchableOpacity>
  </View>
);

// Payment Method Selector
const PaymentMethodSelector = ({ onSelect }: { onSelect: (method: string) => void }) => (
  <View style={styles.paymentMethods}>
    <TouchableOpacity style={styles.esewaButton} onPress={() => onSelect('esewa')}>
      <Text style={styles.methodText}>Pay with eSewa</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.khaltiButton} onPress={() => onSelect('khalti')}>
      <Text style={styles.methodText}>Pay with Khalti</Text>
    </TouchableOpacity>
  </View>
);

// Host Application Form
const HostApplicationForm = () => {
  const [application, setApplication] = useState({
    userId: currentUser.id,
    city: '',
    district: '',
    province: 'Bagmati',
    experience: '',
    motivation: ''
  });

  const submitApplication = async () => {
    try {
      const result = await applyAsHost(application);
      if (result.success) {
        Alert.alert('Success', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Application failed. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.form}>
      <TextInput 
        placeholder="City (e.g., Kathmandu)"
        value={application.city}
        onChangeText={(text) => setApplication({...application, city: text})}
      />
      <TextInput 
        placeholder="District (e.g., Kathmandu)"  
        value={application.district}
        onChangeText={(text) => setApplication({...application, district: text})}
      />
      <TextInput
        placeholder="Sports experience"
        multiline
        value={application.experience}
        onChangeText={(text) => setApplication({...application, experience: text})}
      />
      <TouchableOpacity style={styles.submitButton} onPress={submitApplication}>
        <Text style={styles.submitText}>Apply as City Champion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
```

---

## 🎨 **Nepal UI/UX Guidelines**

### **Design Principles:**
```typescript
// Color scheme (Nepal-inspired)
const NepalColors = {
  primary: '#DC143C',      // Nepal flag red
  secondary: '#003893',    // Nepal flag blue  
  success: '#28a745',      // Futsal green
  warning: '#ffc107',      // Gold accent
  background: '#f8f9fa'    // Clean white
};

// Localization
const Strings = {
  en: {
    findFutsal: 'Find Futsal Games',
    joinGame: 'Join Game',
    applyAsHost: 'Become City Champion'
  },
  ne: {
    findFutsal: 'फुटसल खेल खोज्नुहोस्',
    joinGame: 'खेलमा सामेल हुनुहोस्',
    applyAsHost: 'सिटी च्याम्पियन बन्नुहोस्'
  }
};

// Popular time slots for Nepal
const TimeSlots = {
  MORNING: '6:00 AM - 9:00 AM',
  EVENING: '5:00 PM - 9:00 PM',   // Most popular
  NIGHT: '9:00 PM - 12:00 AM'
};
```

---

## 🔧 **Development Environment**

### **Required Dependencies:**
```json
{
  "dependencies": {
    "react-native": "^0.73.0",
    "react-navigation": "^6.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "react-native-geolocation-service": "^5.3.0",
    "react-native-maps": "^1.8.0"
  }
}
```

### **Environment Variables:**
```typescript
// .env file
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_NEPAL_API_BASE_URL=http://localhost:8080/api/v1/nepal
REACT_APP_ESEWA_MERCHANT_ID=your_merchant_id
REACT_APP_KHALTI_PUBLIC_KEY=your_public_key
REACT_APP_DEFAULT_CITY=Kathmandu
REACT_APP_DEFAULT_COUNTRY=Nepal
REACT_APP_DEFAULT_CURRENCY=NPR
```

---

## 🎯 **Next Steps for Mobile Team**

### **Phase 1: Core Integration (Week 1-2)**
1. **Authentication:** Integrate with existing JWT system
2. **Game Discovery:** Implement futsal search with location
3. **Payment Flow:** Add eSewa and Khalti payment options
4. **Basic UI:** Create Nepal-themed interface

### **Phase 2: Advanced Features (Week 3-4)**  
1. **Host Program:** Add City Champion application flow
2. **Localization:** Implement Nepali language support
3. **Maps Integration:** Add venue location and navigation
4. **Performance:** Optimize for Nepal network conditions

### **Phase 3: Launch Preparation (Week 5-6)**
1. **Testing:** Beta test with real venues and payments
2. **Analytics:** Add user behavior tracking
3. **Notifications:** Implement game reminders and updates
4. **Polish:** Final UI/UX improvements

---

**🚀 Your backend is ready! Start building the mobile app and let's launch in Nepal!** 🇳🇵