// Vercel / Netlify Function: POST /api/stripe-webhook
// Slushает события Stripe и синхронизирует таблицу subscriptions в Supabase.
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
        const { userId, plan } = session.metadata;
        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        await upsertSubscription({
          userId,
          plan,
          status: "active",
          periodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          stripeSubscriptionId: subscription.id,
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const { userId, plan } = sub.metadata;
        await upsertSubscription({
          userId,
          plan,
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

async function upsertSubscription({ userId, plan, status, periodEnd, stripeSubscriptionId }) {
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        plan,
        status,
        current_period_end: periodEnd,
        stripe_subscription_id: stripeSubscriptionId,
      },
      { onConflict: "stripe_subscription_id" }
    );
  if (error) throw error;
}

/* ============================================================
   ДОПОЛНЕНИЕ К SQL-СХЕМЕ (см. src/lib/supabaseClient.js)
   ============================================================
   alter table subscriptions
     add column stripe_subscription_id text unique;
   ============================================================ */
