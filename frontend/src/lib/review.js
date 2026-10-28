import { lessons } from '../data/curriculum.js';
import { lessonLink } from './progress.js';

// Intermediate, uncertain, capture-error, mismatched, and demo outputs are not mistakes.
export function reviewOutcome(expression, result) {
  if (!expression?.contentId || result?.type !== 'final' || !result.model_mode || result.model_mode === 'demo'
    || result.target_id !== expression.contentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(result.attempt_id || '')) return null;
  if (result.result === 'FAIL') return 'FAIL';
  return result.result === 'PASS' && result.predicted_id === expression.contentId ? 'PASS' : null;
}
export function reviewLessonLink(unitId, index, phase = 'video') {
  return `${lessonLink(unitId)}&expression=${index}&phase=${phase}&review=1`;
}
export function initialLessonStep(lesson, params) {
  const raw = params.get('expression');
  if (raw !== null && !/^\d+$/.test(raw)) return 0;
  const index = raw === null ? 0 : Number(raw);
  if (!Number.isSafeInteger(index) || index >= lesson.expressions.length) return 0;
  return index + (params.get('phase') === 'evaluation' ? lesson.expressions.length : 0);
}
export function createReviewService(client) {
  function api() { if (!client) throw new Error('오답노트 서비스에 연결할 수 없습니다.'); return client; }
  return {
    async getAll() {
      const { data, error } = await api().from('review_notes').select('*').order('updated_at', { ascending: false });
      if (error) throw new Error('오답노트를 불러오지 못했습니다. 다시 시도해주세요.');
      return data.filter(note => lessons[note.unit_id]?.expressions[note.expression_index]);
    },
    async record(unitId, index, result) {
      const expression = lessons[unitId]?.expressions[index];
      const outcome = reviewOutcome(expression, result);
      if (!outcome) return null;
      const { data, error } = await api().rpc('record_review_result', {
        p_unit_id: unitId, p_expression_index: index, p_target_id: expression.contentId,
        p_attempt_id: result.attempt_id, p_result: outcome, p_feedback: String(result.feedback || '').slice(0, 500),
      });
      if (error) throw new Error('오답노트를 저장하지 못했습니다. 다시 저장해주세요.');
      return data;
    },
  };
}
