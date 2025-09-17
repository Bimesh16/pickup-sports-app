# 🇳🇵 Pickup Sports App - Advanced Sports Community Platform

> A sophisticated pickup sports platform with **Nepal cultural integration**, **AI-powered features**, and **enterprise-level architecture**. Built for local communities with global scalability.

[![Build Status](https://github.com/Bimesh16/pickup-sports-app/workflows/CI/badge.svg)](https://github.com/Bimesh16/pickup-sports-app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-green.svg)](https://reactnative.dev/)

## 🎯 **Vision & Purpose**

**Connecting sports communities through technology while celebrating cultural heritage.**

Inspired by platforms like **Plei** and **Good Rec**, but designed specifically for **Nepal's sports culture** with **futsal**, **cricket**, and **community-centered** gameplay. Built to scale globally while honoring local traditions.

---

## ⭐ **Key Features**

### 🏟️ **Core Sports Platform**
- **Multi-Sport Support**: Futsal, Cricket, Basketball, Volleyball, Tennis + more
- **Dynamic Team Formation**: AI-powered skill balancing, manual selection, friend groups
- **Venue Booking System**: Real-time availability, integrated payments
- **Tournament Management**: Brackets, registrations, live scoring, prize pools
- **Live Game Scoring**: Real-time updates, statistics, match tracking

### 🇳🇵 **Nepal Cultural Integration**
- **Nepal Flag Design System**: Authentic crimson (#DC143C) and blue (#003893) colors
- **Nepali Language Support**: Full Unicode support with cultural fonts
- **Local Payment Methods**: eSewa, Khalti, IME Pay, Mobile Banking
- **Cultural Celebrations**: Prayer flag animations, traditional victory sounds
- **Festival Themes**: Special designs for Dashain, Tihar, Holi

### 🚀 **Advanced Technology**
- **AI Recommendations**: Machine learning for game matching and team formation
- **Real-time Features**: WebSocket chat, live notifications, presence tracking
- **International Payments**: 5-country support (Nepal, India, US, Canada, Mexico)
- **Enterprise Security**: MFA, social login, trusted devices, rate limiting
- **Microservices Architecture**: Spring Boot, PostgreSQL, Redis, Docker

### 📱 **Multi-Platform**
- **Mobile Apps**: React Native (iOS/Android) with offline support
- **Web Platform**: React/TypeScript with responsive design  
- **Admin Dashboard**: Comprehensive management interface
- **Progressive Web App**: Installable with push notifications

---

## 🏗️ **Architecture Overview**

### **Backend (Java 17 + Spring Boot)**
```
🎯 30+ Controllers | 🗄️ Advanced Entities | 🔄 Real-time Services
├── Game Management (games, venues, sports, bookings)
├── User Management (auth, profiles, MFA, social login)  
├── Real-time Features (chat, presence, WebSocket, push)
├── AI & Analytics (recommendations, statistics, insights)
├── Nepal Localization (payments, culture, language)
└── Admin & Monitoring (audit, abuse reports, metrics)
```

### **Frontend (React + TypeScript)**
```
📱 Mobile-First Design | 🎨 Cultural Components | 📊 Real-time Updates
├── Game Discovery & Creation
├── Tournament Brackets & Management
├── Nepal Cultural Design System
├── Payment Integration (Multi-gateway)
└── Real-time Chat & Notifications
```

### **Mobile (React Native + Expo)**
```
📲 Native Features | 🇳🇵 Cultural Elements | 💰 Payment Integration
├── Location-based Discovery
├── Push Notifications  
├── Offline Functionality
├── Biometric Authentication
└── Camera & Media Integration
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Java 17+
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Docker & Docker Compose

### **1. Clone & Setup**
```bash
git clone https://github.com/Bimesh16/pickup-sports-app.git
cd pickup-sports-app

# Run the automated setup
./scripts/dev-bootstrap.sh
```

### **2. Start Development Stack**
```bash
# Backend + Database + Redis
docker-compose up -d

# Frontend (React)
cd frontend-web && npm install && npm run dev

# Mobile (React Native)  
cd mobile && npm install && npx expo start
```

### **3. Access Applications**
- **Backend API**: http://localhost:8080
- **Frontend Web**: http://localhost:3000  
- **API Documentation**: http://localhost:8080/swagger-ui/index.html
- **Database UI**: http://localhost:8026 (Mailpit for emails)

### **4. Test with Demo Data**
```bash
# Use seeded demo users
USER=jane@example.com PASS=password ./scripts/quickstart.sh
```

---

## 📚 **Documentation Structure**

```
docs/
├── 📖 getting-started/          # Setup guides
├── 🏗️ backend/                 # API & architecture  
├── 📱 frontend/                 # React components & design
├── 📲 mobile/                   # React Native guides
├── 🔌 api/                      # Endpoints & WebSocket
├── 🚀 deployment/               # Docker, K8s, hosting
├── 🧪 testing/                  # Unit, integration, E2E
├── 📊 monitoring/               # Dashboards & metrics
└── ⚖️ legal/                    # Privacy & terms
```

**Key Documents:**
- [🎯 Complete Development Roadmap](COMPLETE_DEVELOPMENT_ROADMAP.md)
- [🚀 Next Steps Implementation Guide](NEXT_STEPS_IMPLEMENTATION.md)
- [🧹 Documentation Cleanup Analysis](DOCUMENTATION_CLEANUP_ANALYSIS.md)

---

## 🛠️ **Development**

### **Backend Development**
```bash
# Start backend with hot reload
./mvnw spring-boot:run

# Run tests
./mvnw test                    # Unit tests
./mvnw verify                  # Integration tests

# Database migrations
./mvnw flyway:migrate         # Apply migrations
./mvnw flyway:info            # Check status
```

### **Frontend Development**
```bash
cd frontend-web

# Development server
npm run dev

# Connect to real backend
npm run mock-off              # Switch from mock to real API
npm run mock-on               # Switch back to mock API

# Build for production
npm run build
```

### **Mobile Development**
```bash
cd mobile

# Start Expo development
npx expo start

# Platform-specific
npx expo start --ios          # iOS simulator
npx expo start --android      # Android emulator  
npx expo start --web          # Web browser
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Backend (.env or application.yml)
SECURITY_JWT_SECRET=your-32-byte-secret-key
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/pickup
SPRING_REDIS_HOST=localhost
CHAT_REDIS_ENABLED=true

# Nepal Payment Integration
ESEWA_MERCHANT_ID=your-esewa-id
KHALTI_SECRET_KEY=your-khalti-key
IME_PAY_MERCHANT_CODE=your-ime-pay-code

# Email/SMS Services
EMAIL_SERVICE_ENABLED=true
SMS_SERVICE_ENABLED=true
SMS_PROVIDER=TWILIO
```

### **Frontend Configuration**
```bash
# Frontend (.env.local)
VITE_API_BASE=http://localhost:8080
VITE_ENVIRONMENT=development
VITE_ENABLE_MOCK=false
```

---

## 🌍 **Internationalization**

### **Supported Markets**
- 🇳🇵 **Nepal** (Primary): Futsal focus, eSewa/Khalti, Nepali language
- 🇮🇳 **India**: Cricket emphasis, Razorpay/UPI integration  
- 🇺🇸 **United States**: Stripe/PayPal, multi-sport
- 🇨🇦 **Canada**: Interac e-Transfer, seasonal sports
- 🇲🇽 **Mexico**: OXXO/SPEI, football focus

### **Payment Methods by Country**
```typescript
const PaymentMethods = {
  nepal: ['eSewa', 'Khalti', 'IME_Pay', 'Mobile_Banking'],
  india: ['Razorpay', 'UPI', 'Paytm', 'PhonePe', 'GPay'],
  usa: ['Stripe', 'PayPal', 'Apple_Pay', 'Google_Pay'],
  canada: ['Stripe', 'PayPal', 'Interac_eTransfer'],
  mexico: ['Stripe', 'PayPal', 'OXXO', 'SPEI']
};
```

---

## 🚀 **Deployment**

### **Docker Deployment**
```bash
# Build and run entire stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale backend instances
docker-compose up -d --scale app=3
```

### **Kubernetes Deployment**
```bash
# Deploy to Kubernetes cluster
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services
```

### **Environment-Specific Configs**
- `docker-compose.dev.yml` - Development with hot reload
- `docker-compose.prod.yml` - Production optimized
- `docker-compose.monitoring.yml` - Prometheus + Grafana

---

## 📊 **Monitoring & Observability**

### **Metrics & Dashboards**
- **Prometheus**: Custom metrics collection
- **Grafana**: Pre-built dashboards for RSVP, payments, user engagement
- **Health Checks**: `/actuator/health` endpoint
- **APM**: Request tracing and performance monitoring

### **Key Metrics Tracked**
- Game creation and participation rates
- Payment success/failure rates  
- Real-time message delivery performance
- User engagement and retention
- API response times and error rates

---

## 🧪 **Testing**

### **Backend Testing**
```bash
# Unit tests
./mvnw test

# Integration tests
./mvnw failsafe:integration-test

# Load testing (K6)
k6 run scripts/k6/auth.js
```

### **Frontend Testing**
```bash
cd frontend-web

# Unit tests
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Mobile testing (Detox)
cd mobile && npm run test:detox
```

---

## 👥 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/tournament-system`
3. Commit changes: `git commit -m 'Add tournament bracket generation'`
4. Push to branch: `git push origin feature/tournament-system`  
5. Submit pull request

### **Code Standards**
- **Java**: Follow Google Java Style Guide
- **TypeScript**: ESLint + Prettier configuration
- **Git**: Conventional commits format
- **Testing**: Minimum 80% code coverage

---

## 🎯 **Roadmap & Next Steps**

### **Immediate Priorities (Next 4 weeks)**
- [ ] **Mobile App Foundation**: Complete React Native setup with Nepal design
- [ ] **Tournament System**: Add bracket generation and management
- [ ] **Team Formation**: Advanced algorithms for balanced teams
- [ ] **Payment Integration**: Complete eSewa/Khalti implementation

### **Short-term Goals (2-3 months)**
- [ ] **iOS/Android Apps**: App Store ready with full feature parity
- [ ] **AI Enhancements**: Machine learning for recommendations
- [ ] **Live Scoring**: Real-time match updates and statistics
- [ ] **Social Features**: Friend networks and community building

### **Long-term Vision (6-12 months)**
- [ ] **International Expansion**: Launch in India, US, Canada, Mexico
- [ ] **Professional Features**: League management, broadcasting
- [ ] **Business Intelligence**: Advanced analytics and reporting
- [ ] **API Platform**: Third-party integrations and partnerships

---

## 🤝 **Community & Support**

### **Getting Help**
- 📧 **Email**: support@pickupsports.app
- 💬 **Discord**: [Community Server](https://discord.gg/pickup-sports)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Bimesh16/pickup-sports-app/issues)
- 📖 **Wiki**: [Documentation Wiki](https://github.com/Bimesh16/pickup-sports-app/wiki)

### **Nepal Sports Community**
- 🏟️ **Kathmandu Futsal**: Connect with local clubs
- 🏏 **Cricket Nepal**: Tournament organizing
- 🏀 **Basketball Federation**: School and college leagues

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Nepal Sports Community**: Inspiration and cultural guidance
- **Plei & Good Rec**: Platform inspiration and feature ideas  
- **Open Source Community**: Libraries and tools that made this possible
- **Contributors**: Everyone who helped build this platform

---

## 📈 **Project Stats**

```
🏗️ Backend:        30+ Controllers, 50+ Entities, 100+ Migrations
📱 Frontend:        React/TypeScript, 200+ Components
📲 Mobile:          React Native, Cross-platform
🗄️ Database:        PostgreSQL with spatial queries
🔄 Real-time:       WebSocket, Redis pub/sub
🌍 International:   5 countries, 15+ payment methods
🎨 Cultural:        Nepal design system, Nepali language
📊 Testing:         Unit, Integration, E2E coverage
```

---

**Built with ❤️ in Nepal 🇳🇵 for the global sports community 🌍**

*Ready to revolutionize pickup sports? Join our community and help build the future of sports technology!*
