import { lessons } from '../data/curriculum.js';

function validIndices(indices, total) {
  return [...new Set((Array.isArray(indices) ? indices : []).filter((i) => Number.isInteger(i) && i >= 0 && i < total))];
}

export function progressDetails(record) {
  const total = Number(record?.total_expressions) || 0;
  if (total <= 0) return { watched: [], passed: [], watchedCount: 0, passedCount: 0, percent: 0 };
  const legacyCount = Math.max(0, Math.min(total, Number(record.completed_expressions) || 0));
  const watched = validIndices(record.watched_expression_indices ?? Array.from({ length: legacyCount }, (_, i) => i), total);
  const passed = validIndices(record.passed_expression_indices, total).filter((i) => watched.includes(i));
  const done = watched.length + passed.length;
  const percent = done === total * 2 ? 100 : Math.min(99, Math.round(done / (total * 2) * 100));
  return { watched, passed, watchedCount: watched.length, passedCount: passed.length, percent };
}

export function progressPercent(record) { return progressDetails(record).percent; }
export function isUnitComplete(record) { return progressPercent(record) === 100; }

function normalizeProgress(record) {
  if (!record) return null;
  const detail = progressDetails(record);
  return { ...record, watched_expression_indices: detail.watched, passed_expression_indices: detail.passed,
    completed_expressions: detail.passedCount, completed_at: isUnitComplete(record) ? record.completed_at : null };
}

export function lessonLink(unitId) {
  return `/lesson/${unitId}?level=${lessons[unitId].levelId}`;
}

export function createProgressService(client) {
  function api() {
    if (!client) throw new Error('학습 기록 서비스에 연결할 수 없습니다.');
    return client;
  }
  return {
    async getAll() {
      const { data, error } = await api().from('learning_progress').select('*').order('updated_at', { ascending: false });
      if (error) throw new Error('학습 기록을 불러오지 못했습니다. 다시 시도해주세요.');
      return data.map(normalizeProgress);
    },
    async getUnit(unitId) {
      const { data, error } = await api().from('learning_progress').select('*').eq('unit_id', unitId).maybeSingle();
      if (error) throw new Error('학습 기록을 불러오지 못했습니다. 다시 시도해주세요.');
      return normalizeProgress(data);
    },
    async saveCombined(unitId, watchedIndices, passedIndices, complete = false) {
      const { data, error } = await api().rpc('record_combined_learning_progress', {
        p_unit_id: unitId, p_watched_indices: watchedIndices, p_passed_indices: passedIndices, p_complete: complete,
      });
      if (error) throw new Error('시청·평가 기록을 저장하지 못했습니다. 다시 저장을 눌러주세요.');
      return normalizeProgress(data);
    },
    async save(unitId, expressionIndex, complete = false) {
      const { data, error } = await api().rpc('record_learning_progress', {
        p_unit_id: unitId, p_expression_index: expressionIndex, p_complete: complete,
      });
      if (error) throw new Error('학습 기록을 저장하지 못했습니다. 인터넷 연결을 확인하고 다시 눌러주세요.');
      return data;
    },
  };
}
