-- ============================================================
-- QED Math Space — схема базы данных Supabase
-- Выполните весь файл целиком: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Профили учителей ---------------------------------------------------
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  school text,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Учитель видит и редактирует только свой профиль"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Автосоздание профиля при регистрации через Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Подписки -------------------------------------------------------------
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  plan text check (plan in ('month', 'year')) not null,
  status text check (status in ('active', 'canceled', 'expired')) default 'active',
  current_period_end timestamp with time zone not null,
  stripe_subscription_id text unique,
  created_at timestamp with time zone default now()
);

alter table subscriptions enable row level security;

create policy "Учитель видит только свою подписку"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Запись подписок делают только серверные функции через service-role ключ,
-- поэтому политики insert/update для обычных пользователей не создаются.


-- 3. Материалы (презентации, КСП, игры, рефлексии) ------------------------
create table if not exists materials (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text check (type in ('presentations', 'ksp', 'games', 'reflection')) not null,
  grade int not null check (grade between 5 and 11),
  quarter int check (quarter between 1 and 4),
  tag text,
  canva_url text,
  file_url text,
  game_id text,
  tool_id text,
  is_free boolean default false,
  created_at timestamp with time zone default now()
);

alter table materials enable row level security;

create policy "Авторизованные учителя читают материалы"
  on materials for select
  using (auth.role() = 'authenticated');


-- 4. Ответы рефлексии («Светофор понимания» и т.п.) -----------------------
create table if not exists lesson_reflections (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid,
  teacher_id uuid references auth.users on delete cascade not null,
  student_name text,
  answer text check (answer in ('green', 'yellow', 'red')) not null,
  created_at timestamp with time zone default now()
);

alter table lesson_reflections enable row level security;

create policy "Учитель видит ответы своих уроков"
  on lesson_reflections for select
  using (auth.uid() = teacher_id);

create policy "Кто угодно может отправить ответ рефлексии"
  on lesson_reflections for insert
  with check (true); -- ученики отвечают анонимно, без входа в аккаунт


-- 5. Индексы для частых запросов ------------------------------------------
create index if not exists idx_materials_type_grade on materials (type, grade);
create index if not exists idx_subscriptions_user on subscriptions (user_id, status);
create index if not exists idx_reflections_teacher on lesson_reflections (teacher_id, created_at desc);


-- 6. Демо-данные для проверки интерфейса (необязательно) -------------------
insert into materials (title, type, grade, quarter, tag, canva_url, is_free)
values
  ('Квадратные уравнения', 'presentations', 8, 3, 'Алгебра', 'https://www.canva.com/design/DAF000000000/view', true),
  ('Теорема Пифагора', 'presentations', 8, 3, 'Геометрия', 'https://www.canva.com/design/DAF000000001/view', false)
on conflict do nothing;
