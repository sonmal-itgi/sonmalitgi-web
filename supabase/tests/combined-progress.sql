-- Runs against the real schema using synthetic users, then rolls back everything.
begin;
select set_config('test.progress_user', gen_random_uuid()::text, true);
insert into auth.users(id) values (current_setting('test.progress_user')::uuid);
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.progress_user'))::text, true);
set local role authenticated;
do $$
declare
  record public.learning_progress;
  all_indices integer[] := array(select generate_series(0, 11));
begin
  record := public.record_combined_learning_progress(1, all_indices, '{}');
  assert cardinality(record.watched_expression_indices) = 12 and cardinality(record.passed_expression_indices) = 0, 'Video-only must be 50%';
  record := public.record_combined_learning_progress(1, array[0,0], '{}');
  assert cardinality(record.watched_expression_indices) = 12, 'Repeated or stale snapshots must not change credit';
  record := public.record_combined_learning_progress(1, '{}', array[0,1,2,3,4,5]);
  assert (cardinality(record.watched_expression_indices) + cardinality(record.passed_expression_indices)) * 100 / 24 = 75, 'Half evaluations must yield 75%';
  begin
    perform public.record_combined_learning_progress(1, '{}', '{}', true);
    raise exception 'Incomplete unit must be rejected';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.record_combined_learning_progress(1, array[12], '{}');
    raise exception 'Out-of-range index must be rejected';
  exception when invalid_parameter_value then null; end;
  record := public.record_combined_learning_progress(1, '{}', all_indices, true);
  assert record.completed_expressions = 12 and record.completed_at is not null, 'All videos and passes must complete the unit';
  record := public.record_combined_learning_progress(1, '{}', array[0]);
  assert cardinality(record.passed_expression_indices) = 12, 'Retry must retain earned passes';
  begin
    perform public.record_combined_learning_progress(3, '{}', array[0]);
    raise exception 'Cannot pass an unwatched expression';
  exception when invalid_parameter_value then null; end;
  assert not has_function_privilege('anon', 'public.record_combined_learning_progress(integer,integer[],integer[],boolean)', 'execute'), 'Anonymous execution must be forbidden';
  perform set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid())::text, true);
  assert not exists(select 1 from public.learning_progress where user_id=current_setting('test.progress_user')::uuid), 'RLS must hide other users';
  update public.learning_progress set passed_expression_indices='{}' where user_id=current_setting('test.progress_user')::uuid;
  assert not found, 'RLS must reject cross-user updates';
end;
$$;
reset role;
rollback;
