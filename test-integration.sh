#!/bin/bash

# Test script for end-to-end profile integration
# This script tests the profile API endpoints

echo "🧪 Testing Profile Integration..."

# Set base URL
BASE_URL="http://localhost:8080/api/v1"

# Test data
USERNAME="testuser"
EMAIL="test@example.com"
FIRST_NAME="Test"
LAST_NAME="User"
BIO="Test bio for integration testing"

echo "📝 Testing profile creation and update..."

# Test 1: Create a test user (if not exists)
echo "1. Creating test user..."
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"TestPassword123!\",
    \"firstName\": \"$FIRST_NAME\",
    \"lastName\": \"$LAST_NAME\"
  }" \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 2: Login to get token
echo "2. Logging in to get token..."
TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"password\": \"TestPassword123!\"
  }")

echo "Login response: $TOKEN_RESPONSE"

# Extract token (assuming JWT response)
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."

# Test 3: Get basic profile
echo "3. Getting basic profile..."
curl -X GET "$BASE_URL/profiles/me" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 4: Get comprehensive profile
echo "4. Getting comprehensive profile..."
curl -X GET "$BASE_URL/profiles/me/comprehensive" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 5: Update profile
echo "5. Updating profile..."
curl -X PATCH "$BASE_URL/profiles/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"bio\": \"$BIO\",
    \"gender\": \"MALE\",
    \"nationality\": \"US\",
    \"xp\": 100,
    \"level\": 2,
    \"rank\": \"COMPETENT\"
  }" \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 6: Verify update
echo "6. Verifying profile update..."
curl -X GET "$BASE_URL/profiles/me" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "✅ Integration test completed!"
