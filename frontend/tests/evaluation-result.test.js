import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resultCsv} from '../src/lib/evaluation-result.js';
test('exports a single summary row with policy and excludes raw landmarks',()=>{
 const csv=resultCsv({target_id:'WORD1191',result:'PASS',success_count:2,success_required:2,evaluation_seconds:7.2,termination_reason:'passed',finished_at:'2026-11-27T13:00:00Z',attempt_id:'attempt',server_revision:'revision',evaluation_policy:'middle-two-performances-20s-v1',frames:['private']},'좋다');
 assert.ok(csv.startsWith('\uFEFF'));
 assert.ok(csv.includes('"2","2","7.2"'));
 assert.ok(csv.includes('middle-two-performances-20s-v1'));
 assert.ok(!csv.includes('private'));
});
