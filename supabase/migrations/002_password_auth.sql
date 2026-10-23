-- Вход по email и паролю вместо dev-логина по handle.
-- Для базы, созданной по старой версии schema.sql. Выполнить один раз
-- в Supabase → SQL Editor.

alter table public.psychologists add column if not exists password_hash text;

-- Фото: только картинки и не больше 8 МБ (то же проверяет /api/upload)
update storage.buckets
set file_size_limit = 8388608,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'profile-images';
