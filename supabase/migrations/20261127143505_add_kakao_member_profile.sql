-- 카카오 공급자는 서버가 기록하는 app_metadata로만 구분한다.
-- 닉네임은 표시용이며 권한이나 기존 계정 연결에 사용하지 않는다.
create or replace function private.create_member_profile() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  ticket_name text;
  kakao_username text;
  kakao_name text;
begin
  if new.raw_app_meta_data->>'provider' = 'kakao' then
    kakao_name := left(btrim(coalesce(
      nullif(btrim(new.raw_user_meta_data->>'name'), ''),
      nullif(btrim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data->>'nickname'), ''),
      '카카오 회원')), 50);
    loop
      kakao_username := 'k_' || left(replace(gen_random_uuid()::text, '-', ''), 18);
      exit when not exists (select 1 from public.member_profiles where username = kakao_username);
    end loop;
    insert into public.member_profiles (id, username, name)
    values (new.id, kakao_username, kakao_name);
  elsif new.email like '%@accounts.sonmalitgi.invalid' then
    delete from private.registration_tickets
    where username = split_part(new.email, '@', 1)
      and token::text = new.raw_user_meta_data->>'registration_token'
      and expires_at > now()
    returning name into ticket_name;
    if ticket_name is null then raise exception 'Use the username registration endpoint'; end if;
    insert into public.member_profiles (id, username, name)
    values (new.id, split_part(new.email, '@', 1), ticket_name);
  end if;
  return new;
end;
$$;
revoke all on function private.create_member_profile() from public, anon, authenticated;
