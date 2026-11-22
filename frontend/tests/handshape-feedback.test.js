import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handshapeFeatures, predictHandshape, handshapeIssue } from '../src/lib/handshape-feedback.js';
const hand=Array.from({length:21},(_,i)=>({x:.3+i*.01,y:.3+Math.sin(i)*.03}));
test('수형 특징은 좌우·이동·크기에 불변이고 불완전 입력은 거부한다',()=>{
 const f=handshapeFeatures(hand,640,480);
 assert.equal(f.length,15);
 const flipped=handshapeFeatures(hand.map(p=>({x:1-p.x,y:p.y})),640,480);
 assert.ok(f.every((v,i)=>Math.abs(v-flipped[i])<1e-7));
 assert.equal(handshapeFeatures([],640,480),null);
 assert.equal(handshapeFeatures(Array(21).fill({x:0,y:0}),640,480),null);
});
test('미학습 기본 설정은 교정 결과를 내보내지 않는다',()=>{
 assert.equal(predictHandshape(Array(15).fill(0)),null);
 assert.equal(handshapeIssue({left_hand:hand,right_hand:hand,image_width:640,image_height:480},true),null);
});
test('추론 코드만 합성 가중치로 확인하고 검토·적용 범위를 강제한다',()=>{
 const config={enabled:true,reviewed:true,schema:'handshape-angles2d-v1',scope:'driving-fist',classes:['normal','under_curled'],threshold:.95,layers:[{weight:[Array(15).fill(0)],bias:[1],activation:'relu'},{weight:[[1]],bias:[0],activation:'relu'},{weight:[[0],[0]],bias:[0,10],activation:'linear'}]};
 const frame={left_hand:hand,right_hand:hand,image_width:640,image_height:480};
 assert.equal(handshapeIssue(frame,false,config),null);
 assert.equal(handshapeIssue(frame,true,{...config,reviewed:false}),null);
 assert.equal(handshapeIssue(frame,true,config).id,'under-curled');
 assert.equal(predictHandshape(Array(14).fill(0),config),null);
});
