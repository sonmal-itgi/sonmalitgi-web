import { test } from 'node:test';
import assert from 'node:assert/strict';
import { landmarkFrame } from '../src/lib/mediapipe.js';

const hand = x => Array.from({ length: 21 }, () => ({ x, y: .4, z: -.1 }));
test('raw camera labels map to anatomical hands independently of detection order', () => {
  const result = landmarkFrame({ landmarks: [hand(.2), hand(.8)],
    handedness: [[{ categoryName: 'Left', score: .9 }], [{ categoryName: 'Right', score: .95 }]] }, 125);
  assert.equal(result.schema, 'mediapipe-hands-v1');
  assert.equal(result.left_hand[0].x, .2);
  assert.equal(result.right_hand[0].x, .8);
  assert.equal('pose' in result, false);
  assert.equal('face' in result, false);
});
test('missing hands clear previous detections and duplicate labels keep the stronger result', () => {
  assert.deepEqual(landmarkFrame({}, 1).left_hand, []);
  const result = landmarkFrame({ landmarks: [hand(.2), hand(.8)],
    handedness: [[{ categoryName: 'Right', score: .9 }], [{ categoryName: 'Right', score: .7 }]] }, 2);
  assert.equal(result.right_hand[0].x, .2);
  assert.deepEqual(result.left_hand, []);
});
test('intermediate body schema assigns both hands by pose wrists even with duplicate labels', () => {
  const pose=Array.from({length:33},()=>({x:.5,y:.3,z:0,visibility:1}));
  pose[15]={x:.8,y:.4,z:0,visibility:1};pose[16]={x:.2,y:.4,z:0,visibility:1};
  const result=landmarkFrame({landmarks:[hand(.2),hand(.8)],handedness:[[{categoryName:'Left',score:.9}],[{categoryName:'Left',score:.8}]],poseLandmarks:[pose],imageWidth:640,imageHeight:480},1);
  assert.equal(result.schema,'mediapipe-body-hands-v1');
  assert.equal(result.pose.length,33);
  assert.equal(result.left_hand[0].x,.8);
  assert.equal(result.right_hand[0].x,.2);
});
