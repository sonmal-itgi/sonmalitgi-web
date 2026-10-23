// Explicitly opt in: node --env-file=.env.local tests/live-auth.mjs
// Creates synthetic users; prints their IDs for scoped cleanup by an administrator.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createAuthService, AUTH_DOMAIN } from '../src/lib/auth.js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const clients = Array.from({ length: 3 }, () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }));
const services = clients.map(createAuthService);
const run = Date.now().toString(36);
const password = randomBytes(24).toString('base64url') + '!9a';
const ids = [];
try {
  for (let i = 0; i < 2; i++) {
    const username = `qa_${run}_${i}`;
    const result = await services[i].signup({ username, name: '자동 검증 계정', password });
    ids.push(result.session.user.id);
    console.log('CREATED_TEST_USER', result.session.user.id);
    const profile = await services[i].getProfile(result.session.user.id);
    assert.equal(profile.username, username);
    assert.equal(profile.name, '자동 검증 계정');
  }
  console.log('PASS signup and atomic profile storage');
  await assert.rejects(services[2].signup({ username: `qa_${run}_0`, name: '중복 검증', password }), /이미 사용 중/);
  await assert.rejects(services[2].login({ username: `qa_${run}_0`, password: 'wrong-password' }), /아이디 또는 비밀번호/);
  console.log('PASS duplicate username and incorrect password rejected');
  const { data: visible, error: readError } = await clients[0].from('member_profiles').select('*');
  assert.ifError(readError);
  assert.deepEqual(visible.map((row) => row.id), [ids[0]]);
  const { error: updateError } = await clients[0].from('member_profiles').update({ name: '변조' }).eq('id', ids[1]);
  assert.ok(updateError);
  const { error: anonError } = await clients[2].from('member_profiles').select('*');
  assert.ok(anonError);
  const { error: rateError } = await clients[0].rpc('consume_signup_limit', { identifier_hash: 'a'.repeat(64), address_hash: 'b'.repeat(64) });
  assert.ok(rateError);
  console.log('PASS own-profile-only RLS, anonymous read and client writes denied');
  await services[0].logout();
  const { data: { session } } = await clients[0].auth.getSession();
  assert.equal(session, null);
  await services[0].login({ username: `QA_${run.toUpperCase()}_0`, password });
  console.log('PASS logout and case-insensitive username login');
  const { error: directError } = await clients[2].auth.signUp({
    email: `qa_${run}_direct@${AUTH_DOMAIN}`, password,
    options: { data: { name: '직접 가입 차단', username: `qa_${run}_direct` } },
  });
  assert.ok(directError);
  console.log('PASS direct internal-identity signup blocked');
} finally {
  for (const service of services) await service.logout().catch(() => {});
  console.log('CLEANUP_IDS', JSON.stringify(ids));
}
