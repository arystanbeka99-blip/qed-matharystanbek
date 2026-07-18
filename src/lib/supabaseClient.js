import { createClient } from "@supabase/supabase-js";

// Переменные окружения задаются в .env (Vite: VITE_..., CRA: REACT_APP_...)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============================================================
   СХЕМА БАЗЫ ДАННЫХ (справочно, выполнить в Supabase SQL Editor)
   ============================================================

create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  school text,
  created_at timestamp with time zone default now()
);

create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  plan text check (plan in ('month', 'year')) not null,
  status text check (status in ('active', 'canceled', 'expired')) default 'active',
  current_period_end timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

create table materials (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text check (type in ('presentations', 'ksp', 'games', 'reflection')) not null,
  grade int not null,
  quarter int,
  tag text,
  canva_url text,
  file_url text,
  is_free boolean default false,
  created_at timestamp with time zone default now()
);

-- RLS: подписки видит только владелец
alter table subscriptions enable row level security;
create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- RLS: материалы читают все авторизованные пользователи
alter table materials enable row level security;
create policy "Authenticated users can read materials"
  on materials for select
  using (auth.role() = 'authenticated');

============================================================ */

/**
 * Регистрация нового пользователя (учителя)
 */
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

/**
 * Вход существующего пользователя
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Получить активную подписку текущего пользователя.
 * Возвращает null, если подписки нет или она истекла.
 */
export async function getActiveSubscription(userId) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("current_period_end", new Date().toISOString())
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Список материалов по фильтрам (класс / четверть / тип)
 */
export async function fetchMaterials({ grade, quarter, type, language }) {
  let query = supabase.from("materials").select("*");
  if (grade) query = query.eq("grade", grade);
  if (quarter) query = query.eq("quarter", quarter);
  if (type) query = query.eq("type", type);
  if (language) query = query.eq("language", language);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
