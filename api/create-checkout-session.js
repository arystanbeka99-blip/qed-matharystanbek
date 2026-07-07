// Vercel / Netlify Function: POST /api/create-checkout-session
// Создаёт Stripe Checkout Session для выбранного тарифа и возвращает ссылку на оплату.
//
// Установка: npm install stripe
// .env: STRIPE_SECRET_KEY=sk_live_xxx (или sk_test_xxx)
//       STRIPE_PRICE_MONTH=price_xxx   — Price ID тарифа "Месяц" из Stripe Dashboard
//       STRIPE_PRICE_YEAR=price_xxx    — Price ID тарифа "Год"
//       APP_URL=https://qedmathspace.kz

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  month: process.env.STRIPE_PRICE_MONTH,
  year: process.env.STRIPE_PRICE_YEAR,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Метод не поддерживается" });
  }

  const { plan, userId, email } = req.body;

  if (!PRICE_IDS[plan]) {
    return res.status(400).json({ error: "Неизвестный тариф" });
  }
  if (!userId) {
    return res.status(400).json({ error: "Требуется авторизация" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      // Прокидываем userId и план, чтобы связать оплату с учителем в webhook
      metadata: { userId, plan },
      subscription_data: { metadata: { userId, plan } },
      success_url: `${process.env.APP_URL}/paywall/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/paywall`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Ошибка создания Stripe-сессии:", err.message);
    return res.status(500).json({ error: "Не удалось создать сессию оплаты" });
  }
}

/* ============================================================
   ПРИМЕЧАНИЕ ПО РЫНКУ КАЗАХСТАНА
   ============================================================
   Stripe напрямую не работает с картами Kaspi/локальными эквайерами.
   Для казахстанского рынка практичнее CloudPayments или Kaspi Pay API
   (по прямому договору с Kaspi). Логика та же: создаёте платёжную
   сессию → получаете вебхук об успехе → пишете запись в таблицу
   subscriptions. Ниже webhook.js написан под Stripe, но структура
   обработчика идентична для CloudPayments — меняется только
   верификация подписи и формат payload.
   ============================================================ */
