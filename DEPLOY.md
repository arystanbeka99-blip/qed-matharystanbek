# Деплой QED Math Space

## Шаг 1. Supabase (база данных + авторизация)

1. Зайдите на [supabase.com](https://supabase.com) → New Project.
   Выберите регион ближе к Казахстану (обычно Frankfurt/EU).
2. После создания проекта: **SQL Editor → New query** — вставьте содержимое
   файла `supabase-schema.sql` целиком и нажмите Run. Это создаст все
   таблицы (`profiles`, `subscriptions`, `materials`, `lesson_reflections`),
   политики безопасности (RLS) и триггер автосоздания профиля.
3. **Settings → API** — скопируйте:
   - `Project URL` → это `VITE_SUPABASE_URL`
   - `anon public` ключ → это `VITE_SUPABASE_ANON_KEY`
   - `service_role` ключ (⚠️ секретный, только для сервера) → это `SUPABASE_SERVICE_ROLE_KEY`
4. **Authentication → Providers** — Email включён по умолчанию. Если не
   хотите подтверждение почты на старте: Authentication → Settings →
   отключите "Confirm email" (включите обратно перед реальным запуском).
5. **Authentication → URL Configuration** — добавьте адрес вашего будущего
   Vercel-домена в Redirect URLs (например `https://qed-math-space.vercel.app`).

## Шаг 2. Stripe (оплата, опционально на первом этапе)

1. [dashboard.stripe.com](https://dashboard.stripe.com) → Products → создайте
   продукт "QED PRO" с двумя ценами (Recurring): месячная и годовая.
   Скопируйте оба `Price ID` (`price_...`).
2. Developers → API keys → скопируйте `Secret key` → `STRIPE_SECRET_KEY`.
3. Webhook подключится после первого деплоя (нужен реальный URL) — вернитесь
   к этому шагу после Шага 3.

## Шаг 3. GitHub → Vercel

1. Убедитесь, что проект уже запушен на GitHub (см. предыдущие инструкции).
2. [vercel.com](https://vercel.com) → Add New → Project → выберите репозиторий
   `qed-math-space`. Vercel автоматически определит фреймворк Vite.
3. **Environment Variables** — добавьте перед первым деплоем:

   | Имя | Значение |
   |---|---|
   | `VITE_SUPABASE_URL` | из Шага 1 |
   | `VITE_SUPABASE_ANON_KEY` | из Шага 1 |
   | `SUPABASE_URL` | тот же URL, без префикса VITE_ (нужен серверным функциям в `/api`) |
   | `SUPABASE_SERVICE_ROLE_KEY` | из Шага 1 |
   | `STRIPE_SECRET_KEY` | из Шага 2 |
   | `STRIPE_PRICE_MONTH` | из Шага 2 |
   | `STRIPE_PRICE_YEAR` | из Шага 2 |
   | `APP_URL` | будет известен после первого деплоя — впишите `https://ваш-проект.vercel.app` |

4. Нажмите Deploy. Через 1-2 минуты сайт будет доступен по адресу вида
   `https://qed-math-space.vercel.app`.

## Шаг 4. Завершить Stripe webhook

1. Скопируйте домен из Vercel.
2. Stripe Dashboard → Developers → Webhooks → Add endpoint:
   `https://ваш-проект.vercel.app/api/stripe-webhook`
   Подпишите на события: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
3. Скопируйте `Signing secret` (`whsec_...`) → в Vercel добавьте переменную
   `STRIPE_WEBHOOK_SECRET` → Redeploy (Vercel → Deployments → ⋯ → Redeploy).

## Шаг 5. Проверка

- Откройте сайт → зарегистрируйте тестового учителя.
- Дашборд должен открыться сразу (или после подтверждения почты, если
  включено).
- В Supabase → Table Editor → `profiles` должна появиться новая строка.
- Нажмите «Оформить QED PRO» → должно произойти перенаправление на Stripe
  Checkout (используйте тестовую карту `4242 4242 4242 4242`, любой
  будущий срок и CVC).
- После оплаты в таблице `subscriptions` должна появиться активная запись,
  а залоченные карточки материалов — открыться.

## Локальная разработка

```bash
npm install
cp .env.example .env   # заполните VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
npm run dev
```

Серверные функции (`/api`) при `npm run dev` (обычный Vite) не выполняются —
это особенность Vercel Functions. Для локальной проверки оплаты используйте
`vercel dev` (`npm i -g vercel`, затем `vercel dev` в корне проекта).
