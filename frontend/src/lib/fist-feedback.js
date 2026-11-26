// 운전의 두 주먹 기준을 비교하는 기하 규칙. 학습 모델이나 수어 전체 평가가 아니다.
// 정상은 굽힌 수형, 교정은 여러 손가락이 명확히 펴진 경우에만 보수적으로 안내한다.
const FINGERS = [[5,6,7,8], [9,10,11,12], [13,14,15,16], [17,18,19,20]];
export const FIST_REFERENCE = Object.freeze({
  bentPipMax: 110, extensionMargin: 35, extendedDipMin: 140,
  tipToPipRatioMin: 1.12, minimumExtendedFingers: 2,
});
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const norm=a=>Math.hypot(...a);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
function angle(a,b,c) {
  const u=sub(a,b),v=sub(c,b),denominator=norm(u)*norm(v);
  return denominator>1e-7 ? Math.acos(Math.max(-1,Math.min(1,dot(u,v)/denominator)))*180/Math.PI : null;
}
export function compareFist(points,width,height) {
  if(points?.length!==21 || !(width>0&&height>0) || !points.every(p=>[p.x,p.y,p.z].every(Number.isFinite)))return null;
  if(points.some(p=>p.x<.03||p.x>.97||p.y<.03||p.y>.97))return null;
  // MediaPipe z와 x는 같은 축척으로 변환하고 y는 영상 종횡비를 반영한다.
  const p=points.map(q=>[q.x*width,q.y*height,q.z*width]);
  const palm=norm(sub(p[9],p[0]));
  if(palm<Math.max(width,height)*.035)return null;
  const a=sub(p[5],p[0]),b=sub(p[17],p[0]);
  const normal=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  // 거의 옆면으로 보이거나 손바닥 기하가 붕괴하면 교정을 보류한다.
  if(norm(normal)<palm*palm*.08 || Math.abs(normal[2])/norm(normal)<.35)return null;
  let extended=0;
  for(const [mcp,pip,dip,tip] of FINGERS) {
    const lengths=[[mcp,pip],[pip,dip],[dip,tip]].map(([i,j])=>norm(sub(p[i],p[j]))/palm);
    if(lengths.some(v=>v<.06||v>1.1))return null;
    const pipAngle=angle(p[mcp],p[pip],p[dip]),dipAngle=angle(p[pip],p[dip],p[tip]);
    if(pipAngle===null||dipAngle===null)return null;
    const reach=norm(sub(p[tip],p[0]))/norm(sub(p[pip],p[0]));
    if(pipAngle>FIST_REFERENCE.bentPipMax+FIST_REFERENCE.extensionMargin && dipAngle>FIST_REFERENCE.extendedDipMin && reach>FIST_REFERENCE.tipToPipRatioMin)extended++;
  }
  return {extendedFingers:extended,underCurled:extended>=FIST_REFERENCE.minimumExtendedFingers};
}
export function fistIssue(frame, driving) {
  if(!driving)return null;
  const left=compareFist(frame.left_hand,frame.image_width,frame.image_height);
  const right=compareFist(frame.right_hand,frame.image_width,frame.image_height);
  // 양손 기준 동작이므로 두 손 모두 비교 가능할 때만 수형을 안내한다.
  if(!left||!right)return null;
  if(left.underCurled||right.underCurled)return {
    id:'driving-fist-open',
    message:'운전은 두 손을 주먹 모양으로 표현해요. 펴진 손가락을 조금 더 굽혀 보세요.',
  };
  return null;
}
