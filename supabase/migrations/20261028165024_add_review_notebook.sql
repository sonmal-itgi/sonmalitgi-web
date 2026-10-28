-- Personal study notes, not trusted evidence for lesson credit or unit unlocks.
create table public.review_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_id integer not null check(unit_id between 1 and 6),
  expression_index integer not null,
  target_id text not null check(length(target_id) between 1 and 64),
  mistake_count integer not null default 1 check(mistake_count > 0),
  feedback text not null default '' check(length(feedback) <= 500),
  last_failed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  primary key(user_id, unit_id, expression_index),
  check(expression_index >= 0 and expression_index < case unit_id when 1 then 12 when 2 then 10 when 3 then 5 when 4 then 6 when 5 then 5 when 6 then 5 end)
);
create index review_notes_recent on public.review_notes(user_id, updated_at desc);
-- Unique attempts make retrying a failed HTTP save safe.
create table public.review_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid not null,
  unit_id integer not null check(unit_id between 1 and 6),
  expression_index integer not null,
  result text not null check(result in ('PASS','FAIL')),
  primary key(user_id, attempt_id),
  check(expression_index >= 0 and expression_index < case unit_id when 1 then 12 when 2 then 10 when 3 then 5 when 4 then 6 when 5 then 5 when 6 then 5 end)
);
alter table public.review_notes enable row level security;
alter table public.review_attempts enable row level security;
revoke all on public.review_notes, public.review_attempts from public, anon, authenticated;
grant select, insert, update on public.review_notes to authenticated;
grant select, insert on public.review_attempts to authenticated;
grant all on public.review_notes, public.review_attempts to service_role;
create policy review_notes_read on public.review_notes for select to authenticated using((select auth.uid()) = user_id);
create policy review_notes_insert on public.review_notes for insert to authenticated with check((select auth.uid()) = user_id);
create policy review_notes_update on public.review_notes for update to authenticated using((select auth.uid()) = user_id) with check((select auth.uid()) = user_id);
create policy review_attempts_read on public.review_attempts for select to authenticated using((select auth.uid()) = user_id);
create policy review_attempts_insert on public.review_attempts for insert to authenticated with check((select auth.uid()) = user_id);

create function public.record_review_result(p_unit_id integer, p_expression_index integer, p_target_id text, p_attempt_id uuid, p_result text, p_feedback text default '')
returns public.review_notes language plpgsql security invoker set search_path = '' as $$
declare
  member_id uuid := auth.uid();
  total integer := case p_unit_id when 1 then 12 when 2 then 10 when 3 then 5 when 4 then 6 when 5 then 5 when 6 then 5 end;
  inserted_count integer;
  note public.review_notes;
begin
  if member_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if total is null or p_expression_index is null or p_expression_index < 0 or p_expression_index >= total
    or p_target_id is null or length(p_target_id) not between 1 and 64 or p_attempt_id is null
    or p_result is null or p_result not in ('PASS','FAIL') or p_feedback is null or length(p_feedback) > 500 then
    raise exception 'Invalid review result' using errcode='22023';
  end if;
  -- Serialize all outcomes for the same expression, including a first FAIL followed by PASS.
  perform pg_advisory_xact_lock(hashtextextended(member_id::text || ':' || p_unit_id::text || ':' || p_expression_index::text, 0));
  insert into public.review_attempts(user_id, attempt_id, unit_id, expression_index, result)
  values(member_id,p_attempt_id,p_unit_id,p_expression_index,p_result) on conflict do nothing;
  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then
    select * into note from public.review_notes where user_id=member_id and unit_id=p_unit_id and expression_index=p_expression_index;
    return note;
  end if;
  if p_result='FAIL' then
    insert into public.review_notes as existing(user_id,unit_id,expression_index,target_id,feedback)
    values(member_id,p_unit_id,p_expression_index,p_target_id,p_feedback)
    on conflict(user_id,unit_id,expression_index) do update set
      mistake_count=existing.mistake_count+1, target_id=excluded.target_id, feedback=excluded.feedback,
      last_failed_at=now(), updated_at=now(), resolved_at=null
    returning * into note;
  else
    update public.review_notes set resolved_at=coalesce(resolved_at,now()), updated_at=now()
    where user_id=member_id and unit_id=p_unit_id and expression_index=p_expression_index and target_id=p_target_id
    returning * into note;
  end if;
  return note;
end;
$$;
revoke all on function public.record_review_result(integer,integer,text,uuid,text,text) from public, anon;
grant execute on function public.record_review_result(integer,integer,text,uuid,text,text) to authenticated;
