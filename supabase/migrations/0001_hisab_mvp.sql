create extension if not exists "pgcrypto";

create type public.debt_direction as enum ('owed_to_me', 'i_owe');
create type public.debt_status as enum ('pending', 'partial', 'paid', 'overdue');
create type public.reminder_type as enum ('friendly', 'due_today', 'overdue_3_days', 'overdue_weekly', 'manual');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  reminder_tone text not null default 'friendly',
  email_reminders boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  remaining_amount numeric(12,2) not null check (remaining_amount >= 0),
  currency text not null default 'NPR',
  direction public.debt_direction not null,
  status public.debt_status not null default 'pending',
  due_date date not null,
  notes text,
  original_input text,
  reminder_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid not null references public.debts(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  paid_at timestamptz not null default now(),
  note text
);

create table public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid not null references public.debts(id) on delete cascade,
  email text not null,
  reminder_type public.reminder_type not null,
  sent_at timestamptz not null default now(),
  success boolean not null default false
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid not null references public.debts(id) on delete cascade,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index contacts_user_id_idx on public.contacts(user_id);
create index debts_user_id_status_idx on public.debts(user_id, status);
create index debts_due_date_idx on public.debts(due_date);
create index payments_debt_id_idx on public.payments(debt_id);
create index reminder_logs_debt_id_idx on public.reminder_logs(debt_id);
create index activity_logs_debt_id_idx on public.activity_logs(debt_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger debts_set_updated_at
before update on public.debts
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.debts enable row level security;
alter table public.payments enable row level security;
alter table public.reminder_logs enable row level security;
alter table public.activity_logs enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

create policy "contacts_own_all" on public.contacts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "debts_own_all" on public.debts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "payments_own_all" on public.payments
for all using (
  exists (
    select 1 from public.debts
    where debts.id = payments.debt_id and debts.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.debts
    where debts.id = payments.debt_id and debts.user_id = auth.uid()
  )
);

create policy "reminder_logs_own_all" on public.reminder_logs
for all using (
  exists (
    select 1 from public.debts
    where debts.id = reminder_logs.debt_id and debts.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.debts
    where debts.id = reminder_logs.debt_id and debts.user_id = auth.uid()
  )
);

create policy "activity_logs_own_all" on public.activity_logs
for all using (
  exists (
    select 1 from public.debts
    where debts.id = activity_logs.debt_id and debts.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.debts
    where debts.id = activity_logs.debt_id and debts.user_id = auth.uid()
  )
);
