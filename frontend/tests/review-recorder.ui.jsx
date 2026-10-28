import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useReviewRecorder } from '../src/hooks/useReviewRecorder.js';
const { record }=vi.hoisted(()=>({record:vi.fn()}));
vi.mock('../src/lib/supabase.js',()=>({reviewService:{record}}));
afterEach(()=>{cleanup();record.mockReset();});
const failed={type:'final',result:'FAIL',model_mode:'model',target_id:'FS0801',attempt_id:'10000000-0000-4000-8000-000000000001'};
const passed={...failed,result:'PASS',predicted_id:'FS0801',attempt_id:'10000000-0000-4000-8000-000000000002'};
export function Harness(){const review=useReviewRecorder(1);return <><button onClick={()=>{review.record(0,failed);review.record(0,passed);}}>평가</button><button onClick={review.retry}>재저장</button><p>실패 {review.failures} · 저장 중 {review.pending}</p><p>{review.message}</p></>;}
it('retries failed saves before later PASS outcomes without reopening resolved notes',async()=>{
  record.mockRejectedValueOnce(new Error('offline')).mockResolvedValue({unit_id:1});
  render(<Harness/>);fireEvent.click(screen.getByRole('button',{name:'평가'}));
  await screen.findByText('실패 2 · 저장 중 0');
  expect(record).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button',{name:'재저장'}));
  await screen.findByText('실패 0 · 저장 중 0');
  expect(record.mock.calls.map(call=>call[2].result)).toEqual(['FAIL','FAIL','PASS']);
  await waitFor(()=>expect(screen.getByText('오답노트를 복습 완료로 표시했어요.')).toBeTruthy());
});
