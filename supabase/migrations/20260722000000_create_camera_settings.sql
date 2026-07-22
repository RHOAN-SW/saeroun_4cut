create table if not exists public.camera_settings (
  id text primary key,
  timer integer not null default 6 check (timer in (4, 6, 8, 12)),
  shots integer not null default 6 check (shots in (4, 6, 8)),
  mirror boolean not null default true,
  filter boolean not null default false,
  show_guide boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.camera_settings enable row level security;

insert into public.camera_settings (id)
values ('default')
on conflict (id) do nothing;
