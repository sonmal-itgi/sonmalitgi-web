import test from 'node:test';
import assert from 'node:assert/strict';
import { createReviewService, reviewOutcome, reviewLessonLink, initialLessonStep } from '../src/lib/review.js';
import { lessons } from '../src/data/curriculum.js';
const final = { type:'final', model_mode:'model', result:'FAIL', target_id:'FS0801', attempt_id:'10000000-0000-4000-8000-000000000001' };

test('only final non-demo FAIL or matching PASS can change the notebook', () => {
  const expression = lessons[1].expressions[0];
  assert.equal(reviewOutcome(expression,final),'FAIL');
  for (const change of [{result:'RETRY'},{result:'CAPTURE_ERROR'},{model_mode:'demo'},{type:'prediction'},{target_id:'FS0802'},{attempt_id:''},{model_mode:null},{result:'PASS',predicted_id:'FS0802'}]) {
    assert.equal(reviewOutcome(expression,{...final,...change}),null);
  }
  assert.equal(reviewOutcome(expression,{...final,result:'PASS',predicted_id:'FS0801'}),'PASS');
  assert.equal(reviewOutcome({contentId:null},final),null);
});
test('review links open the selected expression and phase without changing the unit level', () => {
  assert.equal(reviewLessonLink(4,3,'evaluation'),'/lesson/4?level=intermediate&expression=3&phase=evaluation&review=1');
  assert.equal(initialLessonStep(lessons[1],new URLSearchParams('expression=5&phase=evaluation')),17);
  assert.equal(initialLessonStep(lessons[1],new URLSearchParams('expression=5')),5);
  for (const index of ['-1','12','NaN','99999999999999999']) assert.equal(initialLessonStep(lessons[1],new URLSearchParams(`expression=${index}&phase=evaluation`)),0);
});
test('save uses a stable attempt ID, bounded feedback, and does not save uncertain outcomes', async () => {
  const calls=[];
  const service=createReviewService({rpc:async(name,args)=>{calls.push([name,args]);return {data:{mistake_count:1}};}});
  await service.record(1,0,{...final,feedback:'x'.repeat(600)});
  assert.equal(calls[0][0],'record_review_result');
  assert.equal(calls[0][1].p_attempt_id,final.attempt_id);
  assert.equal(calls[0][1].p_feedback.length,500);
  await service.record(1,0,{...final,result:'CAPTURE_ERROR'});
  assert.equal(calls.length,1);
  await assert.rejects(createReviewService({rpc:async()=>({error:{}})}).record(1,0,final),/오답노트를 저장/);
});
