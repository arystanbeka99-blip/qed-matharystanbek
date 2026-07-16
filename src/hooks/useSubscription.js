import { useEffect, useState } from "react";
import { supabase, getActiveSubscription } from "../lib/supabaseClient";

/**
 * Хук возвращает статус подписки текущего учителя.
 *
 *   const { isPro, loading, plan, refresh } = useSubscription();
 *
 * isPro   — true, если есть активная подписка QED PRO
 * plan    — 'month' | 'year' | null
 * loading — идёт первичная проверка сессии/подписки
 * refresh — принудительно перепроверить (например, после оплаты)
 */
export function useSubscription() {
  const [userId, setUserId] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSubscription = async (uid) => {
    if (!uid) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    try {
      const sub = await getActiveSubscription(uid);
      setSubscription(sub);
    } catch (err) {
      console.error("Не удалось проверить подписку:", err.message);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data?.session?.user?.id ?? null;
      setUserId(uid);
      loadSubscription(uid);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      setLoading(true);
      loadSubscription(uid);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return {
    isPro: Boolean(subscription),
    plan: subscription?.plan ?? null,
    periodEnd: subscription?.current_period_end ?? null,
    // Классы, на которые оформлена подписка (учитель выбирает при покупке)
    grades: subscription?.grades ?? [],
    // Бонус доступа к материалам для 9 класса (итоговая аттестация)
    examPrepBonus: subscription?.exam_prep_bonus ?? false,
    loading,
    refresh: () => {
      setLoading(true);
      loadSubscription(userId);
    },
  };
}
