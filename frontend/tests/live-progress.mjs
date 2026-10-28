// Opt in: node --env-file=.env.local tests/live-progress.mjs
// Creates synthetic users, changes only their passwords and prints IDs for admin cleanup.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createAuthService } from '../src/lib/auth.js';
import { createProgressService } from '../src/lib/progress.js';

const clients = Array.from({ length: 3 }, () => createClient(process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }));
const auth = clients.map(createAuthService);
const progress = clients.map(createProgressService);
const run = Date.now().toString(36);
const password = randomBytes(24).toString('base64url') + '!9a';
const newPassword = randomBytes(24).toString('base64url') + '!9b';
const ids = [];
try {
  for (let i = 0; i < 2; i++) {
    const result = await auth[i].signup({ name: '마이페이지 검증', username: `qa_${run}_${i}`, password });
    ids.push(result.session.user.id); console.log('CREATED_TEST_USER', result.session.user.id);
  }
  await progress[0].saveCombined(3, [], []);
  await progress[0].saveCombined(3, [0, 1], [0, 1]);
  let record = await progress[0].getUnit(3);
  assert.equal(record.expression_index, 2); assert.equal(record.completed_expressions, 2);
  await auth[0].logout();
  await auth[0].login({ username: `qa_${run}_0`, password });
  assert.equal((await progress[0].getUnit(3)).expression_index, 2);
  console.log('PASS progress persists after logout and login');
  await progress[0].saveCombined(3, [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], true);
  record = await progress[0].getUnit(3);
  assert.equal(record.completed_expressions, 5); assert.ok(record.completed_at);
  await progress[0].saveCombined(3, [], []);
  record = await progress[0].getUnit(3);
  assert.equal(record.completed_expressions, 5); assert.ok(record.completed_at);
  console.log('PASS completion and review preserve completed progress');
  await assert.rejects(progress[0].saveCombined(4, [0], [], true));
  assert.equal(await progress[1].getUnit(3), null);
  const { error: foreignWrite } = await clients[1].from('learning_progress').insert({
    user_id: ids[0], unit_id: 4, expression_index: 0, completed_expressions: 0, total_expressions: 6,
  });
  assert.ok(foreignWrite);
  const { error: foreignUpdate } = await clients[1].from('learning_progress').update({ user_id: ids[1] }).eq('user_id', ids[0]).select();
  assert.ifError(foreignUpdate);
  assert.equal((await progress[0].getAll()).length, 1);
  const { error: anonError } = await clients[2].from('learning_progress').select('*');
  assert.ok(anonError);
  console.log('PASS cross-user read/write and anonymous access restricted');
  await assert.rejects(auth[0].changePassword({ currentPassword: 'wrong', password: newPassword }), /현재 비밀번호/);
  await auth[0].changePassword({ currentPassword: password, password: newPassword });
  await auth[0].logout();
  await assert.rejects(auth[0].login({ username: `qa_${run}_0`, password }), /아이디 또는 비밀번호/);
  await auth[0].login({ username: `qa_${run}_0`, password: newPassword });
  assert.equal((await progress[0].getUnit(3)).completed_expressions, 5);
  console.log('PASS password change, old password rejection and new password login');
} finally {
  for (const service of auth) await service.logout().catch(() => {});
  console.log('CLEANUP_IDS', JSON.stringify(ids));
}
