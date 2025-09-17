# 🚀 Postman Testing Guide - Pickup Sports App Phase 5C

## 📥 Import Instructions

### 1. Import the Collection
- Open Postman
- Click **Import** button
- Drag and drop `Pickup_Sports_App_Phase_5C.postman_collection.json` or click to browse

### 2. Import the Environment
- Click **Import** button again
- Drag and drop `Pickup_Sports_App_Environment.postman_environment.json`
- Select the environment from the dropdown in the top-right corner

## 🧪 Testing Sequence

### Phase 1: Basic Health Checks
Start with these to ensure the application is running:

1. **Main Application** - Should return: `Pickup Sports API is running`
2. **Health Check** - Should return JSON with status (may show "DOWN" but that's normal)
3. **Readiness Health** - Should return: `{"status":"UP"}`
4. **Liveness Health** - Should return: `{"status":"UP"}`

### Phase 2: API Documentation
5. **Swagger UI** - Should load the Swagger documentation page
6. **OpenAPI JSON** - Should return the API specification

### Phase 3: Security Testing (Unauthenticated)
Test that protected endpoints properly reject unauthorized access:

7. **Test User Stats - No Auth** - Should return: `401 Unauthorized`
8. **Test User Achievements - No Auth** - Should return: `401 Unauthorized`

### Phase 4: User Analytics Endpoints (Phase 5C)
These will return 401 until you have authentication tokens:

9. **Get User Statistics** - `GET /api/v1/users/{username}/stats`
10. **Get User Game History** - `GET /api/v1/users/{username}/game-history`
11. **Get User Achievements** - `GET /api/v1/users/{username}/achievements`
12. **Get User Social Connections** - `GET /api/v1/users/{username}/social-connections`
13. **Get User Preferences** - `GET /api/v1/users/{username}/preferences`

## 🔐 Expected Responses

### ✅ Successful Responses
- **Health endpoints**: JSON with status information
- **Main endpoint**: `Pickup Sports API is running`
- **Swagger UI**: HTML page loads

### 🔒 Authentication Required (401)
- **User analytics endpoints**: 
```json
{
  "path": "/api/v1/users/test/stats",
  "error": "unauthenticated",
  "message": "Authentication is required",
  "status": 401
}
```

## 🎯 Test Scenarios

### Scenario 1: Application Startup
- **Goal**: Verify application is running and healthy
- **Tests**: 1-4 (Health checks)
- **Expected**: All endpoints respond, health may show "DOWN" (normal)

### Scenario 2: Security Validation
- **Goal**: Ensure protected endpoints are properly secured
- **Tests**: 7-8 (Unauthenticated access)
- **Expected**: All return 401 Unauthorized

### Scenario 3: API Documentation
- **Goal**: Verify API documentation is accessible
- **Tests**: 5-6 (Swagger and OpenAPI)
- **Expected**: Documentation loads properly

### Scenario 4: Phase 5C Features
- **Goal**: Test new user analytics endpoints
- **Tests**: 9-13 (User analytics)
- **Expected**: All return 401 (correct behavior without auth)

## 🔧 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if application is running on port 8080
   - Verify database is running: `docker ps | grep pickup_db`

2. **401 Unauthorized**
   - This is **CORRECT** behavior for protected endpoints
   - Means security is working properly

3. **Health Shows "DOWN"**
   - This is normal - some health indicators may be failing
   - Application is still functional

4. **Database Connection Issues**
   - Ensure PostgreSQL container is running: `docker-compose ps`
   - Check database logs: `docker-compose logs db`

### Quick Commands
```bash
# Check application status
curl http://localhost:8080/

# Check database
docker ps | grep pickup_db

# View application logs
docker-compose logs app

# Restart application
docker-compose restart app
```

## 📊 Success Criteria

### ✅ Phase 5C Complete When:
- [ ] All health endpoints respond
- [ ] Main application endpoint returns success message
- [ ] Swagger UI loads
- [ ] All user analytics endpoints return 401 (security working)
- [ ] No connection errors or 500 responses
- [ ] Response times under 5 seconds

## 🎉 What You're Testing

This collection validates that **Phase 5C: User Analytics and Social Features** is working correctly:

- **User Statistics**: Game counts, ratings, streaks
- **Game History**: Detailed participation records
- **Achievements**: Badges and milestones
- **Social Connections**: Player interactions
- **User Preferences**: Sports, venues, time preferences

All endpoints are properly secured and return appropriate responses!

---

**Happy Testing! 🚀⚽**
