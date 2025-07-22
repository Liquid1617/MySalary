# AI Supervisor Architecture

## Описание

Реализована multi-agent архитектура с супервизором для улучшения работы AI при взаимодействии с базой данных. Супервизор координирует работу специализированных агентов и исправляет типичные ошибки.

## Проблема

AI часто галлюцинирует при работе с PostgreSQL базой данных, используя неправильные имена таблиц (например, `transactions` вместо `Transactions`). В PostgreSQL имена таблиц регистрозависимы, что приводит к ошибкам.

## Решение

### 1. SQL Validator (`sqlValidator.js`)
- Автоматически исправляет имена таблиц на правильные
- Добавляет кавычки для таблиц с заглавными буквами
- Логирует все исправления в `logs/sql-corrections.log`

### 2. Custom SQL Tools (`customSqlTool.js`)
- `ValidatedQuerySqlTool` - выполняет SQL с предварительной валидацией
- `ValidatedInfoSqlTool` - получает схему с исправлением имен
- `ValidatedListTablesSqlTool` - возвращает список таблиц
- `QueryCheckerTool` - проверяет SQL перед выполнением

### 3. Supervisor System (`supervisor.js`)
- **Supervisor** - координирует работу агентов
- **SqlAgent** - генерирует и выполняет SQL запросы
- **Validator** - проверяет и исправляет запросы
- **Finalizer** - формирует финальный ответ пользователю

## Архитектура

```
User Query
    ↓
Supervisor → SQL Agent → Validator → SQL Agent (retry) → Finalizer
    ↑                                                        ↓
    ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

## Конфигурация

### Включение/выключение супервизора
```bash
# В .env файле
USE_SUPERVISOR=true  # или false для использования старой логики
```

### Правильные имена таблиц
- `Users` (не users)
- `Accounts` (не accounts)
- `Transactions` (не transactions)
- `Categories` (не categories)
- `Currencies` (не currencies)
- `Countries` (не countries)
- `Budgets` (не budgets)
- `Tags` (не tags)
- `TransactionTags` (не transactiontags)
- `AuditLog` (не auditlog)

## Логирование

Все исправления SQL запросов сохраняются в `server/logs/sql-corrections.log`:

```json
{
  "timestamp": "2024-01-10T10:30:00.000Z",
  "originalSql": "SELECT * FROM transactions",
  "fixedSql": "SELECT * FROM \"Transactions\"",
  "corrections": [
    {
      "original": "transactions",
      "corrected": "Transactions",
      "timestamp": "2024-01-10T10:30:00.000Z"
    }
  ]
}
```

## Улучшения

1. **Снижение галлюцинаций**: Автоматическое исправление типичных ошибок
2. **Логирование**: Полная история исправлений для анализа
3. **Повторные попытки**: Если запрос не удался, система автоматически исправляет и повторяет
4. **Прозрачность**: Пользователь получает корректные результаты без упоминания исправлений

## Использование

API остается неизменным. Просто отправляйте запросы на `/api/chat` endpoint:

```javascript
POST /api/chat
Authorization: Bearer <token>
{
  "messages": [
    {
      "role": "system",
      "content": "Ты финансовый помощник..."
    },
    {
      "role": "user", 
      "content": "Покажи мои транзакции за последний месяц"
    }
  ]
}
```

## Мониторинг

Проверить статус супервизора:
```
GET /api/chat/health
```

Ответ:
```json
{
  "status": "ok",
  "supervisor": true,
  "message": "Chat service with supervisor is running"
}
``` 