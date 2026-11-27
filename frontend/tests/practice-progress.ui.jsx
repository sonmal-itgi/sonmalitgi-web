import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { SignEvaluation } from '../src/pages/practice/Practice.jsx';
afterEach(cleanup);
it.each([0, 1, 2, 3])('shows server-confirmed consecutive progress %i/3', count => {
  render(<SignEvaluation evaluationKind="sentence" targetId="SEN0009" word="운전/천천히" initialResult={{ type: 'prediction', result: count === 3 ? 'PASS' : 'RETRY', stable_count: count, stable_required: 3, stable_target: '운전', confidence: .95 }} />);
  expect(screen.getByText(`${count}/3`)).toBeTruthy();
  const progress = screen.getByRole('progressbar', { name: '목표 수어 연속 인식' });
  expect(progress.value).toBe(count);
  expect(progress.max).toBe(3);
});
it('supports older results without progress metadata', () => {
  render(<SignEvaluation evaluationKind="sentence" targetId="SEN0009" initialResult={{ result: 'RETRY', confidence: .8 }} />);
  expect(screen.queryByRole('progressbar')).toBeNull();
});
it('shows cumulative middle progress and hides correction and prediction feedback', () => {
  render(<SignEvaluation evaluationKind="word" targetId="WORD1290" initialResult={{ result: 'RETRY', success_count: 2, success_required: 3, count_mode: 'cumulative', feedback: '손을 더 펴세요', predicted_id: 'WORD1191', confidence: .99 }} />);
  expect(screen.getByText('2/3')).toBeTruthy();
  expect(screen.getByRole('progressbar', {name:'목표 수어 누적 인식'}).value).toBe(2);
  expect(screen.queryByText('손을 더 펴세요')).toBeNull();
  expect(screen.queryByText(/모델 점수:/)).toBeNull();
});
it('asks middle learners to lower hands after a counted performance', () => {
  render(<SignEvaluation evaluationKind="word" targetId="WORD1191" initialResult={{ result:'RETRY', success_count:1, success_required:3, waiting_for_reset:true }} />);
  expect(screen.getByText('1/3')).toBeTruthy();
  expect(screen.getByText('양손을 잠시 내려 주세요. 준비 상태가 안 바뀌면 ‘다음 동작 시작’을 눌러 주세요.')).toBeTruthy();
});
it.each(['WORD1290','WORD1201','WORD1589','WORD1191','WORD1185','WORD1342','WORD1343','WORD1345','WORD1149','WORD1295','WORD1274'])('shows the same next-performance button for intermediate %s', targetId => {
  render(<SignEvaluation evaluationKind="word" targetId={targetId} initialResult={{result:'RETRY',success_count:1,success_required:3,waiting_for_reset:true}} />);
  const button=screen.getByRole('button',{name:'다음 동작 시작'});
  expect(button).toBeTruthy();
  // 평가를 시작하지 않았거나 이전 결과를 조회 중이면 활성화하지 않는다.
  expect(button.disabled).toBe(true);
  expect(screen.getByText('1/3')).toBeTruthy();
});
it.each(['PASS','FAIL'])('shows a final middle result and export for %s', result => {
 render(<SignEvaluation evaluationKind="word" targetId="WORD1191" word="좋다" initialResult={{type:'final',result,success_count:result==='PASS'?2:1,success_required:2,evaluation_seconds:result==='PASS'?8:20,termination_reason:result==='PASS'?'passed':'time_limit',finished_at:'2026-11-27T13:00:00Z'}} />);
 expect(screen.getByRole('heading',{name:`평가 결과 · ${result==='PASS'?'통과':'실패'}`})).toBeTruthy();
 expect(screen.getByRole('button',{name:'평가 결과 CSV 저장'})).toBeTruthy();
 expect(screen.getByText(result==='PASS'?'종료 사유 · 2회 인정 완료':'종료 사유 · 제한 시간 내 2회 미달')).toBeTruthy();
});
