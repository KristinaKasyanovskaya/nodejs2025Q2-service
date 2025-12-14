#!/bin/bash

BASE_URL="http://localhost:4000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Verification of All Completed Requirements"
echo "=========================================="
echo ""

# Check that application is running
if ! curl -s http://localhost:4000/ > /dev/null 2>&1; then
    echo -e "${RED}❌ Application is not running!${NC}"
    echo "Start it with: npm run start:dev"
    exit 1
fi

echo -e "${GREEN}✅ Application is running${NC}"
echo ""

# ==========================================
# AUTHENTICATION & AUTHORIZATION
# ==========================================

echo "=== AUTHENTICATION & AUTHORIZATION ==="
echo ""

# 1. Signup
echo "1. POST /auth/signup"
SIGNUP_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser'$(date +%s)'","password":"test123"}')
HTTP_CODE=$(echo "$SIGNUP_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$SIGNUP_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ Signup works (201)${NC}"
    USER_ID=$(echo "$BODY" | jq -r '.id')
else
    echo -e "${RED}❌ Signup error: $HTTP_CODE${NC}"
fi
echo ""

# 2. Login
echo "2. POST /auth/login"
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser'$(date +%s)'","password":"test123"}' 2>/dev/null)
HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Login works (200)${NC}"
    TOKEN=$(echo "$BODY" | jq -r '.accessToken // empty')
    REFRESH_TOKEN=$(echo "$BODY" | jq -r '.refreshToken // empty')
    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✅ Access token received${NC}"
    fi
    if [ -n "$REFRESH_TOKEN" ]; then
        echo -e "${GREEN}✅ Refresh token received${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Login requires existing user${NC}"
    # Create user and login
    SIGNUP_RESPONSE=$(curl -s -X POST $BASE_URL/auth/signup \
      -H "Content-Type: application/json" \
      -d '{"login":"checkuser'$(date +%s)'","password":"test123"}')
    USER_ID=$(echo "$SIGNUP_RESPONSE" | jq -r '.id')
    
    if [ -n "$USER_ID" ]; then
        LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
          -H "Content-Type: application/json" \
          -d '{"login":"checkuser'$(date +%s)'","password":"test123"}')
        TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken // empty')
        REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken // empty')
    fi
fi
echo ""

# 3. Protected route with token
if [ -n "$TOKEN" ]; then
    echo "3. GET /user (with token)"
    PROTECTED_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET $BASE_URL/user \
      -H "Authorization: Bearer $TOKEN" \
      -H "Accept: application/json")
    HTTP_CODE=$(echo "$PROTECTED_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Protected route works with token (200)${NC}"
    else
        echo -e "${RED}❌ Error: $HTTP_CODE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Token not received, skipping check${NC}"
fi
echo ""

# 4. Protected route without token (401)
echo "4. GET /user (without token - should be 401)"
NO_TOKEN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET $BASE_URL/user \
  -H "Accept: application/json")
HTTP_CODE=$(echo "$NO_TOKEN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ Guard works - returns 401 without token${NC}"
else
    echo -e "${RED}❌ Expected 401, got: $HTTP_CODE${NC}"
fi
echo ""

# 5. Refresh
if [ -n "$REFRESH_TOKEN" ]; then
    echo "5. POST /auth/refresh"
    REFRESH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST $BASE_URL/auth/refresh \
      -H "Content-Type: application/json" \
      -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
    HTTP_CODE=$(echo "$REFRESH_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Refresh works (200)${NC}"
    else
        echo -e "${RED}❌ Refresh error: $HTTP_CODE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Refresh token not received, skipping check${NC}"
fi
echo ""

# 6. Signup validation (400)
echo "6. POST /auth/signup (validation - should be 400)"
VALIDATION_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{}')
HTTP_CODE=$(echo "$VALIDATION_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✅ Validation works (400)${NC}"
else
    echo -e "${RED}❌ Expected 400, got: $HTTP_CODE${NC}"
fi
echo ""

# ==========================================
# LOGGING & ERROR HANDLING
# ==========================================

echo "=== LOGGING & ERROR HANDLING ==="
echo ""

# Check log files
if [ -f "logs/app.log" ]; then
    echo -e "${GREEN}✅ File logs/app.log exists${NC}"
    
    # Check entries
    if grep -q "Incoming Request" logs/app.log; then
        echo -e "${GREEN}✅ Requests are logged${NC}"
    fi
    
    if grep -q "Outgoing Response" logs/app.log; then
        echo -e "${GREEN}✅ Responses are logged${NC}"
    fi
    
    if grep -q "ExceptionFilter" logs/app.log; then
        echo -e "${GREEN}✅ Exception Filter works${NC}"
    fi
else
    echo -e "${RED}❌ File logs/app.log not found${NC}"
fi

if [ -f "logs/error.log" ]; then
    echo -e "${GREEN}✅ File logs/error.log exists${NC}"
else
    echo -e "${YELLOW}⚠️  File logs/error.log not created yet (will be created on first error)${NC}"
fi

echo ""
echo "Last 5 lines of logs:"
tail -n 5 logs/app.log 2>/dev/null || echo "Logs are empty"
echo ""

echo "=========================================="
echo "Verification completed!"
echo "Detailed logs: tail -f logs/app.log"
echo "=========================================="
