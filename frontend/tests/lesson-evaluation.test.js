import test from 'node:test';
import assert from 'node:assert/strict';
import { canAdvanceExpression, referenceVideoUrl } from '../src/lib/lessonEvaluation.js';
import { lessons } from '../src/data/curriculum.js';

test('video mappings stay empty until supplied, including missing IDs 11 and 12', () => {
  assert.equal(lessons[1].expressions.length, 12);
  for (const expression of lessons[1].expressions) assert.equal(referenceVideoUrl(expression), null);
  assert.equal(lessons[1].expressions[10].contentId, null);
  assert.equal(lessons[1].expressions[11].contentId, null);
  assert.equal(referenceVideoUrl({ contentId: 'A' }, 'https://media.example/signs/'), 'https://media.example/signs/A.mp4');
});

test('another expression result cannot unlock current expression', () => {
  const result = { type: 'final', result: 'PASS', model_mode: 'model', target_id: 'FS0802', predicted_id: 'FS0802' };
  assert.equal(canAdvanceExpression(lessons[1].expressions[0], true, result), false);
});
