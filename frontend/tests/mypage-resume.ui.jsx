import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../src/auth/context.js';
import MyPage from '../src/pages/mypage/MyPage.jsx';

const { progress } = vi.hoisted(() => ({ progress: { records: [], loading: false, error: '', reload: vi.fn() } }));
vi.mock('../src/hooks/useLearningProgress.js', () => ({ useLearningProgress: () => progress }));
vi.mock('../src/lib/supabase.js', () => ({ authService: {} }));
beforeEach(() => { progress.records = []; progress.loading = false; progress.error = ''; progress.reload.mockClear(); });
afterEach(cleanup);
function show() {
  render(<MemoryRouter><AuthContext.Provider value={{ profile: { name: '학습자', username: 'learner', created_at: '2026-01-01' } }}><MyPage /></AuthContext.Provider></MemoryRouter>);
}
const resume = () => screen.getByRole('link', { name: '학습하러 가기 →' });

it('최근 유닛이 완료되어도 과거의 미완료 유닛보다 먼저 연결한다', () => {
  // getAll returns records in descending updated_at order.
  progress.records = [
    { unit_id: 6, completed_at: '2026-10-29', total_expressions: 5, completed_expressions: 5 },
    { unit_id: 1, completed_at: null, total_expressions: 12, completed_expressions: 0 },
  ];
  show();
  expect(resume().getAttribute('href')).toBe('/lesson/6?level=advanced');
  expect(screen.getByRole('link', { name: '다시 학습하기 →' }).getAttribute('href')).toBe('/lesson/6?level=advanced');
});
it('최근 방문한 중급 유닛으로 연결하며 없는 유닛 기록은 건너뛴다', () => {
  progress.records = [{ unit_id: 999 }, { unit_id: 4, completed_expressions: 0 }];
  show();
  expect(resume().getAttribute('href')).toBe('/lesson/4?level=intermediate');
});
it('학습 기록이 없으면 단계 선택으로 연결한다', () => {
  show();
  expect(resume().getAttribute('href')).toBe('/level');
});
it('기록을 읽는 중에는 잘못된 경로로 이동하지 않는다', () => {
  progress.loading = true;
  show();
  expect(screen.queryByRole('link', { name: '학습하러 가기 →' })).toBeNull();
  expect(screen.getByText('학습 기록 확인 중…')).toBeTruthy();
});
it('조회 실패 시 기록을 다시 불러올 수 있다', () => {
  progress.error = '조회 실패';
  show();
  fireEvent.click(screen.getByRole('button', { name: '학습 기록 다시 불러오기' }));
  expect(progress.reload).toHaveBeenCalledOnce();
  expect(screen.queryByRole('link', { name: '학습하러 가기 →' })).toBeNull();
});
