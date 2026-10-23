import { lessons } from '../data/curriculum.js';

export function progressPercent(record) {
  return record ? Math.min(100, Math.round(record.completed_expressions / record.total_expressions * 100)) : 0;
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
      return data;
    },
    async getUnit(unitId) {
      const { data, error } = await api().from('learning_progress').select('*').eq('unit_id', unitId).maybeSingle();
      if (error) throw new Error('학습 기록을 불러오지 못했습니다. 다시 시도해주세요.');
      return data;
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
