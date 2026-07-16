// Vercel / Netlify Function: POST /api/stripe-webhook
// Слушает события Stripe и синхронизирует таблицу subscriptions в Supabase.
//
// В Stripe Dashboard → Developers → Webhooks укажите этот URL и подпишитесь на:
//   checkout.session.completed
//   customer.subscription.updated
//   customer.subscription.deleted
//
// .env: STRIPE_WEBHOOK_SECRET=whsec_xxx
//       SUPABASE_SERVICE_ROLE_KEY=xxx  (service role — только на сервере, не во фронтенде!)

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// service-role клиент — обходит RLS, используется только в доверенном серверном коде
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: { bodyParser: false }, // Stripe требует «сырое» тело запроса для проверки подписи
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(chunk);
  return Buffer.concat(chunks);
}

// "5,6,9" -> [5, 6, 9]
function parseGrades(gradesStr) {
  if (!gradesStr) return [];
  return gradesStr
    .split(",")
    .map((g) => parseInt(g.trim(), 10))
    .filter((g) => !Number.isNaN(g));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const rawBody = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Неверная подпись webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { userId, plan, grades } = session.metadata;
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        await upsertSubscription({
          userId,
          plan,
          grades: parseGrades(grades),
          status: "active",
          periodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          stripeSubscriptionId: subscription.id,
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const { userId, plan, grades } = sub.metadata;
        await upsertSubscription({
          userId,
          plan,
          grades: parseGrades(grades),
          status: sub.status === "active" ? "active" : "expired",
          periodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          stripeSubscriptionId: sub.id,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      default:
        break; // остальные события игнорируем
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Ошибка обработки webhook:", err.message);
    return res.status(500).json({ error: "Внутренняя ошибка обработки" });
  }
}

async function upsertSubscription({ userId, plan, grades, status, periodEnd, stripeSubscriptionId }) {
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        plan,
        grades,
        status,
        current_period_end: periodEnd,
        stripe_subscription_id: stripeSubscriptionId,
        // Бонус подготовки к ЕНТ включён во все тарифы по умолчанию
        exam_prep_bonus: true,
      },
      { onConflict: "stripe_subscription_id" }
    );
  if (error) throw error;
}

/* ============================================================
   ДОПОЛНЕНИЕ К SQL-СХЕМЕ
   ============================================================
   Выполните supabase-migration-4.sql — она добавляет колонки
   grades (int[]) и exam_prep_bonus (boolean) в таблицу subscriptions,
   а также меняет допустимые значения plan на 'month' / 'half_year' / 'year'.
   ============================================================ */
