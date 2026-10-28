import { useEffect, useRef, useState } from 'react';
import { reviewService } from '../lib/supabase.js';
import { lessons } from '../data/curriculum.js';
import { reviewOutcome } from '../lib/review.js';

export function useReviewRecorder(unitId) {
  const [state, setState] = useState({ pending: 0, failures: 0, message: '' });
  const queue = useRef(Promise.resolve());
  const failed = useRef(new Map());
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  function record(index, result) {
    if (!reviewOutcome(lessons[unitId]?.expressions[index], result)) return;
    if (alive.current) setState(s => ({ ...s, pending: s.pending + 1 }));
    queue.current = queue.current.then(async () => {
      try {
        // Keep later outcomes behind an earlier failed save, so retry cannot reopen a passed note.
        if (failed.current.size > 0) throw new Error('Earlier review save pending');
        const note = await reviewService.record(unitId, index, result);
        failed.current.delete(result.attempt_id);
        if (alive.current) setState(s => ({ ...s, message: note?.unit_id ? result.result === 'FAIL' ? '오답노트에 저장했어요.' : '오답노트를 복습 완료로 표시했어요.' : '' }));
      } catch {
        failed.current.set(result.attempt_id, { index, result });
      } finally {
        if (alive.current) setState(s => ({ ...s, pending: s.pending - 1, failures: failed.current.size }));
      }
    });
  }
  function retry() {
    if (state.pending > 0) return;
    const jobs = [...failed.current.values()];
    failed.current.clear();
    for (const job of jobs) record(job.index, job.result);
  }
  async function flush() { await queue.current; return failed.current.size === 0; }
  return { ...state, record, retry, flush };
}
