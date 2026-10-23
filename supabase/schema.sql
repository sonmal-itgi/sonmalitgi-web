create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table private.registration_tickets (
  token uuid primary key,
  username text not null unique,
  name text not null,
  expires_at timestamptz not null default now() + interval '5 minutes'
);
alter table private.registration_tickets enable row level security;
grant select, insert, delete on private.registration_tickets to service_role;
create policy service_manage_tickets on private.registration_tickets
  for all to service_role using (true) with check (true);


create table public.member_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{4,20}$'),
  name text not null check (name = btrim(name) and char_length(name) between 1 and 50),
  created_at timestamptz not null default now()
);
alter table public.member_profiles enable row level security;
revoke all on public.member_profiles from public, anon, authenticated;
grant select on public.member_profiles to authenticated;
grant all on public.member_profiles to service_role;
create policy members_read_own_profile on public.member_profiles for select to authenticated
  using ((select auth.uid()) = id);

create function private.create_member_profile() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare ticket_name text;
begin
  if new.email like '%@accounts.sonmalitgi.invalid' then
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
create trigger sonmalitgi_create_member_profile after insert on auth.users
for each row execute function private.create_member_profile();

create table private.signup_attempts (
  bucket timestamptz not null,
  key text not null,
  attempts integer not null,
  primary key (bucket, key)
);
alter table private.signup_attempts enable row level security;
grant select, insert, update, delete on private.signup_attempts to service_role;
create policy service_manage_signup_limits on private.signup_attempts
  for all to service_role using (true) with check (true);
create function public.consume_signup_limit(identifier_hash text, address_hash text) returns boolean
language plpgsql security invoker set search_path = ''
as $$
declare
  current_bucket timestamptz := date_trunc('hour', now());
begin
  if identifier_hash !~ '^[a-f0-9]{64}$' or address_hash !~ '^[a-f0-9]{64}$' then
    return false;
  end if;
  perform pg_advisory_xact_lock(183647, 90218);
  delete from private.signup_attempts where bucket < current_bucket - interval '1 hour';
  if exists (
    select 1 from private.signup_attempts where bucket = current_bucket and
      ((key = 'global' and attempts >= 100)
       or (key = 'id:' || identifier_hash and attempts >= 5)
       or (key = 'ip:' || address_hash and attempts >= 20))
  ) then return false; end if;
  insert into private.signup_attempts (bucket, key, attempts) values
    (current_bucket, 'global', 1), (current_bucket, 'id:' || identifier_hash, 1),
    (current_bucket, 'ip:' || address_hash, 1)
  on conflict (bucket, key) do update set attempts = private.signup_attempts.attempts + 1;
  return true;
end;
$$;
revoke all on function public.consume_signup_limit(text, text) from public, anon, authenticated;
grant execute on function public.consume_signup_limit(text, text) to service_role;

create function public.prepare_registration(registration_token uuid, member_username text, member_name text) returns void language plpgsql security invoker set search_path='' as $$
begin
  delete from private.registration_tickets where expires_at < now();
  insert into private.registration_tickets(token,username,name) values (registration_token,member_username,member_name);
end; $$;
revoke all on function public.prepare_registration(uuid,text,text) from public,anon,authenticated;
grant execute on function public.prepare_registration(uuid,text,text) to service_role;
create function public.discard_registration(registration_token uuid) returns void language sql security invoker set search_path='' as $$
delete from private.registration_tickets where token=registration_token;
$$;
revoke all on function public.discard_registration(uuid) from public,anon,authenticated;
grant execute on function public.discard_registration(uuid) to service_role;
