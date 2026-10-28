-- Apply after learning-progress.sql. Existing progress is preserved as video credit only;
-- evaluation credit is never inferred from the legacy completion counter.
alter table public.learning_progress
  add column watched_expression_indices integer[] not null default '{}',
  add column passed_expression_indices integer[] not null default '{}';

update public.learning_progress
set watched_expression_indices = array(select generate_series(0, completed_expressions - 1));

alter table public.learning_progress
  add constraint progress_watched_bounds check (
    array_position(watched_expression_indices, null) is null
    and cardinality(watched_expression_indices) <= total_expressions
    and 0 <= all(watched_expression_indices) and total_expressions > all(watched_expression_indices)),
  add constraint progress_passed_bounds check (
    array_position(passed_expression_indices, null) is null
    and cardinality(passed_expression_indices) <= total_expressions
    and 0 <= all(passed_expression_indices) and total_expressions > all(passed_expression_indices)
    and passed_expression_indices <@ watched_expression_indices);

create function public.record_combined_learning_progress(
  p_unit_id integer, p_watched_indices integer[], p_passed_indices integer[], p_complete boolean default false
) returns public.learning_progress
language plpgsql security invoker set search_path = ''
as $$
declare
  member_id uuid := auth.uid();
  total integer;
  result public.learning_progress;
  watched integer[];
  passed integer[];
begin
  if member_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  total := case p_unit_id when 1 then 12 when 2 then 10 when 3 then 5 when 4 then 6 when 5 then 5 when 6 then 5 end;
  if total is null or p_watched_indices is null or p_passed_indices is null or p_complete is null
    or array_position(p_watched_indices, null) is not null or array_position(p_passed_indices, null) is not null
    or not (0 <= all(p_watched_indices) and total > all(p_watched_indices))
    or not (0 <= all(p_passed_indices) and total > all(p_passed_indices)) then
    raise exception 'Invalid combined progress' using errcode='22023';
  end if;
  insert into public.learning_progress(user_id, unit_id, total_expressions)
  values (member_id, p_unit_id, total) on conflict (user_id, unit_id) do nothing;
  select * into result from public.learning_progress
  where user_id = member_id and unit_id = p_unit_id for update;
  watched := array(select distinct x from unnest(result.watched_expression_indices || p_watched_indices) as t(x) order by x);
  passed := array(select distinct x from unnest(result.passed_expression_indices || p_passed_indices) as t(x) order by x);
  if not passed <@ watched or (p_complete and (cardinality(watched) <> total or cardinality(passed) <> total)) then
    raise exception 'Watch and pass all expressions before completion' using errcode='22023';
  end if;
  update public.learning_progress set
    watched_expression_indices = watched,
    passed_expression_indices = passed,
    completed_expressions = cardinality(passed),
    expression_index = least(cardinality(passed), total - 1),
    completed_at = case when cardinality(watched) = total and cardinality(passed) = total
      then case when cardinality(result.passed_expression_indices) = total then coalesce(result.completed_at, now()) else now() end
      else null end,
    updated_at = now()
  where user_id = member_id and unit_id = p_unit_id returning * into result;
  return result;
end;
$$;
revoke all on function public.record_combined_learning_progress(integer,integer[],integer[],boolean) from public, anon;
grant execute on function public.record_combined_learning_progress(integer,integer[],integer[],boolean) to authenticated;
