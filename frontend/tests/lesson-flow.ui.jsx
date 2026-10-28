import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../src/auth/context.js';
import Lesson from '../src/pages/lesson/Lesson.jsx';
import ExpressionStep from '../src/pages/lesson/ExpressionStep.jsx';

const { save, getUnit, sessions } = vi.hoisted(() => ({ save: vi.fn(), getUnit: vi.fn(), sessions: [] }));
vi.mock('../src/lib/supabase.js', () => ({ progressService: { save, getUnit } }));
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
  SignEvaluation: ({ targetId, onAttemptStart, onFinal }) => {
    sessions.push(targetId);
    const finish = (result, model_mode = 'model', type = 'final') => onFinal({
      type, result, model_mode, target_id: targetId, predicted_id: targetId,
    });
    return <div data-testid="evaluation" data-target={targetId || ''}>
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
  getUnit.mockResolvedValue(null); save.mockResolvedValue({});
});
afterEach(cleanup);

function renderLesson() {
  return render(<MemoryRouter initialEntries={['/lesson/1']}>
    <AuthContext.Provider value={{ session: { user: { id: 'test-user' } } }}>
      <Routes><Route path="/lesson/:id" element={<Lesson />} /><Route path="/learn" element={<p>유닛 목록</p>} /></Routes>
    </AuthContext.Provider>
  </MemoryRouter>);
}

describe('표현별 영상과 평가', () => {
  it('유닛 1의 12개 영상마다 해당 표현을 따로 평가하고 마지막에만 유닛을 완료한다', async () => {
    const { container } = renderLesson();
    await screen.findByRole('heading', { name: '숫자 기초' });
    for (let index = 0; index < 12; index++) {
      expect(screen.queryByTestId('evaluation')).toBeNull();
      fireEvent.ended(container.querySelector('video'));
      const target = index < 10 ? `FS08${String(index + 1).padStart(2, '0')}` : `TEST_ONLY_${index}`;
      expect(screen.getByTestId('evaluation').getAttribute('data-target')).toBe(target);
      const next = screen.getByRole('button', { name: index === 11 ? '마지막 평가 완료 · 유닛 완료' : '평가 완료 · 다음 표현' });
      expect(next.disabled).toBe(true);
      fireEvent.click(screen.getByRole('button', { name: '모델 통과' }));
      expect(next.disabled).toBe(false);
      fireEvent.click(next);
      await waitFor(() => expect(save).toHaveBeenLastCalledWith(1, index === 11 ? 11 : index + 1, index === 11));
      if (index < 11) await waitFor(() => expect(container.querySelector('video')).not.toBeNull());
    }
    expect(await screen.findByText('유닛 목록')).toBeTruthy();
    expect(new Set(sessions).size).toBe(12);
  });

  it('중간 판정·데모·재시도·실패·촬영 오류로 다음 표현을 완료하지 않는다', async () => {
    const { container } = renderLesson();
    await screen.findByRole('heading', { name: '숫자 기초' });
    fireEvent.ended(container.querySelector('video'));
    const next = screen.getByRole('button', { name: '평가 완료 · 다음 표현' });
    for (const name of ['중간 통과', '데모 통과', '재시도 결과', '실패 결과', '촬영 오류']) {
      fireEvent.click(screen.getByRole('button', { name }));
      expect(next.disabled).toBe(true);
    }
    fireEvent.click(screen.getByRole('button', { name: '모델 통과' }));
    expect(next.disabled).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: '새 시도' }));
    expect(next.disabled).toBe(true);
    expect(save).toHaveBeenCalledTimes(1); // Resume position only, no completed expression.
  });

  it('저장 실패 시 같은 표현과 평가를 유지하고 저장을 재시도한다', async () => {
    const { container } = renderLesson();
    await screen.findByRole('heading', { name: '숫자 기초' });
    fireEvent.ended(container.querySelector('video'));
    fireEvent.click(screen.getByRole('button', { name: '모델 통과' }));
    save.mockRejectedValueOnce(new Error('저장 실패'));
    fireEvent.click(screen.getByRole('button', { name: '평가 완료 · 다음 표현' }));
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', '저장 실패');
    expect(screen.getByTestId('evaluation').getAttribute('data-target')).toBe('FS0801');
    fireEvent.click(screen.getByRole('button', { name: '평가 완료 · 다음 표현' }));
    await waitFor(() => expect(container.querySelector('video')).not.toBeNull());
  });

  it('영상이 없는 미리보기와 ID가 없는 표현은 완료하지 않는다', () => {
    const next = vi.fn();
    render(<ExpressionStep expression={{ word: '11', contentId: null }} index={10} total={12} onNext={next} />);
    expect(screen.getByText('이 표현의 기준 영상은 준비 중입니다.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '평가 화면 미리보기' }));
    fireEvent.click(screen.getByRole('button', { name: '모델 통과' }));
    const button = screen.getByRole('button', { name: '평가 완료 · 다음 표현' });
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(next).not.toHaveBeenCalled();
  });
});
