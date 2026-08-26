-- The Big Table — Supabase-Schema (Phase 2/3)
-- Ausführen in: Supabase → SQL Editor → New query → Run

-- Profile werden automatisch beim ersten Login angelegt
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Kauf-Freischaltungen (geschrieben NUR von Netlify Functions via Service Role)
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid references auth.users (id),
  product text not null default 'big-table',
  license_key text unique,
  source text not null default 'gumroad',
  gumroad_sale_id text,
  refunded boolean not null default false,
  activated_at timestamptz,
  created_at timestamptz not null default now()
);
create index entitlements_email_idx on public.entitlements (lower(email));
alter table public.entitlements enable row level security;
create policy "read own entitlement" on public.entitlements
  for select using (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
-- keine Insert/Update-Policies für Nutzer: Schreiben nur per Service Role

-- Gespeicherte Menüs (Kernfeature der Premium-App)
create table public.menus (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  occasion_id text not null,
  name text not null,
  guest_count int not null check (guest_count between 2 and 60),
  data jsonb not null default '{}'::jsonb, -- Swaps, Auswahl, Planner-Stand
  updated_at timestamptz not null default now()
);
alter table public.menus enable row level security;
create policy "own menus" on public.menus
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Rezept-Notizen (heute localStorage → synchronisiert)
create table public.notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id text not null,
  body text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);
alter table public.notes enable row level security;
create policy "own notes" on public.notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Einstellungen (US/Metric etc.)
create table public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  units text not null default 'metric' check (units in ('us', 'metric')),
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
create policy "own settings" on public.settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
