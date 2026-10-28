import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../src/auth/context.js';
import Lesson from '../src/pages/lesson/Lesson.jsx';

const { save, sessions } = vi.hoisted(() => ({ save: vi.fn(), sessions: [] }));
vi.mock('../src/lib/supabase.js', () => ({ progressService: { saveCombined: save } }));
vi.mock('../src/data/curriculum.js', async (original) => {
  const data = await original();
  // Test-only media and class IDs exercise all 12 steps without filling real missing data.
  const lessons = structuredClone(data.lessons);
  lessons[1].expressions.forEach((expression, index) => {
    expression.videoUrl = `/test-only/${index}.mp4`;
    expression.contentId ||= `TEST_ONLY_${index}`;
  });
  return { ...data, lessons };
});
vi.mock('../src/pages/practice/Practice.jsx', () => ({
  SignEvaluation: ({ targetId, initialResult, onAttemptStart, onFinal }) => {
    sessions.push(targetId);
    const finish = (result, model_mode = 'model', type = 'final') => onFinal({
      type, result, model_mode, target_id: targetId, predicted_id: targetId,
    });
    return <div data-testid="evaluation" data-target={targetId || ''}>
      <span data-testid="previous-result">{initialResult?.result || '없음'}</span>
      <button onClick={() => finish('PASS')}>모델 통과</button>
      <button onClick={() => finish('PASS', 'demo')}>데모 통과</button>
      <button onClick={() => finish('PASS', 'model', 'prediction')}>중간 통과</button>
      <button onClick={() => finish('RETRY')}>재시도 결과</button>
      <button onClick={() => finish('FAIL')}>실패 결과</button>
      <button onClick={() => finish('CAPTURE_ERROR')}>촬영 오류</button>
      <button onClick={onAttemptStart}>새 시도</button>
    </div>;
  },
}));

beforeEach(() => {
  vi.clearAllMocks(); sessions.length = 0;
  save.mockResolvedValue({});
});
afterEach(cleanup);

function renderLesson(unit = 1) {
  return render(<MemoryRouter initialEntries={[`/lesson/${unit}`]}>
    <AuthContext.Provider value={{ session: { user: { id: 'test-user' } } }}>
      <Routes><Route path="/lesson/:id" element={<Lesson />} /><Route path="/learn" element={<p>유닛 목록</p>} /></Routes>
    </AuthContext.Provider>
  </MemoryRouter>);
}

async function watchVideos(container) {
  for (let index = 0; index < 12; index++) {
    expect(screen.queryByTestId('evaluation')).toBeNull();
    fireEvent.ended(container.querySelector('video'));
    fireEvent.click(screen.getByRole('button', { name: index === 11 ? '평가로 이동' : '다음 영상' }));
  }
}
async function nextEvaluation() {
  fireEvent.click(screen.getByRole('button', { name: '다음 평가' }));
  await waitFor(() => expect(screen.getByRole('button', { name: '다음 평가' }).textContent).toBe('다음 평가'));
}

describe('유닛 전체 영상 후 표현별 평가', () => {
  it('12개 영상을 모두 본 다음 12개를 각각 평가하고 마지막에만 유닛을 완료한다', async () => {
    const { container } = renderLesson();
    await screen.findByRole('heading', { name: '숫자 기초' });
    await watchVideos(container);
    for (let index = 0; index < 12; index++) {
      const target = index < 10 ? `FS08${String(index + 1).padStart(2, '0')}` : `TEST_ONLY_${index}`;
      expect(screen.getByTestId('evaluation').getAttribute('data-target')).toBe(target);
      fireEvent.click(screen.getByRole('button', { name: '모델 통과' }));
      if (index < 11) await nextEvaluation();
    }
    fireEvent.click(screen.getByRole('button', { name: '유닛 완료' }));
    expect(await screen.findByText('유닛 목록')).toBeTruthy();
    expect(save).toHaveBeenLastCalledWith(1, Array.from({ length: 12 }, (_, i) => i), Array.from({ length: 12 }, (_, i) => i), true);
    expect(new Set(sessions).size).toBe(12);
  });

  it('영상·평가·단계 경계를 이전 다음으로 이동해도 시청과 평가 결과를 유지한다', async () => {
    const { container } = renderLesson();
    await screen.findByRole('heading', { name: '숫자 기초' });
    expect(screen.getByRole('button', { name: '이전 영상' }).disabled).toBe(true);
    fireEvent.ended(container.querySelector('video'));
    fireEvent.click(screen.getByRole('button', { name: '다음 영상' }));
    fireEvent.click(screen.getByRole('button', { name: '이전 영상' }));
    expect(screen.getByText('시청 완료 · 다시 볼 수 있어요.')).toBeTruthy();
    await watchVideos(container);
    fireEvent.click(screen.getByRole('button', { name: '모델 통과' }));
    await nextEvaluation();
    expect(screen.getByTestId('previous-result').textContent).toBe('없음');
    fireEvent.click(screen.getByRole('button', { name: '이전 평가' }));
    expect(screen.getByTestId('previous-result').textContent).toBe('PASS');
    fireEvent.click(screen.getByRole('button', { name: '영상으로 돌아가기' }));
    expect(screen.getByRole('heading', { name: '12' })).toBeTruthy();
    expect(screen.queryByTestId('evaluation')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '평가로 이동' }));
    expect(screen.getByTestId('previous-result').textContent).toBe('PASS');
  });

  it('미통과 평가도 이동할 수 있지만 건너뛴 표현은 완료로 저장하지 않는다', async () => {
    const { container } = renderLesson();
    await screen.findByRole('heading', { name: '숫자 기초' });
    await watchVideos(container);
    fireEvent.click(screen.getByRole('button', { name: '실패 결과' }));
    for (let index = 0; index < 11; index++) {
      await nextEvaluation();
      fireEvent.click(screen.getByRole('button', { name: '모델 통과' }));
    }
    expect(screen.getByRole('button', { name: '유닛 완료' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: '다음 평가' }).disabled).toBe(true);
    await waitFor(() => expect(screen.queryByText('시청·평가 기록 저장 중…')).toBeNull());
    const last = save.mock.calls.at(-1);
    expect(last[2]).not.toContain(0);
    expect(last[3]).toBe(false);
  });

  it('자동 저장 실패를 표시하고 이동 후에도 전체 기록을 다시 저장할 수 있다', async () => {
    const { container } = renderLesson();
    await screen.findByRole('heading', { name: '숫자 기초' });
    await watchVideos(container);
    await waitFor(() => expect(screen.queryByText('시청·평가 기록 저장 중…')).toBeNull());
    save.mockRejectedValueOnce(new Error('저장 실패'));
    fireEvent.click(screen.getByRole('button', { name: '모델 통과' }));
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', '저장 실패다시 저장');
    await nextEvaluation();
    expect(screen.getByTestId('evaluation').getAttribute('data-target')).toBe('FS0802');
    fireEvent.click(screen.getByRole('button', { name: '다시 저장' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect(save.mock.calls.at(-1)[2]).toEqual([0]);
  });

  it('시청을 건너뛴 미리보기는 평가를 통과해도 유닛 완료로 저장하지 않는다', async () => {
    renderLesson();
    await screen.findByRole('heading', { name: '숫자 기초' });
    for (let index = 0; index < 11; index++) fireEvent.click(screen.getByRole('button', { name: '다음 영상' }));
    fireEvent.click(screen.getByRole('button', { name: '평가로 이동' }));
    for (let index = 0; index < 12; index++) {
      fireEvent.click(screen.getByRole('button', { name: '모델 통과' }));
      if (index < 11) await nextEvaluation();
    }
    expect(screen.getByRole('button', { name: '유닛 완료' }).disabled).toBe(true);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('비통과 결과는 집계하지 않고 재시도해도 이미 얻은 통과 기록은 유지한다', async () => {
    const { container } = renderLesson();
    await screen.findByRole('heading', { name: '숫자 기초' });
    await watchVideos(container);
    for (const name of ['데모 통과', '중간 통과', '재시도 결과', '촬영 오류']) {
      fireEvent.click(screen.getByRole('button', { name }));
      expect(screen.getByText(/평가 통과 0개/)).toBeTruthy();
    }
    fireEvent.click(screen.getByRole('button', { name: '모델 통과' }));
    expect(screen.getByText(/평가 통과 1개/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '새 시도' }));
    expect(screen.getByText(/평가 통과 1개/)).toBeTruthy();
  });
});

it('영상이 비어 있는 실제 유닛도 모든 영상 화면을 넘긴 뒤 평가에 진입할 수 있다', async () => {
  renderLesson(3);
  await screen.findByRole('heading', { name: '인사·기본 표현' });
  for (let index = 0; index < 5; index++) {
    expect(screen.getByText('이 표현의 기준 영상은 준비 중입니다.')).toBeTruthy();
    expect(screen.queryByTestId('evaluation')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: index === 4 ? '평가로 이동' : '다음 영상' }));
  }
  expect(screen.getByTestId('evaluation').getAttribute('data-target')).toBe('WORD1290');
  fireEvent.click(screen.getByRole('button', { name: '다음 평가' }));
  expect(screen.getByTestId('evaluation').getAttribute('data-target')).toBe('WORD1201');
  expect(save).toHaveBeenCalledTimes(1);
});

it('진행률은 화면 위치가 아닌 시청·통과 완료 수로 계산하며 반복 시청은 중복 집계하지 않는다', async () => {
  const { container } = renderLesson();
  await screen.findByRole('heading', { name: '숫자 기초' });
  const percent = () => Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'));
  expect(percent()).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: '다음 영상' }));
  expect(percent()).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: '이전 영상' }));
  fireEvent.ended(container.querySelector('video'));
  expect(percent()).toBe(4);
  fireEvent.ended(container.querySelector('video'));
  expect(percent()).toBe(4);
  await watchVideos(container);
  expect(percent()).toBe(50);
  fireEvent.click(screen.getByRole('button', { name: '모델 통과' }));
  expect(percent()).toBe(54);
  await nextEvaluation();
  fireEvent.click(screen.getByRole('button', { name: '이전 평가' }));
  expect(percent()).toBe(54);
});

it('다시 접속하면 방문 시점을 갱신하고 기존 시청·평가 기록을 복원한다', async () => {
  save.mockResolvedValueOnce({ total_expressions: 12, watched_expression_indices: Array.from({ length: 12 }, (_, i) => i), passed_expression_indices: [0, 1, 2, 3, 4, 5] });
  renderLesson();
  await screen.findByRole('heading', { name: '숫자 기초' });
  expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('75');
  expect(screen.getByText('시청 완료 · 다시 볼 수 있어요.')).toBeTruthy();
  expect(save).toHaveBeenCalledExactlyOnceWith(1, [], []);
});
