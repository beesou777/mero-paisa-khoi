alter table public.profiles
add column if not exists default_currency text not null default 'NPR',
add column if not exists default_reminder_enabled boolean not null default true;
