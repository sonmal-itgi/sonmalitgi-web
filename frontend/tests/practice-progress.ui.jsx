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
