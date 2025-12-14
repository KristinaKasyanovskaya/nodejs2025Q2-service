#!/bin/bash

BASE_URL="http://localhost:4000"

echo "========================================="
echo "Testing Logging & Error Handling"
echo "========================================="
echo ""

echo "=== Test 1: LoggingService - Basic logging ==="
echo "Sending GET request to /user..."
curl -s "$BASE_URL/user" -H "Accept: application/json" > /dev/null
echo "✓ Request sent. Check logs in console or file."
echo ""

echo "=== Test 2: Exception Filter - BadRequestException (400) ==="
echo "Sending request with invalid UUID..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/user/invalid-uuid" -H "Accept: application/json")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')
echo "Response: $BODY"
echo "HTTP Status: $HTTP_STATUS"
echo "✓ Check logs for [ERROR] entries from ExceptionFilter"
echo ""

echo "=== Test 3: Logging request with query parameters ==="
echo "Sending GET request with query parameters..."
curl -s -X GET "$BASE_URL/user?test=123&foo=bar" -H "Accept: application/json" > /dev/null
echo "✓ Check logs: should contain URL and query parameters"
echo ""

echo "=== Test 4: Logging POST request with body ==="
echo "Sending POST request with body..."
curl -s -X POST "$BASE_URL/user" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"login":"testuser123","password":"secretpass123"}' > /dev/null
echo "✓ Check logs: should contain URL, body (password should be ***)"
echo ""

echo "=== Test 5: Various status codes ==="
echo "Test 200 OK..."
curl -s "$BASE_URL/user" -H "Accept: application/json" > /dev/null
echo "✓ Check logs for status 200"
echo "Test 404 Not Found (if endpoint doesn't exist)..."
curl -s "$BASE_URL/nonexistent-endpoint" -H "Accept: application/json" > /dev/null
echo "✓ Check logs for status 404"
echo ""

echo "=== Test 6: Validation error (400) ==="
echo "Sending invalid request..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/user" \
  -H "Content-Type: application/json" \
  -d '{}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')
echo "Response: $BODY"
echo "HTTP Status: $HTTP_STATUS"
echo "✓ Check logs for validation errors"
echo ""

echo "========================================="
echo "Main tests completed!"
echo ""
echo "For testing uncaughtException and unhandledRejection"
echo "see instructions in TEST_LOGGING.md"
echo "========================================="
