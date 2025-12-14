# Быстрая проверка Logging & Error Handling

## 🚀 Быстрый старт

### 1. Запустите приложение

```bash
npm run start:dev
```

Приложение запустится на `http://localhost:4000`

### 2. Запустите автоматический тест

В **другой** консоли:

```bash
./test-logging.sh
```

Или вручную выполните команды из скрипта.

---

## 📋 Пошаговая проверка каждого пункта

### ✅ Пункт 1: Custom LoggingService (20 баллов)

**Команда:**
```bash
curl http://localhost:4000/user -H "Accept: application/json"
```

**Что проверить в логах:**
- ✅ Видны логи с уровнем `[INFO]`
- ✅ Есть временная метка (ISO формат)
- ✅ Есть контекст `[LoggingInterceptor]`

---

### ✅ Пункт 2: Custom Exception Filter (20 баллов)

**Команда:**
```bash
curl -X GET http://localhost:4000/user/invalid-uuid -H "Accept: application/json"
```

**Что проверить:**
- ✅ HTTP статус: `400`
- ✅ В логах: `[ERROR]` запись с контекстом `[ExceptionFilter]`
- ✅ В логах: полная информация об ошибке (method, url, statusCode, message, stack)

**Для проверки 500 ошибки** (неожиданная ошибка):
Модифицируйте временно любой контроллер, чтобы бросить обычный Error:

```typescript
// В любом контроллере временно добавьте:
throw new Error('Test unexpected error');
```

**Что проверить:**
- ✅ HTTP статус: `500`
- ✅ Сообщение: `"Internal server error"`
- ✅ В логах: полная информация об ошибке

---

### ✅ Пункт 3: Логирование запросов/ответов (20 баллов)

#### Тест с query параметрами:
```bash
curl -X GET "http://localhost:4000/user?test=123&foo=bar" -H "Accept: application/json"
```

**Что проверить в логах:**
```
[INFO] [LoggingInterceptor] Incoming Request: {
  "method": "GET",
  "url": "/user?test=123&foo=bar",
  "query": {
    "test": "123",
    "foo": "bar"
  }
}
```

#### Тест с body:
```bash
curl -X POST http://localhost:4000/user \
  -H "Content-Type: application/json" \
  -d '{"login":"testuser","password":"secret123"}'
```

**Что проверить в логах:**
- ✅ URL: `/user`
- ✅ Body присутствует
- ✅ Пароль замаскирован: `"password": "***"`
- ✅ Ответ содержит: `statusCode`, `duration`

---

### ✅ Пункт 4: Обработка ошибок с логированием (20 баллов)

**Команда:**
```bash
curl -X POST http://localhost:4000/user \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Что проверить:**
- ✅ В логах есть запись от `LoggingInterceptor` с ошибкой
- ✅ В логах есть запись от `ExceptionFilter` с полной информацией
- ✅ HTTP статус код соответствует типу ошибки
- ✅ Ошибка логируется с уровнем `[ERROR]`

---

### ✅ Пункт 5: uncaughtException (10 баллов)

**⚠️ ВНИМАНИЕ: Этот тест остановит приложение!**

**Вариант 1: Временно добавить в main.ts** (после `app.listen()`):

```typescript
// ВРЕМЕННО для теста - удалите после!
setTimeout(() => {
  throw new Error('Test uncaughtException');
}, 5000);
```

**Что проверить:**
- ✅ В логах: `[ERROR] [UncaughtException] Uncaught Exception: ...`
- ✅ Приложение завершает работу
- ✅ Есть полный стек ошибки

**Не забудьте удалить тестовый код после проверки!**

---

### ✅ Пункт 6: unhandledRejection (10 баллов)

**Вариант 1: Временно добавить в app.controller.ts:**

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('test-unhandled-rejection')
  testUnhandledRejection() {
    // ВРЕМЕННО для теста - удалите после!
    Promise.reject(new Error('Test unhandledRejection'));
    return { message: 'Тест запущен, проверьте логи' };
  }
}
```

**Затем выполните:**
```bash
curl http://localhost:4000/test-unhandled-rejection
```

**Что проверить:**
- ✅ В логах: `[ERROR] [UnhandledRejection] Unhandled Rejection: ...`
- ✅ Приложение продолжает работать (не падает)
- ✅ Есть полный стек ошибки

**Не забудьте удалить тестовый endpoint после проверки!**

---

## 📊 Где смотреть логи

### Если LOG_FILE не установлен (вывод в stdout):
Логи видны прямо в консоли, где запущено приложение.

### Если LOG_FILE установлен в .env:
```bash
# Следить за логами в реальном времени
tail -f logs/app.log

# Последние 100 строк
tail -n 100 logs/app.log

# Только ошибки
grep ERROR logs/app.log

# Только запросы
grep "Incoming Request" logs/app.log

# Только ответы
grep "Outgoing Response" logs/app.log
```

---

## ✅ Чек-лист проверки

- [ ] LoggingService логирует с разными уровнями (INFO, ERROR)
- [ ] Exception Filter обрабатывает ошибки и возвращает правильный статус
- [ ] Запросы логируются с URL, query, body
- [ ] Ответы логируются со статус кодом
- [ ] Пароли маскируются в логах (***)
- [ ] Ошибки логируются полностью (со стеком)
- [ ] HTTP статус коды корректны (400, 500)
- [ ] uncaughtException логируется и останавливает приложение
- [ ] unhandledRejection логируется без остановки приложения
- [ ] Все логи имеют временные метки и контекст

---

## 🔍 Примеры логов

### Успешный запрос:
```
2025-01-XX... [INFO] [LoggingInterceptor] Incoming Request: {
  "method": "GET",
  "url": "/user",
  "query": undefined,
  "body": undefined
}

2025-01-XX... [INFO] [LoggingInterceptor] Outgoing Response: {
  "method": "GET",
  "url": "/user",
  "statusCode": 200,
  "duration": "5ms"
}
```

### Ошибка:
```
2025-01-XX... [ERROR] [ExceptionFilter] {
  "timestamp": "2025-01-XX...",
  "method": "GET",
  "url": "/user/invalid",
  "statusCode": 400,
  "message": "...",
  "error": "...",
  "stack": "..."
}
```

