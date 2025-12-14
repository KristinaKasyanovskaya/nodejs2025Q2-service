# Руководство по тестированию Logging & Error Handling

## Запуск приложения

### 1. Настройка переменных окружения (опционально)

Создайте файл `.env` в корне проекта:

```bash
PORT=4000
LOG_LEVEL=info              # error, warn, info, debug, verbose
LOG_FILE=app.log            # Опционально: имя файла (если не указано - вывод в stdout)
LOG_DIR=logs                # Директория для логов (используется только если LOG_FILE указан)
LOG_MAX_FILE_SIZE_KB=100    # Максимальный размер файла в KB перед ротацией
```

### 2. Запуск приложения

**Режим разработки (с автоперезагрузкой):**
```bash
npm run start:dev
```

**Обычный режим:**
```bash
npm start
```

---

## Тестирование каждого пункта

### ✅ Пункт 1: Custom LoggingService (20 баллов)

**Проверка:** Убедитесь, что LoggingService логирует сообщения с различными уровнями.

**Тест:**
1. Запустите приложение
2. Откройте другую консоль и отправьте любой запрос:
```bash
curl http://localhost:4000/user -H "Accept: application/json"
```

**Ожидаемый результат:** В консоли (или в файле лога, если LOG_FILE указан) вы увидите логи с метками уровня, временем и контекстом.

**Проверка разных уровней:**
- При успешном запросе: `[INFO]` логи
- При ошибке: `[ERROR]` логи

---

### ✅ Пункт 2: Custom Exception Filter (20 баллов)

**Проверка:** Exception Filter обрабатывает все исключения и возвращает правильный HTTP статус.

#### Тест 2.1: Обработка известных исключений (BadRequestException)
```bash
# Отправьте запрос с невалидным UUID
curl -X GET http://localhost:4000/user/invalid-uuid -H "Accept: application/json"
```

**Ожидаемый результат:**
- HTTP статус: `400 Bad Request`
- В логах: `[ERROR]` запись с деталями ошибки
- Ответ: `{"statusCode": 400, "message": "..."}`

#### Тест 2.2: Обработка неожиданных ошибок (500 Internal Server Error)

Создайте временный тест-контроллер или модифицируйте существующий для генерации ошибки:

```bash
# Попробуйте обратиться к несуществующему ресурсу или используйте невалидные данные
curl -X POST http://localhost:4000/user \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"invalid":"data"}'
```

**Ожидаемый результат:**
- HTTP статус: `500 Internal Server Error` (для неожиданных ошибок)
- В логах: `[ERROR]` запись с полным стеком ошибки
- Ответ: `{"statusCode": 500, "message": "Internal server error"}`

---

### ✅ Пункт 3: Логирование запросов и ответов (20 баллов)

**Проверка:** Логируются URL, query параметры, body запроса и статус код ответа.

#### Тест 3.1: GET запрос с query параметрами
```bash
curl -X GET "http://localhost:4000/user?test=123&foo=bar" -H "Accept: application/json"
```

**Ожидаемый результат в логах:**
```
[INFO] [LoggingInterceptor] Incoming Request: {
  "method": "GET",
  "url": "/user?test=123&foo=bar",
  "query": {
    "test": "123",
    "foo": "bar"
  }
}

[INFO] [LoggingInterceptor] Outgoing Response: {
  "method": "GET",
  "url": "/user?test=123&foo=bar",
  "statusCode": 200,
  "duration": "5ms"
}
```

#### Тест 3.2: POST запрос с body
```bash
curl -X POST http://localhost:4000/user \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"login":"testuser","password":"testpass123"}'
```

**Ожидаемый результат в логах:**
```
[INFO] [LoggingInterceptor] Incoming Request: {
  "method": "POST",
  "url": "/user",
  "body": {
    "login": "testuser",
    "password": "***"
  }
}

[INFO] [LoggingInterceptor] Outgoing Response: {
  "method": "POST",
  "url": "/user",
  "statusCode": 201,
  "duration": "10ms"
}
```

**Важно:** Пароль должен быть замаскирован как `***` в логах.

#### Тест 3.3: Проверка различных статус кодов
```bash
# 200 OK
curl http://localhost:4000/user -H "Accept: application/json"

# 400 Bad Request
curl -X GET http://localhost:4000/user/invalid-uuid -H "Accept: application/json"

# 404 Not Found (если такой endpoint существует)
curl http://localhost:4000/nonexistent -H "Accept: application/json"
```

---

### ✅ Пункт 4: Обработка ошибок с логированием (20 баллов)

**Проверка:** Все ошибки логируются, и возвращается правильный HTTP статус код.

#### Тест 4.1: Валидационная ошибка (400)
```bash
curl -X POST http://localhost:4000/user \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Ожидаемый результат:**
- В логах: `[ERROR]` запись с деталями
- HTTP статус: `400`
- Сообщение об ошибке в ответе

#### Тест 4.2: Проверка логирования ошибок в ExceptionFilter

Любая ошибка должна логироваться дважды:
1. В `LoggingInterceptor` - краткая информация
2. В `LoggingExceptionFilter` - полная информация со стеком

**Проверьте логи** - должны быть записи от обоих компонентов.

---

### ✅ Пункт 5: uncaughtException (10 баллов)

**Проверка:** Обработчик для необработанных синхронных исключений.

#### Тест 5.1: Создание uncaughtException

**Внимание:** Этот тест приведет к остановке приложения.

Создайте временный файл `test-uncaught.js`:

```javascript
// test-uncaught.js
setTimeout(() => {
  throw new Error('Тестовая uncaughtException ошибка');
}, 2000);
```

Или добавьте в код приложения (для теста) временную строку, которая вызовет ошибку после запуска:

```typescript
// В main.ts после app.listen() добавьте временно:
setTimeout(() => {
  throw new Error('Test uncaughtException');
}, 5000);
```

**Ожидаемый результат:**
1. Приложение логирует ошибку с контекстом `[UncaughtException]`
2. Приложение завершает работу с кодом выхода 1

**Проверьте логи:**
```
[ERROR] [UncaughtException] Uncaught Exception: Test uncaughtException
...
```

**Важно:** После теста удалите тестовый код!

---

### ✅ Пункт 6: unhandledRejection (10 баллов)

**Проверка:** Обработчик для необработанных промисов.

#### Тест 6.1: Создание unhandledRejection

**Внимание:** Этот тест может привести к нестабильности приложения.

Добавьте временно в код (например, в контроллер или сервис):

```typescript
// Временный тест - добавьте в любой контроллер
@Get('test-rejection')
testRejection() {
  Promise.reject(new Error('Test unhandledRejection'));
  return { message: 'Test started' };
}
```

Или создайте отдельный эндпоинт для теста:

```typescript
// В app.controller.ts временно:
@Get('test-unhandled-rejection')
testUnhandledRejection() {
  Promise.reject(new Error('Тестовая unhandledRejection ошибка'));
  return { message: 'Тест запущен, проверьте логи' };
}
```

Затем выполните:
```bash
curl http://localhost:4000/test-unhandled-rejection
```

**Ожидаемый результат:**
1. Приложение логирует ошибку с контекстом `[UnhandledRejection]`
2. Приложение продолжает работать (не падает)

**Проверьте логи:**
```
[ERROR] [UnhandledRejection] Unhandled Rejection: Тестовая unhandledRejection ошибка
...
```

**Важно:** После теста удалите тестовый код!

---

## Быстрая проверка всех пунктов

### Скрипт для автоматической проверки

Создайте файл `test-logging.sh`:

```bash
#!/bin/bash

echo "=== Тест 1: LoggingService ==="
curl -s http://localhost:4000/user -H "Accept: application/json" > /dev/null
echo "✓ Запрос отправлен, проверьте логи"

echo -e "\n=== Тест 2: Exception Filter (400) ==="
curl -s -X GET http://localhost:4000/user/invalid-uuid -H "Accept: application/json"
echo -e "\n✓ Проверьте логи на наличие [ERROR] записей"

echo -e "\n=== Тест 3: Логирование запроса с query и body ==="
curl -s -X GET "http://localhost:4000/user?test=123" -H "Accept: application/json" > /dev/null
curl -s -X POST http://localhost:4000/user \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"test123"}' > /dev/null
echo "✓ Проверьте логи на наличие URL, query, body и status code"

echo -e "\n=== Тест 4: Обработка ошибок ==="
curl -s -X POST http://localhost:4000/user \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}'
echo -e "\n✓ Проверьте логи на наличие ошибок"
```

Сделайте файл исполняемым и запустите:
```bash
chmod +x test-logging.sh
./test-logging.sh
```

---

## Проверка логов

### Если логи идут в stdout (LOG_FILE не установлен):
Логи будут видны прямо в консоли, где запущено приложение.

### Если логи идут в файл (LOG_FILE установлен):
```bash
# Просмотр логов в реальном времени
tail -f logs/app.log

# Просмотр последних 50 строк
tail -n 50 logs/app.log

# Поиск ошибок
grep ERROR logs/app.log

# Поиск запросов
grep "Incoming Request" logs/app.log
```

---

## Критерии успешной проверки

- ✅ Логи содержат временные метки, уровни логирования и контекст
- ✅ Все запросы логируются с URL, query параметрами и body
- ✅ Все ответы логируются со статус кодом
- ✅ Ошибки логируются с полной информацией (включая стек)
- ✅ HTTP статус коды корректны (400, 500 и т.д.)
- ✅ uncaughtException логируется и останавливает приложение
- ✅ unhandledRejection логируется без остановки приложения
- ✅ Пароли и чувствительные данные маскируются в логах

