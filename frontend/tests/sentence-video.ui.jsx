import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ExpressionStep from '../src/pages/lesson/ExpressionStep.jsx';
vi.mock('../src/pages/practice/Practice.jsx', () => ({ SignEvaluation: () => null }));
beforeEach(() => vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function show(contentId, onWatched = vi.fn()) {
  return { onWatched, ...render(<ExpressionStep levelId="advanced" expression={{ contentId, word: '문장', description: '' }}
    index={0} total={5} phase="video" watched={false} onWatched={onWatched} />) };
}
it('allows backward/forward navigation but requires every clip to finish before marking watched', () => {
  const { container, onWatched } = show('SEN0009');
  const previous = screen.getByRole('button', { name: '이전 단어 영상' });
  const next = screen.getByRole('button', { name: '다음 단어 영상' });
  expect(previous.disabled).toBe(true);
  fireEvent.click(next);
  expect(screen.getByText('천천히', { exact: true })).toBeTruthy();
  expect(next.disabled).toBe(true);
  fireEvent.ended(container.querySelector('video'));
  expect(onWatched).not.toHaveBeenCalled();
  fireEvent.click(previous);
  expect(screen.getByText('운전', { exact: true })).toBeTruthy();
  fireEvent.ended(container.querySelector('video'));
  expect(screen.getByText('천천히', { exact: true })).toBeTruthy();
  expect(onWatched).toHaveBeenCalledOnce();
});
it('supports all four Unit 6 clips and preserves playback speed when switching', () => {
  const { container } = show('SEN0038');
  fireEvent.click(screen.getByRole('button', { name: '0.75배속' }));
  for (let index = 0; index < 3; index++) fireEvent.click(screen.getByRole('button', { name: '다음 단어 영상' }));
  expect(screen.getByText('얼마', { exact: true })).toBeTruthy();
  expect(screen.getByRole('button', { name: '다음 단어 영상' }).disabled).toBe(true);
  expect(container.querySelector('video').playbackRate).toBe(.75);
  fireEvent.error(container.querySelector('video'));
  expect(screen.getByText('기준 영상을 불러오지 못했습니다.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '이전 단어 영상' }));
  expect(container.querySelector('video')).toBeTruthy();
  expect(screen.getByText('돈', { exact: true })).toBeTruthy();
});
