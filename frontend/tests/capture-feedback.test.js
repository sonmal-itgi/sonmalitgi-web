import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captureIssue, createCaptureFeedback } from '../src/lib/capture-feedback.js';
const hand = (x=.5) => Array.from({length:21}, () => ({x,y:.5}));
const frame = {left_hand:hand(),right_hand:[]};
test('양손 안내는 명시한 동작에만 적용하고 좌우를 단정하지 않는다', () => {
  assert.equal(captureIssue(frame), null);
  assert.equal(captureIssue(frame,true).id,'missing-hand');
  assert.equal(captureIssue({left_hand:hand(),right_hand:hand()},true),null);
  assert.equal(captureIssue({left_hand:[],right_hand:[]}).id,'no-hands');
  assert.equal(captureIssue({left_hand:hand(.99),right_hand:[]}).id,'edge');
});
test('지속된 문제만 안내하고 회복·전환·프레임 공백 시 초기화한다', () => {
  const update=createCaptureFeedback();
  assert.equal(update(frame,true,0),null);
  assert.equal(update(frame,true,400),null);
  assert.equal(update(frame,true,800).id,'missing-hand');
  assert.equal(update(frame,false,900),null);
  assert.equal(update(frame,true,1000),null);
  assert.equal(update(frame,true,2000),null);
  assert.equal(update(frame,true,2400),null);
  assert.equal(update(frame,true,2800).id,'missing-hand');
});
