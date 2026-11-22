import model from '../data/handshape-model.json' with { type: 'json' };
const triples = [1,5,9,13,17].map(a=>[a,a+1,a+2]).concat([1,5,9,13,17].map(a=>[a+1,a+2,a+3]),[1,5,9,13,17].map(a=>[0,a,a+1]));
export function handshapeFeatures(points, width, height) {
  if (points?.length !== 21 || !(width > 0 && height > 0) || !points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))) return null;
  const xy=points.map(p=>[p.x*width,p.y*height]);
  const result=[];
  for (const [a,b,c] of triples) {
    const u=[xy[a][0]-xy[b][0],xy[a][1]-xy[b][1]], v=[xy[c][0]-xy[b][0],xy[c][1]-xy[b][1]];
    const norm=Math.hypot(...u)*Math.hypot(...v);
    if (norm<1e-8) return null;
    result.push(Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/norm)))/Math.PI);
  }
  return result;
}
export function predictHandshape(features, config=model) {
  if (!config.enabled || !config.reviewed || config.schema!=='handshape-angles2d-v1' || !features || config.layers?.length!==3) return null;
  let x=features;
  for (const layer of config.layers) {
    if (!layer.weight?.length || layer.bias?.length!==layer.weight.length || layer.weight.some(row=>row.length!==x.length)) return null;
    x=layer.weight.map((row,i)=>row.reduce((s,w,j)=>s+w*x[j],layer.bias[i]));
    if (layer.activation==='relu') x=x.map(v=>Math.max(0,v));
    else if(layer.activation!=='linear') return null;
    if (!x.every(Number.isFinite)) return null;
  }
  if(x.length!==config.classes?.length)return null;
  const exps=x.map(v=>Math.exp(v-Math.max(...x))),sum=exps.reduce((a,b)=>a+b,0);
  const scores=exps.map(v=>v/sum), index=scores.indexOf(Math.max(...scores));
  return {label:config.classes[index],score:scores[index]};
}
export function handshapeIssue(frame, driving, config=model) {
  if (!driving || config.scope!=='driving-fist' || !config.enabled || !config.reviewed) return null;
  for(const key of ['left_hand','right_hand']) {
    const prediction=predictHandshape(handshapeFeatures(frame[key],frame.image_width,frame.image_height),config);
    if(prediction?.label==='under_curled' && prediction.score>=Math.max(.95,config.threshold||.95))
      return {id:'under-curled',message:'운전의 주먹 모양을 확인하고, 손가락을 조금 더 굽혀 보세요.'};
  }
  return null;
}
