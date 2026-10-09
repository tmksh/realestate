-- マンション発信ツール 初期スキーマ（暫定仕様）
--
-- 【実行しないこと】
-- 接続中の Supabase は本番の可能性がある。このファイルは提示用。
-- ダッシュボードの SQL Editor や supabase db push は、担当者確認後に行う。
--
-- 【この migration がやること】
-- 1. 業務テーブル 8 本と中間テーブル 1 本を作る
-- 2. auth.users へ後から紐づけられる列を空で用意する
-- 3. RLS を有効化し、ログイン後の権限方針をポリシーとして入れる
-- 4. デモデータは入れない
--
-- 【やらないこと】
-- Authentication の切替、LINE API、Storage アップロード、localStorage 削除
-- DROP TABLE / TRUNCATE / DELETE / 既存データの UPDATE / デモデータ INSERT
--
-- 【暫定仕様】
-- Web 利用者: 管理会社担当者 / 運営 / オーナー
-- LINE 会員は管理画面にログインしない
-- 担当者は company_id 単位で自社物件を共有
-- オーナーは割り当て物件の閲覧のみ（更新は仕様確定後）
-- 画像・PDF は今は URL / ファイル名。後で Storage の公開 URL を同じ列に入れられる
-- 未ログイン（anon）にはテーブル権限を付けない

-- ---------------------------------------------------------------------------
-- 共通: updated_at（プロジェクト専用名）
-- ---------------------------------------------------------------------------
create or replace function public.aqualine_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- companies
-- 管理会社マスタ。担当者と物件の所属先。
-- ---------------------------------------------------------------------------
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.companies is '管理会社。デモの companyId（sunrise / minato）は legacy_id に入れる。';
comment on column public.companies.legacy_id is 'TODO 要確認: localStorage の文字列ID。移行後に削除してよい。';

create trigger companies_aqualine_set_updated_at
before update on public.companies
for each row execute procedure public.aqualine_set_updated_at();

-- ---------------------------------------------------------------------------
-- profiles
-- 管理会社担当者と運営。オーナーとは別。
-- auth_user_id は Authentication 実装時に埋める（今は null のまま）。
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  company_id uuid references public.companies (id) on delete restrict,
  name text not null,
  role text not null,
  title text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('company', 'admin')),
  constraint profiles_company_required_for_staff check (
    (role = 'admin' and company_id is null)
    or (role = 'company' and company_id is not null)
  )
);

comment on table public.profiles is 'Web に入る担当者・運営。オーナーは owners。LINE 会員は line_members。';
comment on column public.profiles.auth_user_id is 'TODO: Authentication 実装時に auth.users.id を入れる。';
comment on column public.profiles.role is 'company = 管理会社担当者 / admin = 運営。owner は入れない。';

create index profiles_company_id_idx on public.profiles (company_id);

create trigger profiles_aqualine_set_updated_at
before update on public.profiles
for each row execute procedure public.aqualine_set_updated_at();

-- ---------------------------------------------------------------------------
-- owners
-- 運営が発行するオーナー。物件の作成者ではない。
-- affiliation は現行どおり自由記述。company_id は後から結べるよう任意。
-- ---------------------------------------------------------------------------
create table public.owners (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  company_id uuid references public.companies (id) on delete set null,
  name text not null,
  email text not null,
  affiliation text not null default '',
  status text not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint owners_status_check check (status in ('active', 'invited', 'suspended'))
);

comment on table public.owners is 'オーナーアカウント。トップからは入らず、割り当て物件だけ見る。更新は運営のみ。';
comment on column public.owners.auth_user_id is 'TODO: 本番でオーナー自己ログインする場合に埋める。暫定では null。';
comment on column public.owners.company_id is '要確認: 所属を会社に固定するか。今は任意。affiliation を表示用に残す。';
comment on column public.owners.email is '要確認: 一意にするか。暫定では unique にしない（デモ重複を避けるため後で追加可）。';

create index owners_company_id_idx on public.owners (company_id);
create index owners_status_idx on public.owners (status);

create trigger owners_aqualine_set_updated_at
before update on public.owners
for each row execute procedure public.aqualine_set_updated_at();

-- ---------------------------------------------------------------------------
-- properties
-- 未公開物件。会社に属する。担当者個人の持ち物ではない。
-- images / pdf_name は現行 UI と同じ。Storage 移行後も URL 文字列を入れられる。
-- ---------------------------------------------------------------------------
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  company_id uuid not null references public.companies (id) on delete restrict,
  company_name text not null,
  status text not null default 'draft',
  name text not null default '',
  building_name text not null default '',
  prefecture text not null default '東京都',
  city text not null default '',
  town text not null default '',
  address_detail text not null default '',
  room_number text not null default '',
  floor integer not null default 1,
  total_floors integer not null default 1,
  layout text not null default '',
  area numeric not null default 0,
  balcony_area numeric,
  built_year integer not null default 2000,
  built_month integer not null default 1,
  direction text not null default '',
  station text not null default '',
  walk_minutes integer not null default 0,
  -- 価格は万円。管理費・積立は円。単位を混ぜないこと。
  price numeric not null default 0,
  management_fee numeric not null default 0,
  reserve_fund numeric not null default 0,
  highlights text[] not null default '{}',
  notes text not null default '',
  images text[] not null default '{}',
  pdf_name text,
  pdf_url text,
  pet_allowed boolean not null default false,
  masked_fields text[] not null default '{}',
  broadcast_format text not null default 'bullets',
  custom_message text not null default '',
  reject_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  broadcasted_at timestamptz,
  constraint properties_status_check check (
    status in ('draft', 'submitted', 'rejected', 'ready', 'broadcasted')
  ),
  constraint properties_broadcast_format_check check (
    broadcast_format in ('bullets', 'card', 'pdf')
  )
);

comment on table public.properties is '未公開物件。所属は company_id。作成者ユーザーIDは持たない（暫定）。';
comment on column public.properties.company_name is '現行 UI 用の社名コピー。companies.name と二重。要確認: 正規化後に削除可。';
comment on column public.properties.price is '万円。円ではない。';
comment on column public.properties.management_fee is '円/月。';
comment on column public.properties.reserve_fund is '円/月。';
comment on column public.properties.images is '今は外部URL。将来は Storage の公開URLを同じ配列に入れられる。アップロード実装はまだしない。';
comment on column public.properties.pdf_name is '表示用ファイル名。実ファイルはまだ保存しない。';
comment on column public.properties.pdf_url is '将来 Storage のURL用。今は未使用でよい。';
comment on column public.properties.masked_fields is '現行キー: addressDetail, roomNumber, price, buildingName, managementFee, ownerNote';

create index properties_company_id_idx on public.properties (company_id);
create index properties_status_idx on public.properties (status);

create trigger properties_aqualine_set_updated_at
before update on public.properties
for each row execute procedure public.aqualine_set_updated_at();

-- ---------------------------------------------------------------------------
-- owner_properties
-- オーナーが見られる物件。現行の propertyIds 配列を正規化。
-- ---------------------------------------------------------------------------
create table public.owner_properties (
  owner_id uuid not null references public.owners (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_id, property_id)
);

comment on table public.owner_properties is 'オーナーと物件の割り当て。発行後の変更UIは未実装（要確認）。';

create index owner_properties_property_id_idx on public.owner_properties (property_id);

-- ---------------------------------------------------------------------------
-- broadcasts
-- 1回の公式LINE配信記録。実送信はまだしない。
-- ---------------------------------------------------------------------------
create table public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  property_id uuid not null references public.properties (id) on delete restrict,
  sent_at timestamptz not null default now(),
  format text not null,
  recipient_count integer not null default 0,
  message_text text not null default '',
  created_at timestamptz not null default now(),
  constraint broadcasts_format_check check (format in ('bullets', 'card', 'pdf'))
);

comment on table public.broadcasts is '配信1回分。LINE API は未接続。';
comment on column public.broadcasts.recipient_count is '要確認: デモは 12+236 の仮数。本番の実数にするかは未確定。';

create index broadcasts_property_id_idx on public.broadcasts (property_id);
create index broadcasts_sent_at_idx on public.broadcasts (sent_at desc);

-- ---------------------------------------------------------------------------
-- line_members
-- 公式LINEの友だち。profiles / owners とは別。Webログインしない。
-- ---------------------------------------------------------------------------
create table public.line_members (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  line_id text not null unique,
  display_name text not null,
  initial text not null default '',
  hue integer not null default 180,
  source text not null default '',
  registered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.line_members is 'LINE会員。取得APIは未実装。line_id は将来の LINE userId 用。';
comment on column public.line_members.line_id is 'TODO: LINE Webhook 実装時に実IDを入れる。今はデモ文字列で可。';
comment on column public.line_members.hue is 'アバター色。UI専用。';

create trigger line_members_aqualine_set_updated_at
before update on public.line_members
for each row execute procedure public.aqualine_set_updated_at();

-- ---------------------------------------------------------------------------
-- reactions
-- 配信への反応。現行どおり配信×会員は1件。
-- ---------------------------------------------------------------------------
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  broadcast_id uuid not null references public.broadcasts (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete restrict,
  member_id uuid not null references public.line_members (id) on delete restrict,
  type text not null,
  stamp text,
  message text,
  created_at timestamptz not null default now(),
  constraint reactions_type_check check (type in ('like', 'stamp', 'text')),
  constraint reactions_broadcast_member_unique unique (broadcast_id, member_id)
);

comment on table public.reactions is 'いいね・スタンプ・テキスト。Webhook未接続。一意制約は現行コード準拠（要確認）。';

create index reactions_property_id_idx on public.reactions (property_id);
create index reactions_member_id_idx on public.reactions (member_id);
create index reactions_created_at_idx on public.reactions (created_at desc);

-- ---------------------------------------------------------------------------
-- RLS 用ヘルパー（すべて aqualine_ プレフィックス）
-- auth.uid() が無い（未ログイン）ときはすべて false / null。
-- Authentication 前はクライアントから行は見えない（安全側）。
-- ---------------------------------------------------------------------------
create or replace function public.aqualine_current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.aqualine_current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.aqualine_current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.aqualine_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where auth_user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.aqualine_current_owner_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.owners
  where auth_user_id = auth.uid() and status = 'active'
  limit 1;
$$;

create or replace function public.aqualine_can_access_property(target_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.aqualine_is_admin()
    or exists (
      select 1 from public.properties p
      where p.id = target_property_id
        and p.company_id is not distinct from public.aqualine_current_company_id()
    )
    or exists (
      select 1 from public.owner_properties op
      where op.property_id = target_property_id
        and op.owner_id is not distinct from public.aqualine_current_owner_id()
    );
$$;

revoke all on function public.aqualine_set_updated_at() from public;
revoke all on function public.aqualine_current_profile_id() from public;
revoke all on function public.aqualine_current_profile_role() from public;
revoke all on function public.aqualine_current_company_id() from public;
revoke all on function public.aqualine_is_admin() from public;
revoke all on function public.aqualine_current_owner_id() from public;
revoke all on function public.aqualine_can_access_property(uuid) from public;

grant execute on function public.aqualine_current_profile_id() to authenticated;
grant execute on function public.aqualine_current_profile_role() to authenticated;
grant execute on function public.aqualine_current_company_id() to authenticated;
grant execute on function public.aqualine_is_admin() to authenticated;
grant execute on function public.aqualine_current_owner_id() to authenticated;
grant execute on function public.aqualine_can_access_property(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- anon にはテーブル GRANT もポリシーも付けない。
-- authenticated のみ。アプリはまだ localStorage のため、ポリシーは将来ログイン後用。
-- ---------------------------------------------------------------------------
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.owners enable row level security;
alter table public.owner_properties enable row level security;
alter table public.properties enable row level security;
alter table public.broadcasts enable row level security;
alter table public.line_members enable row level security;
alter table public.reactions enable row level security;

-- companies: 運営は全部。担当者は自社のみ。オーナーは所属会社があればその1社を閲覧。
create policy companies_select on public.companies
for select to authenticated
using (
  public.aqualine_is_admin()
  or id = public.aqualine_current_company_id()
  or id = (select company_id from public.owners where id = public.aqualine_current_owner_id())
);

create policy companies_write_admin on public.companies
for all to authenticated
using (public.aqualine_is_admin())
with check (public.aqualine_is_admin());

-- profiles: 自分は読める。運営は全部。同じ会社の担当者同士は読める。
-- 自己更新は付けない（role / company_id / auth_user_id の改変を防ぐ）。
-- 作成・更新・削除は運営だけ。
create policy profiles_select on public.profiles
for select to authenticated
using (
  public.aqualine_is_admin()
  or auth_user_id = auth.uid()
  or (company_id is not null and company_id = public.aqualine_current_company_id())
);

-- TODO 要確認: プロフィールの作成を運営だけにするか、signup トリガーにするか。
create policy profiles_write_admin on public.profiles
for all to authenticated
using (public.aqualine_is_admin())
with check (public.aqualine_is_admin());

-- owners: 運営は全部。本人（利用中）は自分だけ閲覧。
create policy owners_select on public.owners
for select to authenticated
using (
  public.aqualine_is_admin()
  or id = public.aqualine_current_owner_id()
);

create policy owners_write_admin on public.owners
for all to authenticated
using (public.aqualine_is_admin())
with check (public.aqualine_is_admin());

-- owner_properties
create policy owner_properties_select on public.owner_properties
for select to authenticated
using (
  public.aqualine_is_admin()
  or owner_id = public.aqualine_current_owner_id()
);

create policy owner_properties_write_admin on public.owner_properties
for all to authenticated
using (public.aqualine_is_admin())
with check (public.aqualine_is_admin());

-- properties
-- 閲覧: 運営=全部 / 担当者=自社 / オーナー=割当
-- 作成・更新: 担当者は自社。運営は全部。オーナーは更新しない（仕様確定後）。
-- 削除: 現行UIにない。ポリシーも作らない（要確認）。
create policy properties_select on public.properties
for select to authenticated
using (public.aqualine_can_access_property(id));

create policy properties_insert_company on public.properties
for insert to authenticated
with check (
  public.aqualine_is_admin()
  or (
    public.aqualine_current_profile_role() = 'company'
    and company_id = public.aqualine_current_company_id()
  )
);

create policy properties_update_company_or_admin on public.properties
for update to authenticated
using (
  public.aqualine_is_admin()
  or (
    public.aqualine_current_profile_role() = 'company'
    and company_id = public.aqualine_current_company_id()
  )
)
with check (
  public.aqualine_is_admin()
  or (
    public.aqualine_current_profile_role() = 'company'
    and company_id = public.aqualine_current_company_id()
  )
);

-- TODO 要確認: 確認待ち以降の編集ロックは今はUI側。DB制約にはしていない。
-- TODO 要確認: オーナーの物件編集は仕様確定後に、変更してよい列だけ許可する。

-- broadcasts: 作るのは運営だけ。読むのは物件を見られる人。
create policy broadcasts_select on public.broadcasts
for select to authenticated
using (public.aqualine_can_access_property(property_id));

create policy broadcasts_insert_admin on public.broadcasts
for insert to authenticated
with check (public.aqualine_is_admin());

create policy broadcasts_update_admin on public.broadcasts
for update to authenticated
using (public.aqualine_is_admin())
with check (public.aqualine_is_admin());

-- line_members: 運営だけ。担当者・オーナーは会員PIIを直接見ない（現行画面どおり）。
create policy line_members_admin on public.line_members
for all to authenticated
using (public.aqualine_is_admin())
with check (public.aqualine_is_admin());

-- reactions: 読むのは物件を見られる人。書くのは当面運営。
-- TODO 要確認: Webhook 実装後は、署名検証済みのサーバー処理で入れる。service_role はアプリに置かない。
create policy reactions_select on public.reactions
for select to authenticated
using (public.aqualine_can_access_property(property_id));

create policy reactions_write_admin on public.reactions
for all to authenticated
using (public.aqualine_is_admin())
with check (public.aqualine_is_admin());

-- テーブル権限は authenticated のみ。
-- 新規表に default privileges で anon が付いても、直後に外す（データは消さない）。
grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.companies,
  public.profiles,
  public.owners,
  public.owner_properties,
  public.properties,
  public.broadcasts,
  public.line_members,
  public.reactions
to authenticated;

revoke all on table
  public.companies,
  public.profiles,
  public.owners,
  public.owner_properties,
  public.properties,
  public.broadcasts,
  public.line_members,
  public.reactions
from anon;
