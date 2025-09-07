# 🧪 TestSprite Testing Setup Guide - Pickup Sports App

## 📋 Overview

This guide provides comprehensive instructions for setting up and running TestSprite tests for the Pickup Sports App, a full-stack application with Spring Boot backend and React Native frontend.

## 🏗️ Project Architecture

### Backend (Port 8080)
- **Framework**: Spring Boot 3.5.4 with Java 17
- **Database**: PostgreSQL with Flyway migrations
- **Cache**: Redis for session management
- **Message Queue**: RabbitMQ for async processing
- **Security**: JWT-based authentication with Spring Security
- **Documentation**: OpenAPI/Swagger integration
- **Monitoring**: Prometheus metrics and Grafana dashboards

### Frontend (Port 3000)
- **Framework**: React Native with Expo SDK 49
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation 6
- **UI**: React Native Paper with Nepal-inspired design
- **Maps**: React Native Maps for location services

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Required software
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven 3.6+
- Expo CLI
```

### 2. Start the Application

#### Option A: Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f app
```

#### Option B: Manual Setup
```bash
# Start backend
./mvnw spring-boot:run

# Start frontend (in separate terminal)
cd frontend
npm install
npm start
```

### 3. Verify Application is Running
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui/index.html
- **Health Check**: http://localhost:8080/actuator/health
- **Frontend**: http://localhost:3000 (if using web)
- **Grafana**: http://localhost:3000 (monitoring)
- **Prometheus**: http://localhost:9090

## 🧪 TestSprite Test Plans

### Frontend Test Plan (20 Test Cases)
**File**: `testsprite_tests/testsprite_frontend_test_plan.json`

**Key Test Categories**:
- ✅ User Authentication & Registration
- ✅ Game Discovery & Creation
- ✅ Payment Processing (Stripe, PayPal, eSewa, Khalti)
- ✅ Real-time Chat & Messaging
- ✅ Social Feed & Interactions
- ✅ Venue Management
- ✅ Notification System
- ✅ AI Recommendations
- ✅ Profile Management
- ✅ Location Services
- ✅ Security & Rate Limiting
- ✅ Cross-platform UI Consistency
- ✅ Cricket Integration
- ✅ Monitoring & Analytics

### Backend Test Plan (15 Test Cases)
**File**: `testsprite_tests/testsprite_backend_test_plan.json`

**Key Test Categories**:
- ✅ User Authentication & JWT
- ✅ Game CRUD Operations
- ✅ RSVP Management
- ✅ Payment Processing
- ✅ WebSocket Chat
- ✅ Cricket Scoring System
- ✅ AI Recommendations
- ✅ Rate Limiting & Security
- ✅ Database Transactions
- ✅ Notification System
- ✅ Health Checks & Monitoring
- ✅ API Documentation
- ✅ Error Handling

## 🔧 TestSprite Configuration

### Bootstrap TestSprite
```bash
# Initialize TestSprite for backend testing
mcp_TestSprite_testsprite_bootstrap_tests \
  --localPort 8080 \
  --type backend \
  --projectPath /Users/bmessi/pickup-sports-app \
  --testScope codebase
```

### Run Frontend Tests
```bash
# Generate and execute frontend tests
mcp_TestSprite_testsprite_generate_frontend_test_plan \
  --projectPath /Users/bmessi/pickup-sports-app \
  --needLogin true
```

## 📊 Test Execution Strategy

### 1. Backend API Testing
- **Unit Tests**: Run with `./mvnw test`
- **Integration Tests**: Run with `./mvnw verify`
- **API Testing**: Use Postman collection or curl commands
- **Load Testing**: Use k6 scripts in `scripts/k6/`

### 2. Frontend Testing
- **Unit Tests**: Run with `npm test` in frontend directory
- **E2E Tests**: Use TestSprite generated test cases
- **Manual Testing**: Follow test plan steps manually
- **Cross-platform**: Test on Android and iOS devices

### 3. Integration Testing
- **Database**: Test with PostgreSQL using test containers
- **WebSocket**: Test real-time chat functionality
- **Payment**: Test with sandbox payment gateways
- **Notifications**: Test email and push notification delivery

## 🎯 Key Test Scenarios

### Critical User Flows
1. **User Registration → Login → Game Discovery → Join Game → Payment**
2. **Host Game Creation → Player RSVP → Real-time Chat → Game Completion**
3. **Cricket Match → Ball-by-Ball Scoring → Live Updates → Final Statistics**
4. **AI Recommendations → User Preferences → Personalized Suggestions**

### Security Testing
- JWT token validation and expiration
- Rate limiting enforcement
- CORS policy validation
- SQL injection prevention
- XSS protection

### Performance Testing
- API response times
- Database query optimization
- WebSocket connection handling
- Payment processing latency

## 📈 Monitoring & Metrics

### Prometheus Metrics
- Request rates and response times
- Error rates and status codes
- Database connection pool status
- JVM memory and CPU usage

### Grafana Dashboards
- Application performance metrics
- Business metrics (games created, users registered)
- Infrastructure metrics (CPU, memory, disk)
- Custom alerts and notifications

## 🐛 Troubleshooting

### Common Issues
1. **Port Conflicts**: Ensure ports 8080, 3000, 5432, 8026 are free
2. **Database Connection**: Check PostgreSQL is running and accessible
3. **JWT Secret**: Ensure SECURITY_JWT_SECRET is set (min 32 characters)
4. **CORS Issues**: Verify CORS configuration for frontend domain
5. **WebSocket Connection**: Check WebSocket endpoint accessibility

### Debug Commands
```bash
# Check running processes
lsof -i:8080,3000,5432

# View application logs
docker-compose logs -f app

# Test API endpoints
curl -X GET http://localhost:8080/actuator/health

# Check database connection
docker-compose exec db psql -U postgres -d soccer_app
```

## 📝 Test Results

### Expected Test Coverage
- **Backend**: 15 comprehensive test cases covering all major functionality
- **Frontend**: 20 test cases covering user flows and UI components
- **Integration**: End-to-end testing of critical user journeys
- **Security**: Authentication, authorization, and data protection
- **Performance**: Load testing and optimization validation

### Success Criteria
- All test cases pass with 100% success rate
- API response times under 200ms for 95% of requests
- Zero security vulnerabilities in critical paths
- Cross-platform compatibility verified
- Payment processing accuracy of 99.9%

## 🔄 Continuous Testing

### Automated Testing Pipeline
1. **Pre-commit**: Unit tests and linting
2. **CI/CD**: Integration tests and security scans
3. **Staging**: Full test suite execution
4. **Production**: Health checks and monitoring

### Test Maintenance
- Regular test plan updates based on new features
- Performance baseline updates
- Security test updates for new threats
- Cross-platform testing for new devices

---

## 📞 Support

For issues or questions regarding TestSprite setup:
1. Check the troubleshooting section above
2. Review application logs for error details
3. Verify all prerequisites are installed
4. Ensure all services are running correctly

**Happy Testing! 🚀**
