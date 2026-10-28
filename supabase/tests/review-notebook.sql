-- Synthetic accounts and outcomes only; the entire test is rolled back.
begin;
select set_config('test.review_user', gen_random_uuid()::text, true);
select set_config('test.other_user', gen_random_uuid()::text, true);
insert into auth.users(id) values(current_setting('test.review_user')::uuid),(current_setting('test.other_user')::uuid);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.review_user'))::text,true);
set local role authenticated;
do $$
declare
  note public.review_notes;
  first_attempt uuid := gen_random_uuid();
  changed integer;
begin
  note := public.record_review_result(1,0,'FS0801',first_attempt,'FAIL','다시 연습해보세요.');
  assert note.mistake_count=1 and note.resolved_at is null, 'FAIL must create an active note';
  note := public.record_review_result(1,0,'FS0801',first_attempt,'FAIL','duplicate');
  assert note.mistake_count=1, 'Repeated attempt must not count twice';
  note := public.record_review_result(1,0,'FS0801',gen_random_uuid(),'FAIL','두 번째 오답');
  assert note.mistake_count=2 and note.feedback='두 번째 오답', 'Failures must aggregate per expression';
  note := public.record_review_result(1,0,'FS0801',gen_random_uuid(),'PASS','잘했어요.');
  assert note.mistake_count=2 and note.resolved_at is not null, 'PASS must resolve and preserve mistakes';
  note := public.record_review_result(1,1,'FS0802',gen_random_uuid(),'PASS','잘했어요.');
  assert note.user_id is null, 'First PASS must not create a mistake';
  note := public.record_review_result(1,0,'FS0801',gen_random_uuid(),'FAIL','다시 틀린 표현');
  assert note.mistake_count=3 and note.resolved_at is null, 'Later FAIL must reopen the note';
  begin
    perform public.record_review_result(1,12,'FS0801',gen_random_uuid(),'FAIL','');
    raise exception 'Invalid index accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.record_review_result(1,0,'FS0801',gen_random_uuid(),'RETRY','');
    raise exception 'Uncertain result accepted';
  exception when invalid_parameter_value then null; end;
  assert not has_table_privilege('anon','public.review_notes','SELECT'), 'Anonymous reads forbidden';
  assert not has_function_privilege('anon','public.record_review_result(integer,integer,text,uuid,text,text)','EXECUTE'), 'Anonymous RPC forbidden';
  assert not has_table_privilege('authenticated','public.review_notes','DELETE'), 'No delete access';
  assert not has_table_privilege('authenticated','public.review_attempts','UPDATE'), 'Attempts immutable';
  begin
    update public.review_notes set user_id=current_setting('test.other_user')::uuid;
    raise exception 'Ownership transfer accepted';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claims',json_build_object('sub',current_setting('test.other_user'))::text,true);
  assert (select count(*)=0 from public.review_notes), 'Other account must not read notes';
  assert (select count(*)=0 from public.review_attempts), 'Other account must not read attempts';
  update public.review_notes set feedback='intrusion' where user_id=current_setting('test.review_user')::uuid;
  get diagnostics changed=row_count;
  assert changed=0, 'Other account must not update notes';
  begin
    insert into public.review_notes(user_id,unit_id,expression_index,target_id) values(current_setting('test.review_user')::uuid,2,0,'FS0822');
    raise exception 'Other-account insert accepted';
  exception when insufficient_privilege then null; end;
  note := public.record_review_result(1,0,'FS0801',gen_random_uuid(),'FAIL','개인 기록');
  assert note.mistake_count=1, 'Account notes must remain independent';
end;
$$;
rollback;
