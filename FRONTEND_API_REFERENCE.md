# 🔌 Frontend API Reference - Quick Guide

## 🌐 **Base Configuration**

```typescript
const API_BASE = 'https://api.pickupsports.com/api/v1';
const WS_BASE = 'wss://api.pickupsports.com/ws';

// Headers for authenticated requests
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${getStoredToken()}`,
  'Content-Type': 'application/json'
});
```

---

## 🎮 **Game Management APIs**

### **Create Game**
```typescript
POST /games?lat={latitude}&lon={longitude}

Body: {
  sport: string,
  location: string,
  time: string, // ISO 8601
  skillLevel: string,
  latitude: number,
  longitude: number,
  gameType?: string,
  description?: string,
  minPlayers?: number,
  maxPlayers?: number,
  pricePerPlayer?: number,
  totalCost?: number,
  durationMinutes?: number,
  rsvpCutoff?: string,
  capacity?: number,
  waitlistEnabled?: boolean,
  isPrivate?: boolean,
  requiresApproval?: boolean,
  weatherDependent?: boolean,
  cancellationPolicy?: string,
  rules?: string,
  equipmentProvided?: string,
  equipmentRequired?: string
}

Response: GameDetailsDTO
```

### **Get Game Details**
```typescript
GET /games/{gameId}

Response: GameDetailsDTO {
  id: number,
  sport: string,
  location: string,
  time: string,
  skillLevel: string,
  latitude: number,
  longitude: number,
  gameType: string,
  description: string,
  minPlayers: number,
  maxPlayers: number,
  pricePerPlayer: number,
  totalCost: number,
  durationMinutes: number,
  rsvpCutoff: string,
  capacity: number,
  waitlistEnabled: boolean,
  isPrivate: boolean,
  requiresApproval: boolean,
  weatherDependent: boolean,
  cancellationPolicy: string,
  rules: string,
  equipmentProvided: string,
  equipmentRequired: string,
  creator: UserDTO,
  participants: UserDTO[],
  createdAt: string,
  updatedAt: string
}
```

### **Find Nearby Games**
```typescript
GET /games/nearby?lat={latitude}&lon={longitude}&radius={km}&sport={sport}&skillLevel={level}

Response: GameSummaryDTO[] {
  id: number,
  sport: string,
  location: string,
  time: string,
  skillLevel: string,
  latitude: number,
  longitude: number,
  creatorName: string,
  currentPlayers: number,
  maxPlayers: number,
  status: string
}
```

### **Get Trending Games**
```typescript
GET /games/trending?lat={latitude}&lon={longitude}

Response: GameSummaryDTO[]
```

### **Update Game**
```typescript
PUT /games/{gameId}

Body: CreateGameRequest
Response: GameDetailsDTO
```

### **Delete Game**
```typescript
DELETE /games/{gameId}

Response: 204 No Content
```

---

## 🇳🇵 **Nepal-Specific APIs**

### **Futsal Games**
```typescript
// Find nearby futsal games
GET /nepal/futsal/nearby?lat={lat}&lon={lon}&radius={km}&timeSlot={slot}

Response: FutsalGameDTO[] {
  id: number,
  sport: string,
  location: string,
  time: string,
  skillLevel: string,
  latitude: number,
  longitude: number,
  pricePerPlayer: number,
  currentPlayers: number,
  maxPlayers: number,
  venue: string,
  area: string
}

// Get popular futsal areas
GET /nepal/futsal/popular-areas

Response: PopularAreaDTO[] {
  areaName: string,
  nepaliName: string,
  latitude: number,
  longitude: number,
  activeGames: number,
  totalVenues: number,
  averagePrice: number,
  popularityLevel: string,
  bestTimeSlot: string,
  totalPlayers: number
}
```

### **Localized Sports**
```typescript
GET /nepal/sports/localized

Response: LocalizedSportDTO[] {
  englishName: string,
  nepaliName: string,
  popularityScore: number,
  icon: string,
  description: string
}
```

### **Popular Time Slots**
```typescript
GET /nepal/time-slots/popular?area={areaName}

Response: PopularTimeSlotDTO[] {
  timeSlot: string,
  nepaliName: string,
  popularityScore: number,
  averagePrice: number,
  typicalDuration: number
}
```

---

## 💰 **Payment APIs**

### **eSewa Payment**
```typescript
// Initiate payment
POST /nepal/payment/esewa/initiate

Body: {
  gameId: number,
  userId: number,
  amount: number,
  description: string
}

Response: ESewaPaymentResponse {
  paymentId: string,
  redirectUrl: string,
  status: string,
  message: string
}

// Verify payment
POST /nepal/payment/esewa/verify

Body: {
  paymentId: string,
  transactionId: string,
  amount: number
}

Response: PaymentVerificationResponse {
  success: boolean,
  message: string,
  transactionId: string,
  amount: number,
  verifiedAt: string
}
```

### **Khalti Payment**
```typescript
// Initiate payment
POST /nepal/payment/khalti/initiate

Body: {
  gameId: number,
  userId: number,
  amount: number,
  description: string
}

Response: KhaltiPaymentResponse {
  paymentId: string,
  qrCode: string,
  status: string,
  message: string
}

// Verify payment
POST /nepal/payment/khalti/verify

Body: {
  paymentId: string,
  token: string
}

Response: PaymentVerificationResponse
```

---

## 🏆 **City Champions APIs**

### **Find Nearby Hosts**
```typescript
GET /nepal/hosts/nearby?lat={lat}&lon={lon}&radius={km}

Response: CityHostDTO[] {
  hostId: number,
  hostName: string,
  city: string,
  hostLevel: string,
  rating: number,
  totalGames: number,
  distanceKm: number,
  status: string,
  specialization: string
}
```

### **Get Host Profile**
```typescript
GET /nepal/hosts/{hostId}/profile

Response: CityHostProfileDTO {
  hostId: number,
  hostName: string,
  city: string,
  district: string,
  province: string,
  hostLevel: string,
  rating: number,
  totalGames: number,
  totalRevenue: number,
  joinedDate: string,
  specializations: string[],
  achievements: string[],
  bio: string,
  contactInfo: string
}
```

### **Apply as Host**
```typescript
POST /nepal/hosts/apply

Body: {
  userId: number,
  city: string,
  district: string,
  province: string,
  experience?: string,
  motivation?: string
}

Response: HostApplicationResponse {
  success: boolean,
  hostId?: number,
  applicationNumber?: string,
  message: string,
  status?: string,
  submittedAt?: string
}
```

---

## 👤 **User Management APIs**

### **User Profile**
```typescript
// Get profile
GET /users/{userId}/profile

Response: UserProfileDTO {
  id: number,
  username: string,
  email: string,
  phone?: string,
  preferredSport?: string,
  location?: string,
  bio?: string,
  avatar?: string,
  createdAt: string,
  updatedAt: string
}

// Update profile
PUT /users/{userId}/profile

Body: Partial<UserProfileDTO>
Response: UserProfileDTO
```

### **User Games**
```typescript
// Get user's games
GET /users/{userId}/games?status={status}&page={page}&size={size}

Response: Page<GameSummaryDTO> {
  content: GameSummaryDTO[],
  totalElements: number,
  totalPages: number,
  currentPage: number,
  size: number
}
```

---

## 🔍 **Search & Discovery APIs**

### **Advanced Search**
```typescript
GET /games/search?{filters}

Filters: {
  sport?: string,
  skillLevel?: string,
  minPrice?: number,
  maxPrice?: number,
  startTime?: string,
  endTime?: string,
  lat?: number,
  lon?: number,
  radius?: number,
  page?: number,
  size?: number
}

Response: Page<GameSummaryDTO>
```

### **AI Recommendations**
```typescript
GET /ai/recommendations?userId={userId}&sport={sport}&limit={limit}

Response: GameRecommendationDTO[] {
  id: number,
  recommendedGame: GameSummaryDTO,
  recommendationScore: number,
  reason: string,
  status: string,
  aiModelVersion: string,
  createdAt: string
}
```

---

## 📍 **Location & Country APIs**

### **Country Detection**
```typescript
// Auto-detect country from coordinates
// This happens automatically in the backend when you provide lat/lon
// No separate API call needed

// Get country info
GET /location/countries/{countryCode}

Response: CountryInfo {
  countryCode: string,
  countryName: string,
  region: string,
  continent: string,
  currency: string,
  timezone: string,
  isSupported: boolean
}
```

---

## 🔐 **Authentication APIs**

### **Login**
```typescript
POST /auth/login

Body: {
  username: string,
  password: string
}

Response: {
  token: string,
  refreshToken: string,
  user: UserDTO,
  expiresIn: number
}
```

### **Refresh Token**
```typescript
POST /auth/refresh

Body: {
  refreshToken: string
}

Response: {
  token: string,
  refreshToken: string,
  expiresIn: number
}
```

### **Logout**
```typescript
POST /auth/logout

Body: {
  refreshToken: string
}

Response: 200 OK
```

---

## 📱 **Real-time Features**

### **WebSocket Connection**
```typescript
const ws = new WebSocket(WS_BASE);

// Listen for real-time updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'GAME_UPDATE':
      // Handle game updates
      break;
    case 'PAYMENT_CONFIRMATION':
      // Handle payment confirmations
      break;
    case 'CHAT_MESSAGE':
      // Handle chat messages
      break;
    case 'NOTIFICATION':
      // Handle notifications
      break;
  }
};
```

---

## 🚨 **Error Handling**

### **Common HTTP Status Codes**
```typescript
200: Success
201: Created
400: Bad Request - Validation errors
401: Unauthorized - Invalid/missing token
403: Forbidden - Insufficient permissions
404: Not Found - Resource doesn't exist
409: Conflict - Resource already exists
422: Unprocessable Entity - Business logic errors
500: Internal Server Error - Server error
```

### **Error Response Format**
```typescript
{
  timestamp: string,
  status: number,
  error: string,
  message: string,
  path: string,
  details?: {
    field: string,
    message: string
  }[]
}
```

---

## 📊 **Pagination & Filtering**

### **Page Response Format**
```typescript
{
  content: T[],
  totalElements: number,
  totalPages: number,
  currentPage: number,
  size: number,
  first: boolean,
  last: boolean,
  numberOfElements: number
}
```

### **Sorting**
```typescript
// Add sort parameter to any list endpoint
GET /games/nearby?lat={lat}&lon={lon}&sort=time,asc&sort=distance,asc

// Available sort fields: time, distance, price, rating, createdAt
// Sort direction: asc, desc
```

---

## 🔧 **Development Tips**

### **1. Always Include Location**
```typescript
// Most APIs require lat/lon for country detection
const getNearbyGames = async (lat: number, lon: number) => {
  const response = await fetch(`${API_BASE}/games/nearby?lat=${lat}&lon=${lon}`);
  return response.json();
};
```

### **2. Handle Country-Specific Features**
```typescript
// Check if country is supported for special features
const isNepal = countryCode === 'NP';
if (isNepal) {
  // Show futsal-specific features
  // Enable eSewa/Khalti payments
  // Display City Champions
}
```

### **3. Implement Offline Support**
```typescript
// Cache game data for offline viewing
const cacheGameData = (games: GameSummaryDTO[]) => {
  localStorage.setItem('cached_games', JSON.stringify(games));
  localStorage.setItem('cache_timestamp', Date.now().toString());
};
```

### **4. Handle Payment Flows**
```typescript
// For eSewa: Redirect to payment URL
if (paymentResponse.redirectUrl) {
  window.location.href = paymentResponse.redirectUrl;
}

// For Khalti: Show QR code
if (paymentResponse.qrCode) {
  displayQRCode(paymentResponse.qrCode);
}
```

---

## 📚 **Additional Resources**

- **Full API Documentation**: [Link to Swagger/OpenAPI docs]
- **Postman Collection**: [Link to Postman collection]
- **Backend Team Contact**: [Contact information]
- **API Status Page**: [Link to status page]

---

**This reference covers all the APIs your frontend team needs to build the complete app!** 🚀
