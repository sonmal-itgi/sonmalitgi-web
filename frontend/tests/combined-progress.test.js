import test from 'node:test';
import assert from 'node:assert/strict';
import { progressPercent, progressDetails, createProgressService } from '../src/lib/progress.js';
const indices = Array.from({ length: 12 }, (_, i) => i);
const record = (watched, passed) => ({ total_expressions: 12, watched_expression_indices: watched, passed_expression_indices: passed });

test('12 videos are 50%, 6 evaluations are 75%, all evaluations are 100%', () => {
  assert.equal(progressPercent(record([], [])), 0);
  assert.equal(progressPercent(record(indices, [])), 50);
  assert.equal(progressPercent(record(indices, indices.slice(0, 6))), 75);
  assert.equal(progressPercent(record(indices, indices)), 100);
});

test('duplicate/invalid indices and passes without a watched video do not inflate progress', () => {
  assert.deepEqual(progressDetails(record([0, 0, -1, 12], [0, 0, 1, 12])), {
    watched: [0], passed: [0], watchedCount: 1, passedCount: 1, percent: 8,
  });
  assert.equal(progressPercent({ total_expressions: 0 }), 0);
  assert.equal(progressPercent({ total_expressions: 12, completed_expressions: 12, completed_at: 'legacy' }), 50);
});

test('service uses combined RPC and keeps duplicate detection on the server', async () => {
  const service = createProgressService({ async rpc(name, args) {
    assert.equal(name, 'record_combined_learning_progress');
    assert.deepEqual(args, { p_unit_id: 1, p_watched_indices: [0], p_passed_indices: [], p_complete: false });
    return { data: { ...record([0], []), completed_expressions: 12, completed_at: 'old' } };
  } });
  const saved = await service.saveCombined(1, [0], []);
  assert.equal(saved.completed_at, null);
  assert.equal(saved.completed_expressions, 0);
  assert.equal(progressPercent(saved), 4);
});
