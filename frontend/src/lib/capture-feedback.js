import { fistIssue } from './fist-feedback.js';
// 촬영 상태 안내를 우선하고 운전 구간에서는 제한적인 주먹 수형 규칙을 적용한다.
// 검증된 양손 기준은 직접 촬영한 두 주먹 ‘운전’ 구간에만 적용한다.
export function captureIssue(frame, needsBothHands = false) {
  const valid = points => Array.isArray(points) && points.length === 21 &&
    points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y));
  const left = valid(frame.left_hand), right = valid(frame.right_hand);
  if (!left && !right) return { id: 'no-hands', message: '손이 잘 보이지 않아요. 손을 카메라에 보여 주세요.' };
  const points = [...(left ? frame.left_hand : []), ...(right ? frame.right_hand : [])];
  if (points.some(p => p.x < .03 || p.x > .97 || p.y < .03 || p.y > .97)) {
    return { id: 'edge', message: '손이 화면 가장자리에 있어요. 손 전체가 화면 안에 보이도록 옮겨 주세요.' };
  }
  if (needsBothHands && (!left || !right)) return {
    id: 'missing-hand',
    message: '운전은 양손을 사용하는 동작이에요. 두 손이 모두 카메라에 보이도록 해 주세요.',
  };
  return null;
}

export function createCaptureFeedback() {
  let candidate = null, since = 0, previousTime = null, visible = null;
  return (frame, needsBothHands, now) => {
    const issue = captureIssue(frame, needsBothHands) || fistIssue(frame, needsBothHands);
    const key = issue?.id || null;
    // 프레임 공백을 관측한 시간으로 계산하지 않는다.
    if (previousTime === null || now - previousTime > 500 || now < previousTime || key !== candidate) {
      candidate = key;
      since = now;
      visible = null;
    }
    previousTime = now;
    if (key && now - since >= 800) visible = issue;
    return visible;
  };
}
