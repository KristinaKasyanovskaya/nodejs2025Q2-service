# Verification Instructions for All Requirements

## 🔧 Preparation

### 1. Ensure .env file exists and contains:

```bash
PORT=4000
JWT_SECRET=your-secret-key-here
JWT_SECRET_REFRESH_KEY=your-refresh-key
LOG_LEVEL=log
LOG_FILE=app.log
ERROR_LOG_FILE=error.log
LOG_DIR=logs
LOG_MAX_FILE_SIZE_KB=100
```

### 2. Start the application

```bash
npm run start:dev
```

Wait for: `Application is running on: http://localhost:4000`

### 3. Open terminal to view logs

```bash
tail -f logs/app.log
```

---

## ✅ BASIC SCOPE - Logging & Error Handling

### 1. Custom LoggingService (+20)

**Verification:**
```bash
curl http://localhost:4000/
```

**Expected result in logs/app.log:**
```
2025-12-14T...Z [LOG    ] [LoggingInterceptor] Incoming Request: {...}
2025-12-14T...Z [LOG    ] [LoggingInterceptor] Outgoing Response: {...}
```

**What to check:**
- ✅ Log entries have format: `[TIMESTAMP] [LEVEL] [CONTEXT] message`
- ✅ Logging levels: `[LOG]`, `[ERROR]`, `[WARN]`, `[DEBUG]`, `[VERBOSE]`
- ✅ Contexts: `[LoggingInterceptor]`, `[ExceptionFilter]`, `[Bootstrap]`
- ✅ Timestamps in ISO format

**Status:** ✅ If logs appear with correct format - working

---

### 2. Custom Exception Filter (+20)

**Verification 2.1: Validation error (400)**
```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected result:**
- HTTP response: `{"statusCode":400,"message":[...]}`
- In logs: `[ERROR] [ExceptionFilter]` with status 400

**Verification 2.2: Route not found (404)**
```bash
curl http://localhost:4000/nonexistent-route
```

**Expected result:**
- HTTP response: `{"statusCode":404,"message":"Cannot GET /nonexistent-route"}`
- In logs: `[ERROR] [ExceptionFilter]` with status 404

**What to check:**
- ✅ All exceptions are handled by ExceptionFilter
- ✅ Correct HTTP status codes are returned
- ✅ Errors are logged with full information (method, url, statusCode, message, stack)

**Status:** ✅ If errors are logged and correct statuses are returned - working

---

### 3. Logging for request and response (+20)

**Verification 3.1: Simple GET request**
```bash
curl http://localhost:4000/
```

**Expected result in logs:**
```json
{
  "method": "GET",
  "url": "/"
}

{
  "method": "GET",
  "url": "/",
  "statusCode": 200,
  "duration": "5ms"
}
```

**Verification 3.2: GET with query parameters**
```bash
curl "http://localhost:4000/?test=123&foo=bar"
```

**Expected result in logs:**
```json
{
  "method": "GET",
  "url": "/",
  "query": {
    "test": "123",
    "foo": "bar"
  }
}
```

**Verification 3.3: POST with body**
```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"test123"}'
```

**Expected result in logs:**
```json
{
  "method": "POST",
  "url": "/auth/signup",
  "body": {
    "login": "testuser",
    "password": "***"
  }
}

{
  "method": "POST",
  "url": "/auth/signup",
  "statusCode": 201,
  "duration": "15ms"
}
```

**What to check:**
- ✅ Method is logged (GET, POST, PUT, DELETE)
- ✅ URL is logged
- ✅ Query parameters are logged (if present)
- ✅ Body is logged (passwords masked as `***`)
- ✅ Response status code is logged
- ✅ Duration is logged (processing time)

**Status:** ✅ If all data is logged - working

---

### 4. Error handling with HTTP status and logging (+20)

**Verification of various errors:**

```bash
# Validation error (400)
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{}'

# Route not found (404)
curl http://localhost:4000/nonexistent

# Unauthorized access (401)
curl http://localhost:4000/user

# Invalid UUID (400) - requires token
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"test123"}' | jq -r '.accessToken')

curl -X GET http://localhost:4000/user/invalid-uuid \
  -H "Authorization: Bearer $TOKEN"
```

**What to check:**
- ✅ Errors are logged with `[ERROR]` level
- ✅ Correct HTTP status codes are returned:
  - 400 for validation errors
  - 401 for unauthorized requests
  - 403 for forbidden operations
  - 404 for not found resources
  - 500 for internal errors
- ✅ Full error information is in logs

**Status:** ✅ If all errors are logged and correct statuses are returned - working

---

### 5. uncaughtException event (+10)

**Code verification:**
```bash
grep -A 5 "uncaughtException" src/main.ts
```

**Expected result:**
```typescript
process.on('uncaughtException', (error: Error) => {
  loggingService.error(
    `Uncaught Exception: ${error.message}\n${error.stack || ''}`,
    'UncaughtException',
  );
  process.exit(1);
});
```

**What to check:**
- ✅ Code exists in `src/main.ts`
- ✅ Errors are logged via LoggingService
- ✅ Application exits on uncaughtException

**Status:** ✅ If code exists - working

---

### 6. unhandledRejection event (+10)

**Code verification:**
```bash
grep -A 5 "unhandledRejection" src/main.ts
```

**Expected result:**
```typescript
process.on('unhandledRejection', (reason: unknown) => {
  const errorMessage =
    reason instanceof Error
      ? `Unhandled Rejection: ${reason.message}\n${reason.stack || ''}`
      : `Unhandled Rejection: ${String(reason)}`;
  loggingService.error(errorMessage, 'UnhandledRejection');
});
```

**What to check:**
- ✅ Code exists in `src/main.ts`
- ✅ Errors are logged via LoggingService
- ✅ Application continues running (does not exit)

**Status:** ✅ If code exists - working

---

## ✅ BASIC SCOPE - Authentication & Authorization

### 7. Route /auth/signup (+30)

**Verification 7.1: Successful registration (201)**
```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"login":"newuser'$(date +%s)'","password":"test123"}'
```

**Expected result:**
- HTTP status: `201 Created`
- Response contains: `id`, `login`, `version`, `createdAt`, `updatedAt`
- Password is NOT returned

**Verification 7.2: Validation error (400)**
```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected result:**
- HTTP status: `400 Bad Request`
- Validation error message

**Code verification:**
```bash
# Check that logic is separated between controller and service
grep -A 5 "signup" src/auth/auth.controller.ts
grep -A 10 "signup" src/auth/auth.service.ts
```

**What to check:**
- ✅ Controller calls service
- ✅ Registration logic in service
- ✅ Correct HTTP statuses (201, 400)
- ✅ Password not returned in response

**Status:** ✅ If everything works correctly - working

---

### 8. Route /auth/login (+30)

**Verification 8.1: Successful login (200)**
```bash
# First register
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"test123"}'

# Then login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"test123"}'
```

**Expected result:**
- HTTP status: `200 OK`
- Response contains: `accessToken` and `refreshToken`

**Verification 8.2: Validation error (400)**
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser"}'
```

**Expected result:**
- HTTP status: `400 Bad Request`

**Verification 8.3: Authentication error (403)**
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"wrongpassword"}'
```

**Expected result:**
- HTTP status: `403 Forbidden`
- Message: "Invalid login or password"

**Code verification:**
```bash
grep -A 5 "login" src/auth/auth.controller.ts
grep -A 15 "login" src/auth/auth.service.ts
```

**What to check:**
- ✅ Controller calls service
- ✅ Authentication logic in service
- ✅ Correct HTTP statuses (200, 400, 403)
- ✅ Tokens are returned

**Status:** ✅ If everything works correctly - working

---

### 9. User password saved as hash (+10)

**Verification:**
```bash
# Register a user
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"rawpassword123"}'

# Check code - password should be hashed in UserService
# Password should NOT be returned in API responses
```

**Code verification:**
```bash
# Check that bcrypt is used
grep -i "bcrypt" src/auth/auth.service.ts src/user/user.service.ts

# Check that password is not returned
grep "Omit.*password" src/user/user.controller.ts
grep "Omit.*password" src/auth/auth.controller.ts
```

**What to check:**
- ✅ Password is hashed using bcrypt
- ✅ Password is NOT returned in API responses
- ✅ `Omit<User, 'password'>` is used in controllers

**Status:** ✅ If password is hashed and not returned - working

---

### 10. Access Token with userId and login (+20)

**Verification:**
```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"test123"}' | jq -r '.accessToken')

# Decode token (can use jwt.io or node)
node -e "const jwt = require('jsonwebtoken'); const decoded = jwt.decode('$TOKEN'); console.log(JSON.stringify(decoded, null, 2));"
```

**Expected result in payload:**
```json
{
  "userId": "uuid-v4",
  "login": "testuser",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Verification .env:**
```bash
grep JWT_SECRET .env
```

**What to check:**
- ✅ Token contains `userId` in payload
- ✅ Token contains `login` in payload
- ✅ Token has expiration time (`exp`)
- ✅ `JWT_SECRET` is specified in `.env`

**Status:** ✅ If token contains userId and login - working

---

### 11. Authentication required for all routes except exceptions (+40)

**Verification 11.1: Public routes (do not require token)**
```bash
# /auth/signup
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"login":"test","password":"test123"}'
# Should work without token

# /auth/login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"test","password":"test123"}'
# Should work without token

# /auth/refresh
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"..."}'
# Should work without token

# /doc
curl http://localhost:4000/doc
# Should work without token

# /
curl http://localhost:4000/
# Should work without token
```

**Verification 11.2: Protected routes (require token)**
```bash
# Without token - should be 401
curl http://localhost:4000/user
# Expected: {"statusCode":401,"message":"Access token is missing or invalid"}

# With token - should be 200
TOKEN="your_access_token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/user
# Expected: 200 OK with data

# Check other protected routes
curl http://localhost:4000/track
curl http://localhost:4000/artist
curl http://localhost:4000/album
# All should return 401 without token
```

**Code verification:**
```bash
# Check that Guard is applied globally
grep "APP_GUARD" src/app.module.ts

# Check publicRoutes in Guard
grep "publicRoutes" src/auth/jwt-auth.guard.ts
```

**What to check:**
- ✅ Public routes work without token
- ✅ Protected routes require token (401 without token)
- ✅ Guard is applied globally via APP_GUARD
- ✅ Bearer scheme is used: `Authorization: Bearer <token>`

**Status:** ✅ If protected routes require token and public routes don't - working

---

### 12. Separate module for JWT token checking (+10)

**Structure verification:**
```bash
# Check that AuthModule exists
ls -la src/auth/

# Check that JwtAuthGuard exists
cat src/auth/jwt-auth.guard.ts | head -20

# Check that Guard is applied in AppModule
grep -A 3 "APP_GUARD" src/app.module.ts
```

**What to check:**
- ✅ Separate module exists (AuthModule)
- ✅ Guard exists (JwtAuthGuard)
- ✅ Guard checks JWT token
- ✅ Guard is applied globally

**Status:** ✅ If structure is correct - working

---

## ✅ ADVANCED SCOPE - Logging & Error Handling

### 13. Logs written to file (+20)

**Verification:**
```bash
# Execute a request
curl http://localhost:4000/

# Check file
ls -la logs/app.log
cat logs/app.log | tail -5
```

**Expected result:**
- ✅ File `logs/app.log` exists
- ✅ File contains log entries about requests

**Status:** ✅ If logs are written to file - working

---

### 14. Log file rotation with size (+10)

**Verification:**
```bash
# Check rotation code
grep -A 20 "rotateLogIfNeeded" src/logging/logging.service.ts

# Temporarily reduce size for testing (in .env)
LOG_MAX_FILE_SIZE_KB=1

# Restart application
# Execute many requests
for i in {1..200}; do curl -s http://localhost:4000/ > /dev/null; done

# Check rotation
ls -la logs/ | grep app.log
```

**Expected result:**
- ✅ Files like `app-2025-12-14T...log` are created
- ✅ Old files are rotated

**IMPORTANT:** Restore normal file size after testing!

**Status:** ✅ If files are rotated - working

---

### 15. Environment variable for max file size (+10)

**Verification:**
```bash
# Check .env
grep LOG_MAX_FILE_SIZE_KB .env

# Check code
grep "LOG_MAX_FILE_SIZE_KB" src/logging/logging.service.ts
```

**Expected result:**
- ✅ `.env` contains `LOG_MAX_FILE_SIZE_KB=100`
- ✅ Code reads value from `process.env.LOG_MAX_FILE_SIZE_KB`

**Status:** ✅ If variable is used - working

---

### 16. Error logs in separate file (+10)

**Verification:**
```bash
# Create an error
curl http://localhost:4000/nonexistent-route

# Check both files
ls -la logs/
tail -5 logs/app.log
tail -5 logs/error.log  # Should contain only errors
```

**Expected result:**
- ✅ File `logs/error.log` exists
- ✅ Contains only errors (ERROR level)
- ✅ Errors are also in `app.log`

**Status:** ✅ If errors are in separate file - working

---

### 17. Environment variable for logging level (+20)

**Verification 17.1: Different levels**

```bash
# In .env set LOG_LEVEL=error
LOG_LEVEL=error
# Restart application
# Execute requests - only errors should be logged

# In .env set LOG_LEVEL=log
LOG_LEVEL=log
# Restart application
# Execute requests - error, warn, log should be logged

# In .env set LOG_LEVEL=verbose
LOG_LEVEL=verbose
# Restart application
# Execute requests - all levels should be logged
```

**Code verification:**
```bash
grep "LOG_LEVEL" src/logging/logging.service.ts
grep "setLogLevel" src/logging/logging.service.ts
```

**What to check:**
- ✅ Level is read from `process.env.LOG_LEVEL`
- ✅ When level is N, levels 0..N are logged
- ✅ Nest.js levels are used: error, warn, log, debug, verbose

**Status:** ✅ If levels work correctly - working

---

## ✅ ADVANCED SCOPE - Authentication & Authorization

### 18. Route /auth/refresh (+30)

**Verification 18.1: Successful refresh (200)**
```bash
# Get refresh token
RESPONSE=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"test123"}')

REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')

# Refresh tokens
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

**Expected result:**
- HTTP status: `200 OK`
- Response contains: `accessToken` and `refreshToken` (new)

**Verification 18.2: Missing refreshToken (401)**
```bash
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected result:**
- HTTP status: `401 Unauthorized` or `400 Bad Request`

**Verification 18.3: Invalid refreshToken (403)**
```bash
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"invalid_token"}'
```

**Expected result:**
- HTTP status: `403 Forbidden`
- Message: "Invalid refresh token"

**Code verification:**
```bash
grep -A 5 "refresh" src/auth/auth.controller.ts
grep -A 15 "refresh" src/auth/auth.service.ts
```

**What to check:**
- ✅ Controller calls service
- ✅ Token refresh logic in service
- ✅ Correct HTTP statuses (200, 401, 403)
- ✅ Refresh token has longer lifetime than access token

**Status:** ✅ If everything works correctly - working

---

## 🔍 Quick verification of all items

### Script for automatic verification:

```bash
#!/bin/bash

BASE_URL="http://localhost:4000"

echo "=== Checking Logging ==="
curl -s $BASE_URL/ > /dev/null
sleep 1
tail -n 10 logs/app.log | grep -E "(Incoming|Outgoing)" && echo "✅ Logging works"

echo "=== Checking Exception Filter ==="
curl -s -X POST $BASE_URL/auth/signup -H "Content-Type: application/json" -d '{}' | grep -q "400" && echo "✅ Exception Filter works"

echo "=== Checking Authentication ==="
curl -s -X POST $BASE_URL/auth/signup -H "Content-Type: application/json" -d '{"login":"test","password":"test123"}' | grep -q "id" && echo "✅ Signup works"

curl -s $BASE_URL/user | grep -q "401" && echo "✅ Guard works (401 without token)"

echo "=== Checking Refresh ==="
TOKEN=$(curl -s -X POST $BASE_URL/auth/login -H "Content-Type: application/json" -d '{"login":"test","password":"test123"}' | jq -r '.refreshToken 2>/dev/null')
if [ -n "$TOKEN" ]; then
  curl -s -X POST $BASE_URL/auth/refresh -H "Content-Type: application/json" -d "{\"refreshToken\":\"$TOKEN\"}" | grep -q "accessToken" && echo "✅ Refresh works"
fi
```

---

## ✅ Final checklist

### Logging & Error Handling
- [ ] Custom LoggingService logs with correct format
- [ ] Exception Filter handles all errors
- [ ] Requests are logged (method, URL, query, body)
- [ ] Responses are logged (status code, duration)
- [ ] Errors are logged and correct statuses are returned
- [ ] uncaughtException is logged
- [ ] unhandledRejection is logged
- [ ] Logs are written to file
- [ ] File rotation works
- [ ] LOG_MAX_FILE_SIZE_KB in .env
- [ ] Errors in separate file
- [ ] LOG_LEVEL in .env works correctly

### Authentication & Authorization
- [ ] POST /auth/signup works (201, 400)
- [ ] POST /auth/login works (200, 400, 403)
- [ ] Passwords are hashed
- [ ] Access Token contains userId and login
- [ ] JWT_SECRET in .env
- [ ] Protected routes require token (401)
- [ ] Public routes work without token
- [ ] Separate module for JWT checking
- [ ] POST /auth/refresh works (200, 401, 403)

---

## 🎯 Running tests

```bash
# Authentication tests
npm run test:auth

# All tests
npm test

# Linting
npm run lint
```
