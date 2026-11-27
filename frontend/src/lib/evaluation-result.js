export const terminationLabels = {
  passed: '2회 인정 완료', time_limit: '제한 시간 내 2회 미달', user_end: '사용자가 평가 종료',
};
export function resultCsv(result, expression) {
  const cells = ['표현','표현 ID','결과','인정 횟수','필요 횟수','소요 시간(초)','종료 사유','종료 시각(UTC)','시도 ID','모델 버전','평가 기준'];
  const row = [expression,result.target_id,result.result,result.success_count,result.success_required,result.evaluation_seconds,result.termination_reason,result.finished_at,result.attempt_id,result.server_revision,result.evaluation_policy];
  const escape = value => {
    let s=String(value ?? '');
    if (/^[=+@-]/.test(s)) s="'"+s;
    return '"'+s.replaceAll('"','""')+'"';
  };
  return '\uFEFF'+[cells,row].map(r=>r.map(escape).join(',')).join('\r\n');
}
