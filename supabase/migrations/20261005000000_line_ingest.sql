-- LINE Webhook が、ログインなしで会員と反応を保存するための入口。
-- service_role はアプリに置かない。署名検証は Next.js 側で行い、
-- ここはサーバーだけが知る LINE_INGEST_SECRET が一致したときだけ書く。

alter table public.line_members
  add column if not exists unfollowed_at timestamptz;

comment on column public.line_members.unfollowed_at is 'ブロックまたは友だち解除。null なら配信対象。';

create table if not exists public.aqualine_line_ingest_secret (
  id boolean primary key default true check (id),
  secret text not null,
  updated_at timestamptz not null default now()
);

alter table public.aqualine_line_ingest_secret enable row level security;
revoke all on table public.aqualine_line_ingest_secret from anon, authenticated;

create or replace function public.aqualine_set_line_ingest_secret(next_secret text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.aqualine_is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if next_secret is null or length(next_secret) < 16 then
    raise exception 'invalid secret' using errcode = '22023';
  end if;
  insert into public.aqualine_line_ingest_secret (id, secret)
  values (true, next_secret)
  on conflict (id) do update
    set secret = excluded.secret,
        updated_at = now();
end;
$$;

create or replace function public.aqualine_line_ingest(ingest_secret text, payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  expected text;
  kind text;
  line_user text;
  member uuid;
  broadcast uuid;
  property uuid;
  reaction_type text;
begin
  select secret into expected from public.aqualine_line_ingest_secret where id = true;
  if expected is null or ingest_secret is null or ingest_secret <> expected then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  kind := payload->>'kind';
  line_user := payload->>'lineId';
  if line_user is null or length(line_user) = 0 or length(line_user) > 128 then
    raise exception 'invalid member' using errcode = '22023';
  end if;

  if kind = 'follow' then
    insert into public.line_members (line_id, display_name, initial, hue, source, unfollowed_at)
    values (
      line_user,
      left(coalesce(nullif(payload->>'displayName', ''), 'LINE会員'), 80),
      left(coalesce(nullif(payload->>'initial', ''), 'L'), 8),
      coalesce((payload->>'hue')::int, 180),
      '公式LINE',
      null
    )
    on conflict (line_id) do update
      set display_name = excluded.display_name,
          initial = excluded.initial,
          hue = excluded.hue,
          source = '公式LINE',
          unfollowed_at = null,
          updated_at = now();
    return;
  end if;

  if kind = 'unfollow' then
    update public.line_members
      set unfollowed_at = now(),
          source = '離脱',
          updated_at = now()
      where line_id = line_user;
    return;
  end if;

  if kind <> 'reaction' then
    return;
  end if;

  insert into public.line_members (line_id, display_name, initial, hue, source)
  values (
    line_user,
    left(coalesce(nullif(payload->>'displayName', ''), 'LINE会員'), 80),
    left(coalesce(nullif(payload->>'initial', ''), 'L'), 8),
    coalesce((payload->>'hue')::int, 180),
    'メッセージ'
  )
  on conflict (line_id) do update
    set display_name = case
          when excluded.display_name = 'LINE会員' then public.line_members.display_name
          else excluded.display_name
        end,
        initial = case
          when excluded.display_name = 'LINE会員' then public.line_members.initial
          else excluded.initial
        end,
        updated_at = now()
  returning id into member;

  if payload->>'propertyId' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    property := (payload->>'propertyId')::uuid;
    select id into broadcast
      from public.broadcasts
      where property_id = property
      order by sent_at desc
      limit 1;
  else
    select id, property_id into broadcast, property
      from public.broadcasts
      order by sent_at desc
      limit 1;
  end if;

  if broadcast is null or property is null or member is null then
    return;
  end if;

  reaction_type := case payload->>'type'
    when 'like' then 'like'
    when 'stamp' then 'stamp'
    else 'text'
  end;

  insert into public.reactions (broadcast_id, property_id, member_id, type, stamp, message)
  values (
    broadcast,
    property,
    member,
    reaction_type,
    nullif(left(coalesce(payload->>'stamp', ''), 80), ''),
    nullif(left(coalesce(payload->>'message', ''), 500), '')
  )
  on conflict (broadcast_id, member_id) do nothing;
end;
$$;

revoke all on function public.aqualine_set_line_ingest_secret(text) from public;
revoke all on function public.aqualine_line_ingest(text, jsonb) from public;
grant execute on function public.aqualine_set_line_ingest_secret(text) to authenticated;
grant execute on function public.aqualine_line_ingest(text, jsonb) to anon, authenticated;
