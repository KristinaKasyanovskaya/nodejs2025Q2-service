#!/bin/bash

BASE_URL="http://localhost:4000"

echo "========================================="
echo "Тестирование Logging & Error Handling"
echo "========================================="
echo ""

echo "=== Тест 1: LoggingService - Базовое логирование ==="
echo "Отправка GET запроса к /user..."
curl -s "$BASE_URL/user" -H "Accept: application/json" > /dev/null
echo "✓ Запрос отправлен. Проверьте логи в консоли или файле."
echo ""

echo "=== Тест 2: Exception Filter - BadRequestException (400) ==="
echo "Отправка запроса с невалидным UUID..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/user/invalid-uuid" -H "Accept: application/json")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')
echo "Ответ: $BODY"
echo "HTTP Status: $HTTP_STATUS"
echo "✓ Проверьте логи на наличие [ERROR] записей от ExceptionFilter"
echo ""

echo "=== Тест 3: Логирование запроса с query параметрами ==="
echo "Отправка GET запроса с query параметрами..."
curl -s -X GET "$BASE_URL/user?test=123&foo=bar" -H "Accept: application/json" > /dev/null
echo "✓ Проверьте логи: должны быть URL и query параметры"
echo ""

echo "=== Тест 4: Логирование POST запроса с body ==="
echo "Отправка POST запроса с телом..."
curl -s -X POST "$BASE_URL/user" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"login":"testuser123","password":"secretpass123"}' > /dev/null
echo "✓ Проверьте логи: должны быть URL, body (пароль должен быть ***)"
echo ""

echo "=== Тест 5: Различные статус коды ==="
echo "Тест 200 OK..."
curl -s "$BASE_URL/user" -H "Accept: application/json" > /dev/null
echo "✓ Проверьте логи на статус 200"

echo "Тест 404 Not Found (если endpoint не существует)..."
curl -s "$BASE_URL/nonexistent-endpoint" -H "Accept: application/json" > /dev/null
echo "✓ Проверьте логи на статус 404"
echo ""

echo "=== Тест 6: Валидационная ошибка (400) ==="
echo "Отправка невалидного запроса..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/user" \
  -H "Content-Type: application/json" \
  -d '{}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')
echo "Ответ: $BODY"
echo "HTTP Status: $HTTP_STATUS"
echo "✓ Проверьте логи на наличие ошибок валидации"
echo ""

echo "========================================="
echo "Основные тесты завершены!"
echo ""
echo "Для тестирования uncaughtException и unhandledRejection"
echo "см. инструкции в TEST_LOGGING.md"
echo "========================================="

