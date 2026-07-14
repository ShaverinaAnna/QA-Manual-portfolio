# Проект: API testing — Olymp (Postman)

Учебный REST API мифологических сущностей: `https://api.qasandbox.ru/api`  
Пространство Postman: **study_ancient** · Коллекция: **Olymp**

Цель проекта — показать навык API-тестирования: позитивные/негативные сценарии, валидация, авторизация, CRUD, pre-request и post-response скрипты.

---

## Эндпоинты и запросы коллекции

| Запрос в Postman | Метод | URL | Назначение |
|---|---|---|---|
| Registry - 201 created | `POST` | `/api/register` | Успешная регистрация пользователя |
| Registry - validation checks | `POST` | `/api/register` | Негативные проверки валидации (пустые/пробельные поля) |
| Login - 200 OK | `POST` | `/api/login` | Авторизация, получение токена |
| Get mythology list | `GET` | `/api/mythology` | Список сущностей |
| Get mythology (filter) | `GET` | `/api/mythology?category=creatures&sort=asc` | Фильтр + сортировка |
| Get mythology by id | `GET` | `/api/mythology/{{id}}` | Получение одной записи |
| Create God - 200 ok | `POST` | `/api/mythology` | Создание сущности (category: gods) |
| Create God - 400 bad | `POST` | `/api/mythology` | Негатив: неполные обязательные поля |
| Change part god - 200 ok | `PATCH` | `/api/mythology/{{id}}` | Частичное обновление |
| Delete mythology | `DELETE` | `/api/mythology/{{id}}` | Удаление записи |

Переменные окружения: `base_url` = `https://api.qasandbox.ru/api`, `token`, `user_id`, `mythology_id`.

---

## Стандартный набор проверок QA для API

### 1. HTTP-статус
- Ожидаемый код для позитива: `200`, `201`, `204`
- Ожидаемый код для негатива: `400`, `401`, `403`, `404`, `409`, `422`, `500` (как в спецификации)
- Несоответствие метода → `405` + заголовок `Allow` (если реализовано)

### 2. Время ответа (performance smoke)
- `pm.response.responseTime` в разумных пределах (например, &lt; 2000 ms для sandbox)
- Нет аномальных таймаутов и «зависших» ответов

### 3. Заголовки ответа
- `Content-Type` содержит `application/json` для JSON API
- При создании/логине — наличие нужных заголовков (`Set-Cookie`, `Authorization` flow — по контракту)
- CORS / security headers — по требованиям продукта

### 4. Формат и схема тела
- Ответ парсится как JSON
- Обязательные поля присутствуют (`id`, `message`, `category`, …)
- Типы данных корректны (string / number / boolean / array / object)
- Нет лишних неожиданных null в обязательных полях

### 5. Бизнес-логика (functional)
- Созданная сущность читается через `GET` по `id`
- Фильтр `category` и `sort` реально влияют на выборку
- `PATCH` меняет только переданные поля
- `DELETE` делает повторный `GET` → `404`
- Сообщение об успехе соответствует действию (например, «Регистрация успешна»)

### 6. Валидация и негативные сценарии
- Пустые строки / только пробелы
- Отсутствующие обязательные поля
- Невалидный JSON / неверный Content-Type
- Несуществующий `id`
- Повторная регистрация с тем же `username` (если API запрещает)
- Запрос без токена / с просроченным токеном

### 7. Авторизация и безопасность
- Защищённые методы требуют `Authorization: Bearer {{token}}`
- Без токена → `401`/`403`
- Токен не логируется в публичные артефакты портфолио
- Чувствительные данные — в Environment / Vault, не в URL

### 8. Идемпотентность и побочные эффекты
- Повторный `GET` не меняет данные
- Повторный `DELETE` — стабильный ответ (`404` или `204` по контракту)
- `POST` создания не должен молча плодить дубли без причины

### 9. Консистентность данных
- Значения в ответе совпадают с отправленным body
- Связанные сущности (user ↔ token ↔ mythology) согласованы
- После update `GET` возвращает обновлённые поля

### 10. Pre-request / Post-response автоматизация (Postman)
**Pre-request (до запроса):**
- Генерация уникального `username` / email (`Date.now()`, random)
- Подстановка `base_url`, заголовка `Authorization`
- Подготовка валидного / невалидного body под сценарий
- Логирование имени запроса и окружения

**Post-response / Tests (после ответа):**
- Проверка status code
- Проверка Content-Type и JSON
- Проверка времени ответа
- `pm.expect` по ключевым полям
- Сохранение `token`, `mythology_id` в environment
- Цепочка: Register → Login → Create → Get → Patch → Delete

---

## Скрипты в коллекции Olymp

Готовый файл для импорта в Postman:

`postman/Olymp.postman_collection.json`

В коллекции:
- **collection-level** pre-request и tests — базовый «страховочный» набор на все запросы
- **request-level** tests — ожидаемый статус и бизнес-проверки под конкретный сценарий

### Как применить в Postman (study_ancient → Olymp)

1. Открыть Postman → workspace **study_ancient**
2. Import → выбрать `Olymp.postman_collection.json`  
   (или: Collection → ⋯ → Merge / Replace, если коллекция уже есть)
3. В Environment задать `base_url` = `https://api.qasandbox.ru/api`
4. Запустить folder **Auth** → **Mythology CRUD** через Collection Runner
5. Убедиться, что Test Results зелёные; `token` и `mythology_id` сохранились в Environment

Альтернатива без замены коллекции: скопировать блоки из раздела «Скрипты» файла  
`postman/scripts/` в Pre-request Script / Tests каждого запроса (или на уровень коллекции).

---

## Артефакты проекта в репозитории

```
QA-Manual-portfolio/
├── README.md
├── API.md                          ← этот файл
└── postman/
    ├── Olymp.postman_collection.json
    └── scripts/
        ├── collection-pre-request.js
        ├── collection-tests.js
        └── request-tests-examples.js
```

---

## Что демонстрирует проект

- Умение проектировать smoke + negative pack для REST API
- Работу с Postman Collections, Environment, Pre-request и Tests
- Понимание CRUD, валидации, auth-flow и стандартных QA-проверок API
- Готовность переносить проверки из Postman в pytest + requests (следующий шаг)
