create table public.learning_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_id integer not null check (unit_id between 1 and 6),
  expression_index integer not null default 0,
  completed_expressions integer not null default 0,
  total_expressions integer not null,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, unit_id),
  check (total_expressions = case unit_id when 1 then 12 when 2 then 10 when 3 then 5 when 4 then 6 when 5 then 5 when 6 then 5 end),
  check (expression_index >= 0 and expression_index < total_expressions),
  check (completed_expressions between 0 and total_expressions),
  check (completed_at is null or completed_expressions = total_expressions)
);
alter table public.learning_progress enable row level security;
revoke all on public.learning_progress from public, anon, authenticated;
grant select, insert, update on public.learning_progress to authenticated;
grant all on public.learning_progress to service_role;
create policy progress_read_own on public.learning_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy progress_insert_own on public.learning_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy progress_update_own on public.learning_progress for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create function public.record_learning_progress(p_unit_id integer, p_expression_index integer, p_complete boolean default false)
returns public.learning_progress language plpgsql security invoker set search_path = ''
as $$
declare
  member_id uuid := auth.uid();
  total integer;
  result public.learning_progress;
begin
  if member_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  total := case p_unit_id when 1 then 12 when 2 then 10 when 3 then 5 when 4 then 6 when 5 then 5 when 6 then 5 end;
  if total is null or p_expression_index is null or p_expression_index < 0 or p_expression_index >= total
    or p_complete is null or (p_complete and p_expression_index <> total - 1) then
    raise exception 'Invalid lesson progress' using errcode='22023';
  end if;
  insert into public.learning_progress as progress
    (user_id, unit_id, expression_index, completed_expressions, total_expressions, completed_at, updated_at)
  values (member_id, p_unit_id, p_expression_index, case when p_complete then total else p_expression_index end,
    total, case when p_complete then now() else null end, now())
  on conflict (user_id, unit_id) do update set
    expression_index = excluded.expression_index,
    completed_expressions = greatest(progress.completed_expressions, excluded.completed_expressions),
    completed_at = coalesce(progress.completed_at, excluded.completed_at),
    updated_at = now()
  returning * into result;
  return result;
end;
$$;
revoke all on function public.record_learning_progress(integer,integer,boolean) from public, anon;
grant execute on function public.record_learning_progress(integer,integer,boolean) to authenticated;
