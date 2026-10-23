import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthService } from '../src/lib/auth.js';
import { progressPercent, lessonLink } from '../src/lib/progress.js';

test('wrong current password cannot update the account password', async () => {
  const service = createAuthService({ auth: {
    async getUser() { return { data: { user: { email: 'member@accounts.sonmalitgi.invalid' } } }; },
    async signInWithPassword() { return { error: { code: 'invalid_credentials' } }; },
    async updateUser() { assert.fail('must not update password'); },
  } });
  await assert.rejects(service.changePassword({ currentPassword: 'wrong', password: 'NewPassword#123' }), /현재 비밀번호/);
});

test('password changes authenticate the existing account and send the current password', async () => {
  let verified = false;
  const service = createAuthService({ auth: {
    async getUser() { return { data: { user: { email: 'member@accounts.sonmalitgi.invalid' } } }; },
    async signInWithPassword(values) {
      assert.deepEqual(values, { email: 'member@accounts.sonmalitgi.invalid', password: 'OldPassword#123' });
      verified = true; return {};
    },
    async updateUser(values) {
      assert.ok(verified);
      assert.deepEqual(values, { password: 'NewPassword#123', current_password: 'OldPassword#123' });
      return {};
    },
  } });
  await service.changePassword({ currentPassword: 'OldPassword#123', password: 'NewPassword#123' });
  await assert.rejects(service.changePassword({ currentPassword: 'samePassword', password: 'samePassword' }), /다른 비밀번호/);
});

test('progress and resume links use each unit’s actual level', () => {
  assert.equal(progressPercent(null), 0);
  assert.equal(progressPercent({ completed_expressions: 1, total_expressions: 12 }), 8);
  assert.equal(progressPercent({ completed_expressions: 5, total_expressions: 5 }), 100);
  assert.equal(lessonLink(3), '/lesson/3?level=intermediate');
  assert.equal(lessonLink(6), '/lesson/6?level=advanced');
});
