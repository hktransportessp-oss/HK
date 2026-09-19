-- Controle de liberação operacional da carga.
-- Aplicar no Supabase SQL Editor ou via ferramenta de migrations.
-- Não contém tokens, certificados ou credenciais.

create table if not exists public.trip_clearances (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null,
  romaneio_id text,
  driver_id text,
  clearance_status text not null default 'AGUARDANDO_LIBERACAO'
    check (clearance_status in (
      'AGUARDANDO_LIBERACAO',
      'CARGA_LIBERADA',
      'LIBERACAO_MANUAL',
      'LIBERACAO_PENDENTE',
      'ERRO_LIBERACAO'
    )),
  provider text not null default 'AVERBEPORTO',
  provider_protocol text,
  cte_status text,
  mdfe_status text,
  last_attempt_at timestamptz,
  provider_response_sanitized jsonb,
  error_code text,
  error_message text,
  released_at timestamptz,
  released_by text,
  manual_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id)
);

create table if not exists public.trip_clearance_audits (
  id uuid primary key default gen_random_uuid(),
  clearance_id uuid not null references public.trip_clearances(id) on delete cascade,
  event_type text not null
    check (event_type in ('PROVIDER_RESPONSE', 'MANUAL_RELEASE', 'STATUS_CHANGE', 'ERROR')),
  previous_status text,
  new_status text,
  actor_user_id text,
  actor_name text,
  reason text,
  provider_protocol text,
  provider_response_sanitized jsonb,
  created_at timestamptz not null default now()
);

create index if not exists trip_clearances_status_idx
  on public.trip_clearances (clearance_status);

create index if not exists trip_clearances_driver_idx
  on public.trip_clearances (driver_id);

create index if not exists trip_clearance_audits_clearance_idx
  on public.trip_clearance_audits (clearance_id, created_at desc);

-- O backend usa a service role para ler/escrever estas tabelas.
-- Sem policies públicas, o frontend não acessa os dados diretamente.
alter table public.trip_clearances enable row level security;
alter table public.trip_clearance_audits enable row level security;

comment on table public.trip_clearances is
  'Estado atual da liberação operacional da viagem, sem armazenar segredos.';

comment on table public.trip_clearance_audits is
  'Histórico imutável de respostas do provedor e liberações administrativas.';