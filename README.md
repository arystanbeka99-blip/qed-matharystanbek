# QED Math Space — структура проекта

```
src/
  App.jsx                       — корневой компонент, роутинг через состояние
  api/
    create-checkout-session.js  — serverless-функция: создаёт Stripe Checkout Session
    stripe-webhook.js           — serverless-функция: обрабатывает оплату, пишет подписку в Supabase
  components/
    Auth.jsx                       — экран входа/регистрации (Supabase Auth)
    CanvaViewer.jsx                — модалка с embed-плеером Canva
    PirateGame.jsx                  — игра «Пиратские множители»
    PercentLabyrinth.jsx            — игра «Лабиринт процентов»
    ReflectionTool.jsx              — «Светофор понимания» (режимы ученика и учителя)
  hooks/
    useSubscription.js            — определяет PRO-статус учителя
  lib/
    supabaseClient.js             — клиент Supabase + SQL-схема в комментариях
qed-math-space.jsx               — автономная demo-версия без бэкенда (для быстрого прототипирования в Canvas/StackBlitz)
```

## Установка

```bash
npm install react lucide-react @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

В `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

## База данных

SQL-схема (`profiles`, `subscriptions`, `materials`) и политики RLS уже описаны прямо в
`src/lib/supabaseClient.js` — выполните их через Supabase SQL Editor.

## Как работает доступ PRO

`useSubscription()` проверяет наличие активной записи в таблице `subscriptions`
(`status = 'active'` и `current_period_end` в будущем). Пока подписки нет — `isPro = false`,
и в `MaterialsPage` карточки с `locked: true` открывают Paywall вместо контента.

## Оплата (Stripe)

1. Кнопка «Оформить QED PRO» вызывает `POST /api/create-checkout-session`
   (`src/api/create-checkout-session.js`) с `plan`, `userId`, `email` — функция
   создаёт Stripe Checkout Session и возвращает `url` для редиректа.
2. После оплаты Stripe шлёт событие на `POST /api/stripe-webhook`
   (`src/api/stripe-webhook.js`), которое через service-role ключ Supabase
   создаёт/обновляет запись в `subscriptions`.
3. При следующем вызове `useSubscription()` (например, после возврата на
   `success_url`, вызвав `refresh()`) учитель автоматически получает `isPro: true`.

Переменные окружения для бэкенда:
```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTH=price_...
STRIPE_PRICE_YEAR=price_...
SUPABASE_SERVICE_ROLE_KEY=...   # только на сервере
APP_URL=https://qedmathspace.kz
```

Добавьте колонку для связи со Stripe:
```sql
alter table subscriptions add column stripe_subscription_id text unique;
```

**Для рынка Казахстана:** Stripe не принимает карты Kaspi напрямую — для
локального эквайринга практичнее CloudPayments или прямая интеграция с
Kaspi Pay. Структура та же (checkout → webhook → запись в `subscriptions`),
меняется только SDK и проверка подписи запроса.

## Презентации через Canva

В `materials.canva_url` храните обычную ссылку «Поделиться → Просмотр».
`CanvaViewer` сам добавляет параметр `?embed` и рендерит в `iframe` 16:9.

## Авторизация

`App.jsx` при загрузке проверяет `supabase.auth.getSession()`. Пока сессия
не определена — рендерится пустой экран (без мигания), если сессии нет —
показывается `Auth.jsx` вместо всего приложения. Значок профиля в шапке
вызывает `supabase.auth.signOut()`.

`Auth.jsx` использует `signUp`/`signIn` из `lib/supabaseClient.js`. При
регистрации Supabase отправляет письмо для подтверждения почты — это
поведение по умолчанию, отключается в Supabase Dashboard → Auth → Settings.

## Рефлексия

`ReflectionTool` — «Светофор понимания» с двумя режимами: ученик отвечает
одним нажатием (🟢/🟡/🔴), учитель видит агрегированную статистику класса
в виде прогресс-баров. Демо хранит ответы в локальном состоянии — для
реального класса создайте таблицу `lesson_reflections` (lesson_id,
student_name, answer, created_at) и подпишитесь на Supabase Realtime,
чтобы учитель видел ответы вживую по мере поступления.

## Игры

- `PirateGame` — три уровня сложности, таймер, очки и серии правильных ответов.
- `PercentLabyrinth` — прохождение 8 «комнат» с задачами на проценты,
  система из 3 жизней, визуальная дорожка прогресса.

Новую игру подключайте так же: добавьте `gameId` в объект материала и
обработайте его в `onOpenGame` / блоке `view === "game"` (см. `App.jsx`).

## Мобильная версия

- Хедер сворачивает поиск в иконку с раскрывающимся полем ниже.
- Нижний таб-бар (`MobileTabBar`) заменяет обычную навигацию на экранах `< 640px`.
- Все сетки материалов/классов/четвертей адаптивны (`grid-cols-*` меняются по брейкпоинтам).
