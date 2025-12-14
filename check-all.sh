#!/bin/bash

BASE_URL="http://localhost:4000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Проверка всех выполненных пунктов"
echo "=========================================="
echo ""

# Проверка что приложение запущено
if ! curl -s http://localhost:4000/ > /dev/null 2>&1; then
    echo -e "${RED}❌ Приложение не запущено!${NC}"
    echo "Запустите: npm run start:dev"
    exit 1
fi

echo -e "${GREEN}✅ Приложение запущено${NC}"
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
    echo -e "${GREEN}✅ Signup работает (201)${NC}"
    USER_ID=$(echo "$BODY" | jq -r '.id')
else
    echo -e "${RED}❌ Signup ошибка: $HTTP_CODE${NC}"
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
    echo -e "${GREEN}✅ Login работает (200)${NC}"
    TOKEN=$(echo "$BODY" | jq -r '.accessToken // empty')
    REFRESH_TOKEN=$(echo "$BODY" | jq -r '.refreshToken // empty')
    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✅ Access token получен${NC}"
    fi
    if [ -n "$REFRESH_TOKEN" ]; then
        echo -e "${GREEN}✅ Refresh token получен${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Login требует существующего пользователя${NC}"
    # Создаем пользователя и логинимся
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

# 3. Защищенный роут с токеном
if [ -n "$TOKEN" ]; then
    echo "3. GET /user (с токеном)"
    PROTECTED_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET $BASE_URL/user \
      -H "Authorization: Bearer $TOKEN" \
      -H "Accept: application/json")
    HTTP_CODE=$(echo "$PROTECTED_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Защищенный роут работает с токеном (200)${NC}"
    else
        echo -e "${RED}❌ Ошибка: $HTTP_CODE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Токен не получен, пропуск проверки${NC}"
fi
echo ""

# 4. Защищенный роут без токена (401)
echo "4. GET /user (без токена - должно быть 401)"
NO_TOKEN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET $BASE_URL/user \
  -H "Accept: application/json")
HTTP_CODE=$(echo "$NO_TOKEN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ Guard работает - возвращает 401 без токена${NC}"
else
    echo -e "${RED}❌ Ожидался 401, получен: $HTTP_CODE${NC}"
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
        echo -e "${GREEN}✅ Refresh работает (200)${NC}"
    else
        echo -e "${RED}❌ Refresh ошибка: $HTTP_CODE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Refresh token не получен, пропуск проверки${NC}"
fi
echo ""

# 6. Валидация signup (400)
echo "6. POST /auth/signup (валидация - должно быть 400)"
VALIDATION_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{}')
HTTP_CODE=$(echo "$VALIDATION_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✅ Валидация работает (400)${NC}"
else
    echo -e "${RED}❌ Ожидался 400, получен: $HTTP_CODE${NC}"
fi
echo ""

# ==========================================
# LOGGING & ERROR HANDLING
# ==========================================

echo "=== LOGGING & ERROR HANDLING ==="
echo ""

# Проверка файлов логов
if [ -f "logs/app.log" ]; then
    echo -e "${GREEN}✅ Файл logs/app.log существует${NC}"
    
    # Проверка записей
    if grep -q "Incoming Request" logs/app.log; then
        echo -e "${GREEN}✅ Запросы логируются${NC}"
    fi
    
    if grep -q "Outgoing Response" logs/app.log; then
        echo -e "${GREEN}✅ Ответы логируются${NC}"
    fi
    
    if grep -q "ExceptionFilter" logs/app.log; then
        echo -e "${GREEN}✅ Exception Filter работает${NC}"
    fi
else
    echo -e "${RED}❌ Файл logs/app.log не найден${NC}"
fi

if [ -f "logs/error.log" ]; then
    echo -e "${GREEN}✅ Файл logs/error.log существует${NC}"
else
    echo -e "${YELLOW}⚠️  Файл logs/error.log пока не создан (создастся при первой ошибке)${NC}"
fi

echo ""
echo "Последние 5 строк логов:"
tail -n 5 logs/app.log 2>/dev/null || echo "Логи пока пусты"
echo ""

echo "=========================================="
echo "Проверка завершена!"
echo "Подробные логи: tail -f logs/app.log"
echo "=========================================="

