-- 最初の運営アカウントを profiles に1件追加する。
-- Authentication のメールアドレスから auth.users を探す。
-- 既存行の更新・削除はしない。同じ人が既にいれば何もしない。
-- SQL Editor で、下の select が1件返ったあとに insert を1回だけ実行する。

-- 確認済み（2026-10-02）: auth.users に admin@example.com が1件ある。
-- id は 8bba23f6-4809-4b4d-a4d7-4cb59228005e
-- 画面表示の 4800 は誤読。メールアドレスで照合する。

-- 2. 上で1行出たときだけ、この insert を実行する
insert into public.profiles (auth_user_id, name, role, title)
select u.id, '運営', 'admin', '運営'
from auth.users u
where u.email = 'admin@example.com'
  and not exists (
    select 1
    from public.profiles p
    where p.auth_user_id = u.id
  );
