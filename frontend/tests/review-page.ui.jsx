import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../src/auth/context.js';
import Review from '../src/pages/review/Review.jsx';
const { getAll } = vi.hoisted(()=>({getAll:vi.fn()}));
vi.mock('../src/lib/supabase.js',()=>({reviewService:{getAll}}));
beforeEach(()=>getAll.mockReset());
afterEach(cleanup);
function show(){render(<AuthContext.Provider value={{session:{user:{id:'learner'}}}}><MemoryRouter><Review/></MemoryRouter></AuthContext.Provider>);}
it('shows saved mistakes, filters completed reviews, and links to each exact expression',async()=>{
  getAll.mockResolvedValue([
    {unit_id:1,expression_index:2,mistake_count:2,feedback:'다시 연습해요.',last_failed_at:'2026-10-29',resolved_at:null},
    {unit_id:4,expression_index:1,mistake_count:1,last_failed_at:'2026-10-28',resolved_at:'2026-10-29'},
  ]);
  show();
  expect(await screen.findByRole('heading',{name:'3'})).toBeTruthy();
  expect(screen.getByRole('link',{name:'다시 평가하기'}).getAttribute('href')).toContain('expression=2&phase=evaluation&review=1');
  expect(screen.getByRole('link',{name:'기준 영상 보기'}).getAttribute('href')).toContain('expression=2&phase=video');
  fireEvent.click(screen.getByRole('button',{name:'복습 완료 1'}));
  expect(screen.getByRole('link',{name:'다시 평가하기'}).getAttribute('href')).toContain('/lesson/4?level=intermediate');
  fireEvent.click(screen.getByRole('button',{name:'전체 2'}));
  expect(screen.getAllByRole('link',{name:'다시 평가하기'})).toHaveLength(2);
});
it('empty notebook points back to learning',async()=>{
  getAll.mockResolvedValue([]);show();
  expect(await screen.findByRole('link',{name:'학습하러 가기'})).toHaveProperty('pathname','/level');
});
it('failed load can be retried',async()=>{
  getAll.mockRejectedValueOnce(new Error('조회 실패')).mockResolvedValue([]);show();
  await screen.findByRole('alert');fireEvent.click(screen.getByRole('button',{name:'다시 불러오기'}));
  expect(await screen.findByRole('link',{name:'학습하러 가기'})).toBeTruthy();
  expect(getAll).toHaveBeenCalledTimes(2);
});
