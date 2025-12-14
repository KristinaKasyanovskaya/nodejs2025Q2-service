# Инструкция по проверке всех требований

## 🔧 Подготовка

### 1. Убедитесь, что .env файл создан и содержит:

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

### 2. Запустите приложение

```bash
npm run start:dev
```

Дождитесь: `Application is running on: http://localhost:4000`

### 3. Откройте терминал для просмотра логов

```bash
tail -f logs/app.log
```

---

## ✅ BASIC SCOPE - Logging & Error Handling

### 1. Custom LoggingService (+20)

**Проверка:**
```bash
curl http://localhost:4000/
```

**Ожидаемый результат в logs/app.log:**
```
2025-12-14T...Z [LOG    ] [LoggingInterceptor] Incoming Request: {...}
2025-12-14T...Z [LOG    ] [LoggingInterceptor] Outgoing Response: {...}
```

**Что проверить:**
- ✅ Записи имеют формат: `[TIMESTAMP] [LEVEL] [CONTEXT] message`
- ✅ Уровни логирования: `[LOG]`, `[ERROR]`, `[WARN]`, `[DEBUG]`, `[VERBOSE]`
- ✅ Контексты: `[LoggingInterceptor]`, `[ExceptionFilter]`, `[Bootstrap]`
- ✅ Временные метки в ISO формате

**Статус:** ✅ Если видны логи с правильным форматом - работает

---

### 2. Custom Exception Filter (+20)

**Проверка 2.1: Валидационная ошибка (400)**
```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Ожидаемый результат:**
- HTTP ответ: `{"statusCode":400,"message":[...]}`
- В логах: `[ERROR] [ExceptionFilter]` со статусом 400

**Проверка 2.2: Не найден роут (404)**
```bash
curl http://localhost:4000/nonexistent-route
```

**Ожидаемый результат:**
- HTTP ответ: `{"statusCode":404,"message":"Cannot GET /nonexistent-route"}`
- В логах: `[ERROR] [ExceptionFilter]` со статусом 404

**Что проверить:**
- ✅ Все исключения обрабатываются ExceptionFilter
- ✅ Возвращаются правильные HTTP статусы
- ✅ Ошибки логируются с полной информацией (method, url, statusCode, message, stack)

**Статус:** ✅ Если ошибки логируются и возвращаются правильные статусы - работает

---

### 3. Logging for request and response (+20)

**Проверка 3.1: Простой GET запрос**
```bash
curl http://localhost:4000/
```

**Ожидаемый результат в логах:**
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

**Проверка 3.2: GET с query параметрами**
```bash
curl "http://localhost:4000/?test=123&foo=bar"
```

**Ожидаемый результат в логах:**
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

**Проверка 3.3: POST с body**
```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"test123"}'
```

**Ожидаемый результат в логах:**
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

**Что проверить:**
- ✅ Логируется метод (GET, POST, PUT, DELETE)
- ✅ Логируется URL
- ✅ Логируются query параметры (если есть)
- ✅ Логируется body (пароли маскируются как `***`)
- ✅ Логируется status code ответа
- ✅ Логируется duration (время обработки)

**Статус:** ✅ Если все данные логируются - работает

---

### 4. Error handling with HTTP status and logging (+20)

**Проверка различных ошибок:**

```bash
# Валидационная ошибка (400)
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{}'

# Не найден роут (404)
curl http://localhost:4000/nonexistent

# Неавторизованный доступ (401)
curl http://localhost:4000/user

# Невалидный UUID (400) - требует токен
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"test123"}' | jq -r '.accessToken')

curl -X GET http://localhost:4000/user/invalid-uuid \
  -H "Authorization: Bearer $TOKEN"
```

**Что проверить:**
- ✅ Ошибки логируются с уровнем `[ERROR]`
- ✅ Возвращаются правильные HTTP статусы:
  - 400 для валидационных ошибок
  - 401 для неавторизованных запросов
  - 403 для запрещенных операций
  - 404 для не найденных ресурсов
  - 500 для внутренних ошибок
- ✅ В логах есть полная информация об ошибке

**Статус:** ✅ Если все ошибки логируются и возвращаются правильные статусы - работает

---

### 5. uncaughtException event (+10)

**Проверка кода:**
```bash
grep -A 5 "uncaughtException" src/main.ts
```

**Ожидаемый результат:**
```typescript
process.on('uncaughtException', (error: Error) => {
  loggingService.error(
    `Uncaught Exception: ${error.message}\n${error.stack || ''}`,
    'UncaughtException',
  );
  process.exit(1);
});
```

**Что проверить:**
- ✅ Код существует в `src/main.ts`
- ✅ Ошибки логируются через LoggingService
- ✅ Приложение завершается при uncaughtException

**Статус:** ✅ Если код есть - работает

---

### 6. unhandledRejection event (+10)

**Проверка кода:**
```bash
grep -A 5 "unhandledRejection" src/main.ts
```

**Ожидаемый результат:**
```typescript
process.on('unhandledRejection', (reason: unknown) => {
  const errorMessage =
    reason instanceof Error
      ? `Unhandled Rejection: ${reason.message}\n${reason.stack || ''}`
      : `Unhandled Rejection: ${String(reason)}`;
  loggingService.error(errorMessage, 'UnhandledRejection');
});
```

**Что проверить:**
- ✅ Код существует в `src/main.ts`
- ✅ Ошибки логируются через LoggingService
- ✅ Приложение продолжает работать (не останавливается)

**Статус:** ✅ Если код есть - работает

---

## ✅ BASIC SCOPE - Authentication & Authorization

### 7. Route /auth/signup (+30)

**Проверка 7.1: Успешная регистрация (201)**
```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"login":"newuser'$(date +%s)'","password":"test123"}'
```

**Ожидаемый результат:**
- HTTP статус: `201 Created`
- Ответ содержит: `id`, `login`, `version`, `createdAt`, `updatedAt`
- Пароль НЕ возвращается

**Проверка 7.2: Валидационная ошибка (400)**
```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Ожидаемый результат:**
- HTTP статус: `400 Bad Request`
- Сообщение об ошибках валидации

**Проверка кода:**
```bash
# Проверить что логика разделена между controller и service
grep -A 5 "signup" src/auth/auth.controller.ts
grep -A 10 "signup" src/auth/auth.service.ts
```

**Что проверить:**
- ✅ Контроллер вызывает сервис
- ✅ Логика регистрации в сервисе
- ✅ Правильные HTTP статусы (201, 400)
- ✅ Пароль не возвращается в ответе

**Статус:** ✅ Если все работает правильно - работает

---

### 8. Route /auth/login (+30)

**Проверка 8.1: Успешный вход (200)**
```bash
# Сначала зарегистрируйтесь
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"test123"}'

# Затем войдите
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"test123"}'
```

**Ожидаемый результат:**
- HTTP статус: `200 OK`
- Ответ содержит: `accessToken` и `refreshToken`

**Проверка 8.2: Валидационная ошибка (400)**
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser"}'
```

**Ожидаемый результат:**
- HTTP статус: `400 Bad Request`

**Проверка 8.3: Ошибка аутентификации (403)**
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"wrongpassword"}'
```

**Ожидаемый результат:**
- HTTP статус: `403 Forbidden`
- Сообщение: "Invalid login or password"

**Проверка кода:**
```bash
grep -A 5 "login" src/auth/auth.controller.ts
grep -A 15 "login" src/auth/auth.service.ts
```

**Что проверить:**
- ✅ Контроллер вызывает сервис
- ✅ Логика аутентификации в сервисе
- ✅ Правильные HTTP статусы (200, 400, 403)
- ✅ Возвращаются токены

**Статус:** ✅ Если все работает правильно - работает

---

### 9. User password saved as hash (+10)

**Проверка:**
```bash
# Зарегистрируйте пользователя
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"rawpassword123"}'

# Проверьте код - пароль должен быть захеширован в UserService
# Пароль НЕ должен возвращаться в API ответах
```

**Проверка кода:**
```bash
# Проверить что используется bcrypt
grep -i "bcrypt" src/auth/auth.service.ts src/user/user.service.ts

# Проверить что пароль не возвращается
grep "Omit.*password" src/user/user.controller.ts
grep "Omit.*password" src/auth/auth.controller.ts
```

**Что проверить:**
- ✅ Пароль хешируется с помощью bcrypt
- ✅ Пароль НЕ возвращается в API ответах
- ✅ Используется `Omit<User, 'password'>` в контроллерах

**Статус:** ✅ Если пароль хешируется и не возвращается - работает

---

### 10. Access Token with userId and login (+20)

**Проверка:**
```bash
# Войдите и получите токен
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"test123"}' | jq -r '.accessToken')

# Декодируйте токен (можно использовать jwt.io или node)
node -e "const jwt = require('jsonwebtoken'); const decoded = jwt.decode('$TOKEN'); console.log(JSON.stringify(decoded, null, 2));"
```

**Ожидаемый результат в payload:**
```json
{
  "userId": "uuid-v4",
  "login": "testuser",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Проверка .env:**
```bash
grep JWT_SECRET .env
```

**Что проверить:**
- ✅ Токен содержит `userId` в payload
- ✅ Токен содержит `login` в payload
- ✅ Токен имеет expiration time (`exp`)
- ✅ `JWT_SECRET` указан в `.env`

**Статус:** ✅ Если токен содержит userId и login - работает

---

### 11. Authentication required for all routes except exceptions (+40)

**Проверка 11.1: Публичные роуты (не требуют токена)**
```bash
# /auth/signup
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"login":"test","password":"test123"}'
# Должно работать без токена

# /auth/login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"test","password":"test123"}'
# Должно работать без токена

# /auth/refresh
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"..."}'
# Должно работать без токена

# /doc
curl http://localhost:4000/doc
# Должно работать без токена

# /
curl http://localhost:4000/
# Должно работать без токена
```

**Проверка 11.2: Защищенные роуты (требуют токен)**
```bash
# Без токена - должно быть 401
curl http://localhost:4000/user
# Ожидается: {"statusCode":401,"message":"Access token is missing or invalid"}

# С токеном - должно быть 200
TOKEN="ваш_access_token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/user
# Ожидается: 200 OK с данными

# Проверьте другие защищенные роуты
curl http://localhost:4000/track
curl http://localhost:4000/artist
curl http://localhost:4000/album
# Все должны возвращать 401 без токена
```

**Проверка кода:**
```bash
# Проверить что Guard применяется глобально
grep "APP_GUARD" src/app.module.ts

# Проверить publicRoutes в Guard
grep "publicRoutes" src/auth/jwt-auth.guard.ts
```

**Что проверить:**
- ✅ Публичные роуты работают без токена
- ✅ Защищенные роуты требуют токен (401 без токена)
- ✅ Guard применяется глобально через APP_GUARD
- ✅ Используется Bearer схема: `Authorization: Bearer <token>`

**Статус:** ✅ Если защищенные роуты требуют токен, а публичные нет - работает

---

### 12. Separate module for JWT token checking (+10)

**Проверка структуры:**
```bash
# Проверить что есть AuthModule
ls -la src/auth/

# Проверить что есть JwtAuthGuard
cat src/auth/jwt-auth.guard.ts | head -20

# Проверить что Guard применяется в AppModule
grep -A 3 "APP_GUARD" src/app.module.ts
```

**Что проверить:**
- ✅ Существует отдельный модуль (AuthModule)
- ✅ Существует Guard (JwtAuthGuard)
- ✅ Guard проверяет JWT токен
- ✅ Guard применяется глобально

**Статус:** ✅ Если структура правильная - работает

---

## ✅ ADVANCED SCOPE - Logging & Error Handling

### 13. Logs written to file (+20)

**Проверка:**
```bash
# Выполните запрос
curl http://localhost:4000/

# Проверьте файл
ls -la logs/app.log
cat logs/app.log | tail -5
```

**Ожидаемый результат:**
- ✅ Файл `logs/app.log` существует
- ✅ В файле есть записи о запросах

**Статус:** ✅ Если логи пишутся в файл - работает

---

### 14. Log file rotation with size (+10)

**Проверка:**
```bash
# Проверьте код ротации
grep -A 20 "rotateLogIfNeeded" src/logging/logging.service.ts

# Временно уменьшите размер для теста (в .env)
LOG_MAX_FILE_SIZE_KB=1

# Перезапустите приложение
# Выполните много запросов
for i in {1..200}; do curl -s http://localhost:4000/ > /dev/null; done

# Проверьте ротацию
ls -la logs/ | grep app.log
```

**Ожидаемый результат:**
- ✅ Создаются файлы вида `app-2025-12-14T...log`
- ✅ Старые файлы ротируются

**ВАЖНО:** Верните нормальный размер файла после теста!

**Статус:** ✅ Если файлы ротируются - работает

---

### 15. Environment variable for max file size (+10)

**Проверка:**
```bash
# Проверьте .env
grep LOG_MAX_FILE_SIZE_KB .env

# Проверьте код
grep "LOG_MAX_FILE_SIZE_KB" src/logging/logging.service.ts
```

**Ожидаемый результат:**
- ✅ В `.env` есть `LOG_MAX_FILE_SIZE_KB=100`
- ✅ Код читает значение из `process.env.LOG_MAX_FILE_SIZE_KB`

**Статус:** ✅ Если переменная используется - работает

---

### 16. Error logs in separate file (+10)

**Проверка:**
```bash
# Создайте ошибку
curl http://localhost:4000/nonexistent-route

# Проверьте оба файла
ls -la logs/
tail -5 logs/app.log
tail -5 logs/error.log  # Должен содержать только ошибки
```

**Ожидаемый результат:**
- ✅ Файл `logs/error.log` существует
- ✅ Содержит только ошибки (уровень ERROR)
- ✅ Ошибки также в `app.log`

**Статус:** ✅ Если ошибки в отдельном файле - работает

---

### 17. Environment variable for logging level (+20)

**Проверка 17.1: Разные уровни**

```bash
# В .env установите LOG_LEVEL=error
LOG_LEVEL=error
# Перезапустите приложение
# Выполните запросы - должны логироваться только ошибки

# В .env установите LOG_LEVEL=log
LOG_LEVEL=log
# Перезапустите приложение
# Выполните запросы - должны логироваться error, warn, log

# В .env установите LOG_LEVEL=verbose
LOG_LEVEL=verbose
# Перезапустите приложение
# Выполните запросы - должны логироваться все уровни
```

**Проверка кода:**
```bash
grep "LOG_LEVEL" src/logging/logging.service.ts
grep "setLogLevel" src/logging/logging.service.ts
```

**Что проверить:**
- ✅ Уровень читается из `process.env.LOG_LEVEL`
- ✅ При уровне N логируются уровни 0..N
- ✅ Используются Nest.js уровни: error, warn, log, debug, verbose

**Статус:** ✅ Если уровни работают правильно - работает

---

## ✅ ADVANCED SCOPE - Authentication & Authorization

### 18. Route /auth/refresh (+30)

**Проверка 18.1: Успешное обновление (200)**
```bash
# Получите refresh token
RESPONSE=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"test123"}')

REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')

# Обновите токены
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

**Ожидаемый результат:**
- HTTP статус: `200 OK`
- Ответ содержит: `accessToken` и `refreshToken` (новые)

**Проверка 18.2: Отсутствует refreshToken (401)**
```bash
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Ожидаемый результат:**
- HTTP статус: `401 Unauthorized` или `400 Bad Request`

**Проверка 18.3: Невалидный refreshToken (403)**
```bash
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"invalid_token"}'
```

**Ожидаемый результат:**
- HTTP статус: `403 Forbidden`
- Сообщение: "Invalid refresh token"

**Проверка кода:**
```bash
grep -A 5 "refresh" src/auth/auth.controller.ts
grep -A 15 "refresh" src/auth/auth.service.ts
```

**Что проверить:**
- ✅ Контроллер вызывает сервис
- ✅ Логика обновления токенов в сервисе
- ✅ Правильные HTTP статусы (200, 401, 403)
- ✅ Refresh token имеет более долгое время жизни чем access token

**Статус:** ✅ Если все работает правильно - работает

---

## 🔍 Быстрая проверка всех пунктов

### Скрипт для автоматической проверки:

```bash
#!/bin/bash

BASE_URL="http://localhost:4000"

echo "=== Проверка Logging ==="
curl -s $BASE_URL/ > /dev/null
sleep 1
tail -n 10 logs/app.log | grep -E "(Incoming|Outgoing)" && echo "✅ Логирование работает"

echo "=== Проверка Exception Filter ==="
curl -s -X POST $BASE_URL/auth/signup -H "Content-Type: application/json" -d '{}' | grep -q "400" && echo "✅ Exception Filter работает"

echo "=== Проверка Authentication ==="
curl -s -X POST $BASE_URL/auth/signup -H "Content-Type: application/json" -d '{"login":"test","password":"test123"}' | grep -q "id" && echo "✅ Signup работает"

curl -s $BASE_URL/user | grep -q "401" && echo "✅ Guard работает (401 без токена)"

echo "=== Проверка Refresh ==="
TOKEN=$(curl -s -X POST $BASE_URL/auth/login -H "Content-Type: application/json" -d '{"login":"test","password":"test123"}' | jq -r '.refreshToken 2>/dev/null')
if [ -n "$TOKEN" ]; then
  curl -s -X POST $BASE_URL/auth/refresh -H "Content-Type: application/json" -d "{\"refreshToken\":\"$TOKEN\"}" | grep -q "accessToken" && echo "✅ Refresh работает"
fi
```

---

## ✅ Итоговый чек-лист

### Logging & Error Handling
- [ ] Custom LoggingService логирует с правильным форматом
- [ ] Exception Filter обрабатывает все ошибки
- [ ] Запросы логируются (method, URL, query, body)
- [ ] Ответы логируются (status code, duration)
- [ ] Ошибки логируются и возвращаются правильные статусы
- [ ] uncaughtException логируется
- [ ] unhandledRejection логируется
- [ ] Логи пишутся в файл
- [ ] Ротация файлов работает
- [ ] LOG_MAX_FILE_SIZE_KB в .env
- [ ] Ошибки в отдельном файле
- [ ] LOG_LEVEL в .env работает правильно

### Authentication & Authorization
- [ ] POST /auth/signup работает (201, 400)
- [ ] POST /auth/login работает (200, 400, 403)
- [ ] Пароли хешируются
- [ ] Access Token содержит userId и login
- [ ] JWT_SECRET в .env
- [ ] Защищенные роуты требуют токен (401)
- [ ] Публичные роуты работают без токена
- [ ] Отдельный модуль для проверки JWT
- [ ] POST /auth/refresh работает (200, 401, 403)

---

## 🎯 Запуск тестов

```bash
# Тесты аутентификации
npm run test:auth

# Все тесты
npm test

# Линтинг
npm run lint
```

