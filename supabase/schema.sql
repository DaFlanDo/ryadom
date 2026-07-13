-- ════════════════════════════════════════════════════════════
--  Ryadom · схема БД (Supabase / Postgres)
--  Выполнить в Supabase → SQL Editor один раз.
--  Фундамент: одна таблица-психолог. Профиль — jsonb (объект Profile
--  из lib/types.ts). Будущие таблицы (записи, заметки, события
--  конверсии) будут ссылаться на psychologists.id.
-- ════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

create table if not exists public.psychologists (
  id           uuid primary key default gen_random_uuid(),
  handle       text unique not null,          -- публичный адрес: /u/<handle>
  email        text unique,                   -- на будущее (email-вход)
  telegram_id  bigint unique,                 -- на будущее (вход через Telegram Mini App)
  display_name text,
  profile      jsonb not null default '{}'::jsonb,  -- весь Profile целиком
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Доступ к данным — только через серверный код под service-role ключом
-- (он минует RLS). Включаем RLS без политик, чтобы закрыть прямой
-- анонимный/публичный доступ к таблице. Владение проверяем в роутах.
alter table public.psychologists enable row level security;

-- ────────────────────────────────────────────────────────────
--  Storage (создать вручную в дашборде):
--  Storage → New bucket → name: "profile-images", Public bucket: ✅
--  Загрузку фото делает серверный роут /api/upload под service-role,
--  чтение — по public URL (bucket публичный), ключей не требует.
-- ────────────────────────────────────────────────────────────
