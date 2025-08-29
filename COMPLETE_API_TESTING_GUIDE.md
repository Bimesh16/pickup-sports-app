# 🚀 Pickup Sports App - Complete API Testing Guide

## 📋 Overview

This guide covers testing **ALL endpoints** in your Pickup Sports App, organized by functional areas. The collection includes **50+ endpoints** covering every aspect of your application.

## 📥 Import Instructions

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Copy and paste the **`Pickup_Sports_App_Complete.postman_collection.json`** content
4. Click **Continue** and then **Import**

### Step 2: Import Environment
1. Click **Import** button again
2. Copy and paste the **`Pickup_Sports_App_Complete_Environment.postman_environment.json`** content
3. Click **Continue** and then **Import**

### Step 3: Select Environment
1. In the top-right corner, select **"Pickup Sports App - Complete Environment"** from the dropdown

## 🧪 Testing Sequence

### Phase 1: Basic Health & Setup
1. **Root Endpoint** (`GET /`) - Should return "Pickup Sports API is running"
2. **Health Check** (`GET /actuator/health`) - Should return Spring Boot health status
3. **Custom Health** (`GET /health`) - Should return custom health metrics
4. **Detailed Health** (`GET /health/detailed`) - Should return comprehensive system info

### Phase 2: Authentication & User Management
1. **User Registration** (`POST /users/register`) - Create a new test user
2. **User Login** (`POST /auth/login`) - Authenticate and get JWT tokens
3. **Get User Profile** (`GET /users/{username}`) - Retrieve user profile
4. **Update User Profile** (`PUT /users/{username}`) - Modify user profile
5. **Get User Avatar** (`GET /users/{username}/avatar`) - Retrieve profile picture

### Phase 3: Core Game Functionality
1. **Create Game** (`POST /games`) - Create a new game
2. **Get Game by ID** (`GET /games/{id}`) - Retrieve game details
3. **Search Games** (`GET /search/games`) - Find games with filters
4. **Update Game** (`PUT /games/{id}`) - Modify game details
5. **Delete Game** (`DELETE /games/{id}`) - Remove a game

### Phase 4: RSVP & Participation
1. **Join Game** (`POST /games/{id}/join`) - RSVP to a game
2. **Hold Game Slot** (`POST /games/{id}/hold`) - Temporarily reserve a spot
3. **Get RSVP Status** (`GET /games/{id}/rsvp-status`) - Check participation status
4. **Leave Game** (`DELETE /games/{id}/leave`) - Cancel participation

### Phase 5: Venues & Locations
1. **Create Venue** (`POST /venues`) - Add a new venue
2. **Get Venue by ID** (`GET /venues/{id}`) - Retrieve venue details
3. **Search Venues** (`GET /venues/search`) - Find venues by criteria

### Phase 6: Social Features
1. **Rate User** (`POST /ratings`) - Rate another player
2. **Get User Rating Summary** (`GET /ratings/users/{id}/summary`) - View rating stats
3. **Get Recent Ratings** (`GET /ratings/users/{id}/recent`) - See recent feedback

### Phase 7: Communication
1. **Get User Notifications** (`GET /notifications`) - Retrieve notifications
2. **Create Notification** (`POST /notifications`) - Send a notification
3. **Get Game Chat History** (`GET /games/{id}/chat`) - View chat messages
4. **Send Chat Message** (`POST /games/{id}/chat`) - Post in game chat

### Phase 8: Search & Discovery
1. **Search Users** (`GET /search/users`) - Find other players
2. **Get Saved Searches** (`GET /saved-searches`) - View saved queries
3. **Create Saved Search** (`POST /saved-searches`) - Save a search

### Phase 9: AI & Analytics
1. **Get AI Recommendations** (`GET /ai/recommendations`) - Get game suggestions
2. **Get AI Performance Metrics** (`GET /ai/monitoring/performance`) - View AI stats
3. **Get User Statistics** (`GET /api/v1/users/{username}/stats`) - View user analytics
4. **Get User Achievements** (`GET /api/v1/users/{username}/achievements`) - See badges

### Phase 10: System & Admin
1. **Get System Performance** (`GET /system/performance`) - View system metrics
2. **Get Load Balancing Stats** (`GET /system/load-balancing`) - Check load balancer
3. **Get Abuse Reports** (`GET /abuse-reports`) - View moderation reports

## 🔑 Authentication Flow

### 1. Get JWT Tokens
```bash
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "username": "{{username}}",
  "password": "{{password}}"
}
```

### 2. Extract Tokens from Response
- Copy `accessToken` to `{{auth_token}}` environment variable
- Copy `refreshToken` to `{{refresh_token}}` environment variable

### 3. Use in Protected Endpoints
```
Authorization: Bearer {{auth_token}}
```

## 📊 Expected Responses

### Health Endpoints
- **Status**: 200 OK
- **Body**: JSON with health information
- **Cache**: Varies (public/private)

### Authentication Endpoints
- **Login Success**: 200 OK with JWT tokens
- **Login Failure**: 401 Unauthorized
- **Registration Success**: 201 Created with user details
- **Registration Failure**: 400 Bad Request

### Protected Endpoints
- **With Valid Token**: 200 OK / 201 Created / 204 No Content
- **Without Token**: 401 Unauthorized
- **Invalid Token**: 401 Unauthorized

### Game Endpoints
- **Create Success**: 201 Created with game details
- **Get Success**: 200 OK with game data
- **Update Success**: 200 OK with updated data
- **Delete Success**: 204 No Content

## 🚨 Common Issues & Solutions

### 1. 401 Unauthorized
- **Cause**: Missing or invalid JWT token
- **Solution**: Re-authenticate and update `{{auth_token}}`

### 2. 400 Bad Request
- **Cause**: Invalid request body or parameters
- **Solution**: Check request format and required fields

### 3. 404 Not Found
- **Cause**: Resource doesn't exist
- **Solution**: Verify IDs and resource existence

### 4. 429 Too Many Requests
- **Cause**: Rate limiting exceeded
- **Solution**: Wait and retry, or check rate limit settings

### 5. 500 Internal Server Error
- **Cause**: Server-side error
- **Solution**: Check server logs and application status

## 🔧 Environment Variables

### Required Variables
- `{{base_url}}` - Application base URL
- `{{username}}` - Test username
- `{{password}}` - Test password
- `{{auth_token}}` - JWT access token
- `{{refresh_token}}` - JWT refresh token

### Optional Variables
- `{{game_id}}` - Test game ID
- `{{venue_id}}` - Test venue ID
- `{{user_id}}` - Test user ID
- `{{sport}}` - Sport type for testing
- `{{location}}` - Location for testing

## 📈 Performance Testing

### Response Time Thresholds
- **Health Checks**: < 100ms
- **Authentication**: < 500ms
- **CRUD Operations**: < 1000ms
- **Search Operations**: < 2000ms
- **AI Operations**: < 5000ms

### Load Testing
- Use Postman's **Runner** feature for concurrent requests
- Test with multiple users and simultaneous operations
- Monitor response times and error rates

## 🎯 Success Criteria

### Functional Testing
- ✅ All endpoints return expected status codes
- ✅ Authentication works correctly
- ✅ CRUD operations function properly
- ✅ Search and filtering work as expected
- ✅ Error handling is appropriate

### Performance Testing
- ✅ Response times meet thresholds
- ✅ No memory leaks or performance degradation
- ✅ Rate limiting works correctly
- ✅ Concurrent requests handled properly

### Security Testing
- ✅ Protected endpoints require authentication
- ✅ JWT tokens are validated correctly
- ✅ User permissions are enforced
- ✅ No sensitive data exposure

## 🚀 Next Steps

1. **Import the collection and environment**
2. **Start with health checks** to verify application status
3. **Test authentication flow** to get JWT tokens
4. **Systematically test each functional area**
5. **Monitor performance and error rates**
6. **Document any issues or unexpected behavior**

## 📞 Support

If you encounter issues:
1. Check the application logs
2. Verify environment variables
3. Test with Postman's console output
4. Check the Swagger UI documentation at `{{base_url}}/swagger-ui/index.html`

---

**Happy Testing! 🎉**

This comprehensive collection covers every aspect of your Pickup Sports App, from basic health checks to advanced AI features. Test systematically and enjoy exploring your application's full capabilities!
